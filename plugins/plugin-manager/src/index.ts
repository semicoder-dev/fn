import { Service, type Context } from "@deepseek-ai/cordis";
import { implementAPI } from "@semicoder/fia/api";
import type { Generation, InstallExpectation } from "@semicoder/fn-host/generations";
import type {} from "@semicoder/fn-activity";
import type {} from "@semicoder/fn-rpc";
import { profileSourceSchema, type ProfileSource } from "@semicoder/fn-host/profile";
import api from "./contract.ts";
export default class Plugins extends Service {
  static inject = ["rpc", "activity", "loader"];
  private job?: Promise<void>;
  private phase: string | null = null;
  private pending = false;
  private error: string | null = null;
  private stopping = false;
  constructor(ctx: Context) {
    super(ctx, "plugins");
  }
  private get installation() {
    const value = this.ctx.host.installation;
    if (!value) throw new Error("Package installation is unavailable in this host");
    return value;
  }
  async *[Service.init]() {
    const { manager } = this.installation;
    const state = await manager.status();
    this.pending = !!state.pendingId;
    this.error = state.lastError ?? null;
    manager.options.progress = (phase) => {
      this.phase = phase;
      this.changed();
    };
    yield async () => {
      this.stopping = true;
      manager.options.progress = undefined;
      await this.job;
    };
    this.ctx.activity.watch(() => !!this.job);
    this.ctx.on("host/ready", async () => {
      const state = await manager.status();
      this.pending = !!state.pendingId;
      this.error = state.lastError ?? null;
      this.changed();
    });
    this.ctx.rpc.register(
      "plugins",
      implementAPI(api, {
        status: () => this.status(),
        list: () => this.list(),
        profile: () => structuredClone(this.installation.active.manifest.profile),
        configure: (input) => {
          this.configure(input);
          return null;
        },
        install: ({ source }) => {
          this.install(source);
          return null;
        },
        update: ({ id }) => {
          const plugin = this.list().find((plugin) => plugin.id === id);
          if (!plugin?.origin) throw new Error("插件缺少安装来源，请从地址安装新版");
          this.install(plugin.origin.source, { updating: plugin, origin: plugin.origin });
          return null;
        },
        remove: ({ id }) => {
          this.stage(() => manager.stageRemove(id));
          return null;
        },
        activate: () => {
          this.error = null;
          void this.activate();
          return null;
        },
        reload: async (input) => {
          if (
            this.ctx.host.platform.app.mode !== "development" ||
            input.epoch !== this.ctx.host.epoch
          )
            return { accepted: false, reason: "开发实例已改变" };
          if (this.job || this.ctx.activity.busy())
            return { accepted: false, reason: "等待任务空闲" };
          this.stage(async () => manager.stageSeed(await this.installation.seed(input.seedId)));
          return { accepted: true };
        },
      }),
    );
    // Prepare updated bundled code outside the startup deadline; a failed candidate stays recoverable.
    const upgrade = setTimeout(() => {
      if (
        !this.stopping &&
        !this.pending &&
        !this.error &&
        this.installation.active.manifest.seedId !== this.installation.bundledSeedId
      )
        this.stage(async () =>
          manager.stageSeed(await this.installation.seed(this.installation.bundledSeedId)),
        );
    }, 0);
    this.ctx.effect(() => () => clearTimeout(upgrade));
    const timer = setInterval(() => {
      void this.activate();
    }, 500);
    timer.unref();
    this.ctx.effect(() => () => clearInterval(timer));
  }
  list() {
    return this.installation.active.plugins.map(
      ({ archive: _archive, storage: _storage, dependencyLockSha256: _lock, ...plugin }) => plugin,
    );
  }
  status() {
    const { active } = this.installation;
    return {
      epoch: this.ctx.host.epoch,
      seedId: active.manifest.seedId,
      generationId: active.id,
      busy: this.ctx.activity.busy(),
      installing: !!this.job,
      phase: this.phase,
      pending: this.pending,
      error: this.error,
    };
  }
  configure(input: ProfileSource) {
    const source = profileSourceSchema.parse(input);
    this.stage(() => this.installation.manager.stageProfile(source));
  }
  install(source: string, options: InstallExpectation = {}) {
    this.stage(() => this.installation.manager.stageInstall(source, options));
  }
  stage(operation: () => Promise<Generation>) {
    this.ctx.activity.assertAccepting();
    if (this.job || this.stopping) throw new Error("已有插件准备任务正在运行");
    this.error = null;
    this.phase = "download";
    this.job = Promise.resolve()
      .then(operation)
      .then(() => {
        this.pending = true;
      })
      .catch((error) => {
        this.error = String(error).slice(0, 2000);
      })
      .finally(() => {
        this.job = undefined;
        this.phase = null;
        this.changed();
      });
    this.changed();
  }
  private async activate() {
    if (this.stopping || this.job || !this.pending || this.error || this.ctx.activity.busy())
      return;
    try {
      await this.installation.manager.activateWhenIdle();
    } catch (error) {
      this.error = String(error).slice(0, 2000);
      this.changed();
    }
  }
  private changed() {
    this.ctx.rpc.emit("plugins", "changed", {});
  }
}
declare module "@deepseek-ai/cordis" {
  interface Context {
    plugins: Plugins;
  }
}
