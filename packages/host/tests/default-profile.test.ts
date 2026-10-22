import { scopeOf } from "@deepseek-ai/dsh-scope";
import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { createAPIRegistry } from "@semicoder/fia/api";
import { openHost, type HostEnvironment, type Profile } from "../src/index.ts";
import source from "../../../profiles/default.json";
import { resolveProfile } from "../src/profile.ts";
const profile = await resolveProfile(source, resolve(import.meta.dir, "../../../profiles"));

test("default profile activates original kernel, private targets and revocable product APIs", async () => {
  const dataDirectory = await mkdtemp(join(tmpdir(), "fn-profile-"));
  const api = createAPIRegistry();
  const environment = {
    dataDirectory,
    codeDirectory: resolve(import.meta.dir, "../../.."),
    epoch: "test",
    api,
    platform: {
      emit() {},
      app: { mode: "development", identifier: "test.fn" },
      native: {
        application: { async setAppearance() {} },
        on() {
          return () => {};
        },
      },
    },
  } as unknown as HostEnvironment;
  let host: Awaited<ReturnType<typeof openHost>> | undefined;
  try {
    host = await openHost(environment, {
      ...profile,
      plugins: profile.plugins.filter(
        (entry) => !["plugin-manager", "plugin-market"].includes(entry.id),
      ),
    } as Profile);
    expect(host.ctx.chat.list()).toEqual([{ targetId: "chat", name: "Chat" }]);
    expect(Object.keys(api.contract.methods)).toContain("sessions.send");
    expect(Object.keys(api.contract.methods)).not.toContain("kv.get");
    const target = host.ctx.sessionController.target("chat");
    expect(target.context.tools.get("read_file", scopeOf(target.context))).toBeDefined();
    expect(host.ctx.tools.get("read_file")).toBeUndefined();
    await host.close();
    expect(Object.keys(api.contract.methods)).toEqual([]);
  } finally {
    await host?.close();
    await api.dispose();
    await rm(dataDirectory, { recursive: true, force: true });
  }
}, 15000);
