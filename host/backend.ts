import { planHotUpdate } from "../packages/host/src/hot-update.ts";
import { ActivationClients } from "./activation-clients.ts";
import { defineBackend, type BackendContext } from "@semicoder/fia/backend";
import { createAPIRegistry, implementAPI } from "@semicoder/fia/api";
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import {
  GenerationManager,
  materializeRuntimeSeed,
  type Generation,
  type SeedManifest,
} from "../packages/host/src/generations.ts";
import { clientAssets } from "../packages/host/src/client-assets.ts";
import type { openHost, HostEnvironment } from "../packages/host/src/index.ts";
import contract from "./contract.ts";
const registry = createAPIRegistry();
const epoch = crypto.randomUUID();
let instance: Awaited<ReturnType<typeof openHost>> | undefined;
let manager: GenerationManager;
let active: Generation;
let context: BackendContext;
let assets: Awaited<ReturnType<typeof clientAssets>> | undefined;
let seed: (expectedId?: string) => Promise<string>;
let error: string | null = null;
let stopping = false;
let restarting = false;
let updating = false;
let hotUpdates = 0;
let initialReady = false;
const clients = new ActivationClients();
const assetHistory = new Map<string, NonNullable<typeof assets>>();
let recovering = false;
const activity = () =>
  instance?.ctx.get("activity") as
    | { busy(): boolean; drain(): boolean; accepting: boolean }
    | undefined;
async function restart() {
  if (restarting || stopping) throw new Error("Host is already restarting");
  const work = activity();
  if (work && !work.drain()) throw new Error("任务正在运行，等待空闲后重启");
  restarting = true;
  try {
    await context.restart();
  } catch (error) {
    restarting = false;
    if (work) work.accepting = true;
    throw error;
  }
}
registry.register(
  "host",
  implementAPI(contract, {
    ready: async (input) => {
      if (input.epoch !== epoch || !instance || restarting || stopping)
        throw new Error("Host generation changed");
      if (input.generationId !== active.id) throw new Error("Host composition changed");
      clients.touch(input.clientId, input.generationId);
      if (!updating) {
        await manager.confirmActivation();
        if (!initialReady) {
          initialReady = true;
          await instance.ctx.parallel("host/ready");
        }
      }
      return null;
    },
    updateFailed: (input) => {
      if (input.epoch !== epoch) throw new Error("Host process changed");
      clients.touch(input.clientId, input.generationId, input.error);
      return null;
    },
    status: () => ({ ready: !!instance, epoch, error, namespaces: registry.namespaces }),
    recover: ({ mode }) => {
      if (!manager || recovering || restarting || updating || stopping || activity()?.busy())
        throw new Error("等待任务空闲后恢复");
      if (activity() && !activity()!.drain()) throw new Error("等待任务空闲后恢复");
      recovering = true;
      // The response completes before FIA closes the API registry.
      setTimeout(() => {
        void (async () => {
          if (mode === "previous") {
            await manager.restorePrevious();
            await restart();
          } else {
            // Roll back an unconfirmed UI before staging the default profile.
            await manager.rollbackActivation();
            const directory = await seed();
            const manifest = JSON.parse(
              await readFile(join(directory, "seed.json"), "utf8"),
            ) as SeedManifest;
            if (!manifest.profile) throw new Error("Default profile is missing");
            await manager.stageProfile(manifest.profile);
            await manager.activateWhenIdle();
          }
        })().catch((caught) => {
          error = String(caught);
          recovering = false;
          const work = activity();
          if (work) work.accepting = true;
        });
      }, 0);
      return null;
    },
  }),
);
export default defineBackend({
  api: registry,
  http: {
    fetch: (request) => {
      const path = new URL(request.url).pathname;
      if (path === "/plugins/boot")
        return assets && instance
          ? Response.json({ ...assets.payload, namespaces: registry.namespaces })
          : Response.json({ error: error ?? "后台正在启动" }, { status: 503 });
      if (path.startsWith("/plugin-assets/")) {
        const generation = path.split("/")[2]!;
        return (
          assetHistory.get(generation)?.fetch(request) ?? new Response("Not found", { status: 404 })
        );
      }
      return new Response("Not found", { status: 404 });
    },
  },
  async start(platform) {
    context = platform;
    registry.subscribe((namespaces) => {
      if (!stopping && !updating) platform.emit("host.apis", { namespaces });
    });
    const dataDirectory = join(platform.app.dataDirectory, "plugins-v1");
    seed = async (expectedId) => {
      const metadata = join(platform.app.runtimeDirectory, "resources/runtime-seed.json");
      if (expectedId && JSON.parse(await readFile(metadata, "utf8")).id !== expectedId)
        throw new Error("开发产物已更新");
      return materializeRuntimeSeed({
        archive: join(platform.app.runtimeDirectory, "resources/runtime-seed.tgz"),
        metadata,
        dataDirectory,
      });
    };
    const bundledSeedId = JSON.parse(
      await readFile(join(platform.app.runtimeDirectory, "resources/runtime-seed.json"), "utf8"),
    ).id as string;
    manager = new GenerationManager({
      dataDirectory,
      seedDirectory: join(dataDirectory, "runtime", "unmaterialized"),
      busy: () => activity()?.busy() ?? false,
      restart,
      hotActivate: async (next, previous) => {
        const plan = planHotUpdate(previous, next);
        if (plan.reason || hotUpdates >= 32 || !instance || typeof instance.update !== "function")
          return false;
        const work = activity();
        if (work && !work.drain()) return false;
        updating = true;
        const candidateAssets = await clientAssets(
          next.directory,
          next.id,
          epoch,
          next.manifest.profile,
        );
        // Failure after this point requires a clean process. GenerationManager restores its durable pointer.
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([
            instance.update(next.directory, next.manifest.profile, plan.changed),
            new Promise<never>((_, reject) => {
              timer = setTimeout(() => reject(new Error("插件释放或启动超时")), 15_000);
            }),
          ]);
        } finally {
          clearTimeout(timer);
        }
        active = next;
        if (instance.ctx.host.installation) instance.ctx.host.installation.active = next;
        assets = candidateAssets;
        assetHistory.set(next.id, candidateAssets);
        const acknowledged = clients.wait(next.id);
        platform.emit("host.composition", { generationId: next.id });
        await acknowledged;
        hotUpdates++;
        return true;
      },
      activated: async () => {
        updating = false;
        const work = activity();
        if (work) work.accepting = true;
        await instance?.ctx.parallel("host/ready");
      },
    });
    try {
      if (!(await manager.current())) manager.options.seedDirectory = await seed();
      active = await manager.initialize();
      async function startGeneration(generation: Generation) {
        const module = (await import(
          /* @vite-ignore */ pathToFileURL(generation.runtimeEntry).href
        )) as { openHost: typeof openHost };
        const loaded = await module.openHost(
          {
            dataDirectory,
            codeDirectory: generation.directory,
            epoch,
            api: registry,
            platform,
            installation: { manager, active: generation, bundledSeedId, seed },
          },
          generation.manifest.profile,
        );
        try {
          assets = await clientAssets(
            generation.directory,
            generation.id,
            epoch,
            generation.manifest.profile,
          );
        } catch (error) {
          await loaded.close();
          throw error;
        }
        assetHistory.set(generation.id, assets!);
        instance = loaded;
      }
      try {
        await startGeneration(active);
      } catch (failure) {
        const previous = await manager.rollbackActivation();
        if (!previous || previous.id === active.id) throw failure;
        active = previous;
        await startGeneration(active);
      }
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
      console.error("Plugin composition failed:", caught);
    }
  },
  beforeUpdate() {
    if (activity()?.busy()) return { ready: false, reason: "等待插件任务完成" };
    return { ready: true };
  },
  async stop() {
    stopping = true;
    const work = activity();
    if (work) work.accepting = false;
    try {
      await instance?.close();
    } finally {
      instance = undefined;
      await registry.dispose();
    }
  },
});
