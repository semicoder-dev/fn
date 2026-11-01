import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { assert } from "./config";
import { command } from "./process";

/** Runs only in a disposable macOS Actions VM. No changes to an app, key or update URL. */
export async function startReplay(
  directory: string,
  routes: Record<string, string>,
  manifest: string,
) {
  assert(
    process.env.GITHUB_ACTIONS === "true" && process.env.RUNNER_OS === "macOS",
    "HTTPS replay trust changes are restricted to disposable macOS CI runners",
  );
  const hosts = await readFile("/etc/hosts", "utf8");
  const hostname = new URL(manifest).hostname;
  const name = "Fn-ephemeral-update-qa-" + crypto.randomUUID();
  const certificate = resolve(directory, "replay.crt"),
    key = resolve(directory, "replay.key");
  const openssl = resolve(directory, "openssl.cnf"),
    control = resolve(directory, "replay-control.json");
  await writeFile(
    openssl,
    `[req]\ndistinguished_name=dn\nx509_extensions=ext\nprompt=no\n[dn]\nCN=${name}\n[ext]\nsubjectAltName=DNS:${hostname}\nbasicConstraints=critical,CA:TRUE\nkeyUsage=critical,digitalSignature,keyCertSign\nextendedKeyUsage=serverAuth\n`,
  );
  await command([
    "openssl",
    "req",
    "-x509",
    "-newkey",
    "rsa:2048",
    "-nodes",
    "-days",
    "1",
    "-config",
    openssl,
    "-keyout",
    key,
    "-out",
    certificate,
  ]);
  const fingerprint = (
    await command([
      "openssl",
      "x509",
      "-in",
      certificate,
      "-noout",
      "-fingerprint",
      "-sha1",
    ])
  )
    .split("=")[1]!
    .replaceAll(":", "")
    .trim();
  const configuration = resolve(directory, "replay.json");
  await Bun.write(control, JSON.stringify({ fault: "none", manifest }));
  await Bun.write(
    configuration,
    JSON.stringify({
      certificate,
      key,
      routes,
      control,
      hostname,
      ready: resolve(directory, "replay-ready.json"),
    }),
  );
  let trusted = false,
    changedHosts = false,
    serverPID: number | undefined;
  async function hostsWrite(value: string) {
    const child = Bun.spawn(["sudo", "-n", "tee", "/etc/hosts"], {
      stdin: new TextEncoder().encode(value),
      stdout: "ignore",
      stderr: "pipe",
    });
    assert(
      (await child.exited) === 0,
      "Cannot install isolated replay hostname",
    );
    await command(["sudo", "-n", "dscacheutil", "-flushcache"]);
    await command(["sudo", "-n", "killall", "-HUP", "mDNSResponder"]);
  }
  async function close() {
    try {
      if (serverPID)
        await command(["sudo", "-n", "kill", "-TERM", String(serverPID)]);
    } finally {
      try {
        if (changedHosts) await hostsWrite(hosts);
      } finally {
        if (trusted)
          await command([
            "sudo",
            "-n",
            "security",
            "delete-certificate",
            "-Z",
            fingerprint,
            "/Library/Keychains/System.keychain",
          ]);
      }
    }
  }
  try {
    await command([
      "sudo",
      "-n",
      "security",
      "add-trusted-cert",
      "-d",
      "-r",
      "trustRoot",
      "-k",
      "/Library/Keychains/System.keychain",
      certificate,
    ]);
    trusted = true;
    changedHosts = true;
    await hostsWrite(hosts + `\n127.0.0.1 ${hostname} # ${name}\n`);
    const child = Bun.spawn(
      [
        "sudo",
        "-n",
        process.execPath,
        import.meta.path,
        "serve",
        configuration,
      ],
      { stdout: "ignore", stderr: Bun.file(resolve(directory, "replay.log")) },
    );
    const deadline = Date.now() + 10_000;
    while (
      !(await Bun.file(resolve(directory, "replay-ready.json")).exists())
    ) {
      assert(
        child.exitCode === null && Date.now() < deadline,
        "HTTPS replay failed to start",
      );
      await Bun.sleep(100);
    }
    serverPID = (await Bun.file(resolve(directory, "replay-ready.json")).json())
      .pid;
    return {
      close,
      set: (
        fault: "none" | "corrupt" | "interrupt",
        manifest = new URL(
          Object.keys(routes).find((url) => url.endsWith("latest.json"))!,
        ).href,
      ) => Bun.write(control, JSON.stringify({ fault, manifest })),
    };
  } catch (error) {
    await close();
    throw error;
  }
}
if (import.meta.main) {
  assert(process.argv[2] === "serve", "Private HTTPS replay server");
  const settings = await Bun.file(process.argv[3]!).json();
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 443,
    tls: { cert: Bun.file(settings.certificate), key: Bun.file(settings.key) },
    async fetch(request) {
      const url = new URL(request.url);
      if (request.method !== "GET" || url.hostname !== settings.hostname)
        return new Response("Not found", { status: 404 });
      const mode = await Bun.file(settings.control).json();
      const path =
        settings.routes[
          url.href.endsWith("latest.json") ? mode.manifest : url.href
        ];
      if (!path) return new Response("Not found", { status: 404 });
      const bytes = await Bun.file(path).bytes();
      if (!url.href.endsWith("latest.json") && mode.fault === "corrupt") {
        const corrupt = bytes.slice();
        if (corrupt.length) corrupt[0] = corrupt[0]! ^ 255;
        return new Response(corrupt);
      }
      if (!url.href.endsWith("latest.json") && mode.fault === "interrupt")
        return new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(
                bytes.subarray(0, Math.max(1, bytes.length / 2)),
              );
              controller.error(new Error("Injected network interruption"));
            },
          }),
        );
      return new Response(bytes, { headers: { "cache-control": "no-store" } });
    },
  });
  await Bun.write(settings.ready, JSON.stringify({ pid: process.pid }));
  process.on("SIGTERM", () => {
    server.stop(true);
    process.exit(0);
  });
}
