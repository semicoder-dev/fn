import { scopeOf } from "@deepseek-ai/dsh-scope";
import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { createAPIRegistry } from "@semicoder/fia/api";
import { openHost, type HostEnvironment, type Profile } from "../src/index.ts";
import source from "../../../profiles/default.json";
import experimental from "../../../profiles/chat-experimental.json";
import { resolveProfile } from "../src/profile.ts";
const profiles = await Promise.all(
  [source, experimental].map((value) =>
    resolveProfile(value, resolve(import.meta.dir, "../../../profiles")),
  ),
);

test.each([false, true])(
  "profile experimentalChat=%s activates only its selected product services",
  async (experimentalChat) => {
    const profile = profiles[experimentalChat ? 1 : 0]!;
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
      if (experimentalChat) {
        expect(host.ctx.chat.list()).toEqual([{ targetId: "chat", name: "Chat" }]);
        const target = host.ctx.sessionController.target("chat");
        expect(target.context.tools.get("read_file", scopeOf(target.context))).toBeDefined();
      } else {
        expect(host.ctx.get("chat")).toBeUndefined();
        expect(host.ctx.get("cards")).toBeUndefined();
        expect(host.ctx.sessionController.listTargets()).toEqual([]);
        expect(
          Object.keys(api.contract.methods).some((name) => /^(chat|cards|cloudkit)\./.test(name)),
        ).toBe(false);
        expect(profile.client.some((entry) => /chat|cloudkit/.test(entry.name))).toBe(false);
      }
      expect(Object.keys(api.contract.methods)).toContain("sessions.send");
      expect(Object.keys(api.contract.methods)).not.toContain("kv.get");

      expect(host.ctx.tools.get("read_file")).toBeUndefined();
      await host.close();
      expect(Object.keys(api.contract.methods)).toEqual([]);
    } finally {
      await host?.close();
      await api.dispose();
      await rm(dataDirectory, { recursive: true, force: true });
    }
  },
  15000,
);
