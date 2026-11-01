import { mkdtemp, cp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { validatePackage } from "./check.ts";
import { retryRegistryInstall } from "./registry-retry.ts";

// Download anonymously and compare against the exact CI-tested archives.
const dependencies: Record<string, string> = {
  react: "19.2.7",
  "react-dom": "19.2.7",
  "@types/bun": "1.4.0",
  "@types/react": "19.2.17",
  "@types/react-dom": "19.2.3",
  typescript: "7.0.2",
};
for (const filename of process.argv.slice(2)) {
  const bytes = await Bun.file(resolve(filename)).bytes();
  const files = await new Bun.Archive(bytes).files();
  const pkg = JSON.parse(await files.get("package/package.json")!.text());
  validatePackage(pkg, pkg.name === "@semicoder/fn-sdk" ? "sdk" : "ui");
  const integrity =
    "sha512-" + new Bun.CryptoHasher("sha512").update(bytes).digest("base64");
  let verified = false;
  for (let attempt = 0; attempt < 12; attempt++) {
    const response = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/${pkg.version}`,
      { cache: "no-store", signal: AbortSignal.timeout(30000) },
    );
    if (response.ok) {
      const metadata = (await response.json()) as {
        dist: { integrity: string; tarball: string };
      };
      if (metadata.dist.integrity !== integrity)
        throw new Error("Public integrity mismatch: " + pkg.name);
      const url = new URL(metadata.dist.tarball);
      if (url.origin !== "https://registry.npmjs.org")
        throw new Error("Unexpected registry archive URL");
      const archive = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (
        !archive.ok ||
        !Buffer.from(await archive.arrayBuffer()).equals(Buffer.from(bytes))
      )
        throw new Error("Public bytes mismatch: " + pkg.name);
      verified = true;
      break;
    }
    if (response.status !== 404)
      throw new Error("Registry unavailable: " + response.status);
    await Bun.sleep(5000);
  }
  if (!verified)
    throw new Error("Published version is not visible: " + pkg.name);
  dependencies[pkg.name] = pkg.version;
  console.log(`Verified public ${pkg.name}@${pkg.version}`);
}
if (!dependencies["@semicoder/fn-sdk"] || !dependencies["@semicoder/fn-ui"])
  throw new Error("Both SDK and UI archives required");
const directory = await mkdtemp(join(tmpdir(), "fn-public-consumer-"));
try {
  await Bun.write(
    join(directory, "package.json"),
    JSON.stringify({
      name: "fn-public-consumer",
      private: true,
      type: "module",
      dependencies,
    }),
  );
  await cp(
    new URL("plugin-smoke.fixture.ts", import.meta.url),
    join(directory, "smoke.ts"),
  );
  // npm's version endpoint and install index may become visible at different times.
  // A fresh, private cache prevents a failed first resolution from poisoning retries.
  await retryRegistryInstall(async (attempt) => {
    const child = Bun.spawn([process.execPath, "install", "--ignore-scripts"], {
      cwd: directory,
      env: {
        ...process.env,
        BUN_INSTALL_CACHE_DIR: join(directory, `cache-${attempt}`),
      },
      stdout: "inherit",
      stderr: "inherit",
    });
    const succeeded = (await child.exited) === 0;
    if (!succeeded)
      console.log(`Public install attempt ${attempt + 1}/12 failed`);
    return succeeded;
  });
  const smoke = Bun.spawn([process.execPath, "smoke.ts"], {
    cwd: directory,
    stdout: "inherit",
    stderr: "inherit",
  });
  if (await smoke.exited)
    throw new Error("Public SDK/UI independent application build failed");
  console.log("Public SDK/UI independent application build passed");
} finally {
  await rm(directory, { recursive: true, force: true });
}
