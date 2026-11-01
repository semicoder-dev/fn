import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { assert } from "./config";
import { command } from "./process";

export async function eventually<T>(
  read: () => Promise<T | undefined>,
  description: string,
  timeout = 60_000,
): Promise<T> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const value = await read();
    if (value !== undefined) return value;
    await Bun.sleep(100);
  }
  throw new Error("Timed out: " + description);
}
export class QAApplication {
  readonly executable: string;
  readonly control: string;
  readonly environment: NodeJS.ProcessEnv;
  child?: Bun.Subprocess;
  constructor(
    readonly app: string,
    readonly data: string,
  ) {
    this.executable = resolve(app, "Contents/MacOS/FIAHost");
    this.control = resolve(data, "control");
    this.environment = {
      ...process.env,
      FIA_DATA_DIRECTORY: data,
      FIA_CONTROL_DIRECTORY: this.control,
      FIA_INTERNAL_DIAGNOSTICS: "1",
      FIA_DEVELOPMENT: "0",
    };
  }
  async launch() {
    await mkdir(this.control, { recursive: true });
    await rm(resolve(this.control, "quit"), { force: true });
    await rm(resolve(this.control, "ready.json"), { force: true });
    this.child = Bun.spawn([this.executable, "--agent-background"], {
      env: this.environment,
      stdout: "ignore",
      stderr: Bun.file(resolve(this.control, "stderr.log")),
    });
    await this.ready();
  }
  async inspection() {
    return Bun.file(resolve(this.control, "ready.json"))
      .json()
      .catch(() => undefined) as Promise<
      | {
          pid: number;
          build: number;
          backend: string;
          frontendsReady: string[];
          processGroups: number[];
        }
      | undefined
    >;
  }
  async ready(build?: number) {
    return eventually(async () => {
      assert(
        this.child?.exitCode === null && this.child.signalCode === null,
        "QA application exited before readiness",
      );
      const state = await this.inspection();
      return state?.backend === "ready" &&
        state.frontendsReady.includes("main") &&
        (build === undefined || state.build === build)
        ? state
        : undefined;
    }, "native host and WebView readiness");
  }
  async cli(...args: string[]) {
    return command(
      [this.executable, "--cli", ...args],
      process.cwd(),
      this.environment,
    );
  }
  async platform(action: string, input: unknown = {}) {
    return JSON.parse(
      await this.cli(
        "call",
        "platform.command",
        "--json",
        JSON.stringify({ action, input }),
      ),
    );
  }
  async stop(force = false) {
    if (!this.child) return;
    const child = this.child;
    const groups = (await this.inspection())?.processGroups ?? [];
    if (child.exitCode === null && child.signalCode === null) {
      if (force) child.kill("SIGKILL");
      else await Bun.write(resolve(this.control, "quit"), "");
      await eventually(
        async () =>
          child.exitCode !== null || child.signalCode !== null
            ? true
            : undefined,
        "QA application exit",
        25_000,
      );
    }
    await child.exited;
    // SIGKILL may leave managed children alive until their transport closes.
    if (force)
      for (const pid of groups) {
        try {
          process.kill(-pid, "SIGKILL");
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
        }
      }
    await eventually(
      async () => {
        for (const pid of groups) {
          try {
            process.kill(-pid, 0);
            return undefined;
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
          }
        }
        return true;
      },
      "QA child process cleanup",
      25_000,
    );
    this.child = undefined;
  }
  async session() {
    const url = new URL((await this.cli("open", "--browser", "--url")).trim());
    const origin = url.origin;
    const response = await fetch(origin + "/_fia/browser/exchange", {
      method: "POST",
      headers: {
        origin,
        "content-type": "application/json",
        "x-fia-browser-bootstrap": "1",
      },
      body: JSON.stringify({ ticket: url.hash.slice(1) }),
    });
    assert(
      response.ok,
      "Could not authorize QA browser API session: " +
        response.status +
        " " +
        (response.ok ? "" : await response.text()),
    );
    const { token } = (await response.json()) as { token: string };
    const request = (
      path: string,
      body?: unknown,
      extra: Record<string, string> = {},
      signal?: AbortSignal,
    ) =>
      fetch(origin + path, {
        method: body === undefined ? "GET" : "POST",
        signal,
        headers: {
          origin,
          authorization: "Bearer " + token,
          "content-type": "application/json",
          ...extra,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    const ticketResponse = await request("/_fia/browser/socket", {
      path: "/_fia/native",
    });
    assert(ticketResponse.ok, "Could not authorize native WebSocket");
    const { url: socketURL } = (await ticketResponse.json()) as { url: string };
    // Bun supports headers on its WebSocket constructor; DOM typings omit this extension.
    const BunWebSocket = globalThis.WebSocket as unknown as new (
      url: string,
      options: { headers: Record<string, string> },
    ) => WebSocket;
    const socket = new BunWebSocket(socketURL, { headers: { origin } });
    let next = 1;
    const pending = new Map<
      number,
      {
        resolve: (value: any) => void;
        reject: (error: Error) => void;
        timer: ReturnType<typeof setTimeout>;
      }
    >();
    socket.onmessage = (event) => {
      const message = JSON.parse(String(event.data));
      const call = pending.get(message.id);
      if (!call) return;
      pending.delete(message.id);
      clearTimeout(call.timer);
      if (message.error)
        call.reject(
          new Error(message.error.message ?? JSON.stringify(message.error)),
        );
      else call.resolve(message.result);
    };
    socket.onclose = () => {
      for (const call of pending.values()) {
        clearTimeout(call.timer);
        call.reject(new Error("Native session closed during update"));
      }
      pending.clear();
    };
    await new Promise<void>((res, rej) => {
      socket.onopen = () => res();
      socket.onerror = () => rej(new Error("Native WebSocket unavailable"));
    });
    return {
      request,
      close: () => socket.close(),
      call: (method: string, params = {}, timeout = 30_000): Promise<any> =>
        new Promise((res, rej) => {
          const id = next++;
          pending.set(id, {
            resolve: res,
            reject: rej,
            timer: setTimeout(() => {
              pending.delete(id);
              rej(new Error("Native call timed out: " + method));
            }, timeout),
          });
          socket.send(
            JSON.stringify({ v: 1, type: "request", id, method, params }),
          );
        }),
    };
  }
  async journal() {
    return Bun.file(
      resolve(this.data, "com.semicoder.fn/Updates/state.json"),
    ).json();
  }
}

/** Click the real native confirmation; never patch the updater or auto-confirm callback. */
export async function confirmUpdate(pid: number) {
  await command([
    "osascript",
    "-e",
    `tell application "System Events"
    repeat 150 times
      if exists (first application process whose unix id is ${pid}) then
        tell (first application process whose unix id is ${pid})
          repeat with w in windows
            if exists button "Update Now" of w then
              click button "Update Now" of w
              return
            end if
          end repeat
        end tell
      end if
      delay 0.2
    end repeat
    error "Native update confirmation was not found"
  end tell`,
  ]);
}
