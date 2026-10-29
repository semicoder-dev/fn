import { Service, type Context } from "@deepseek-ai/cordis";
import { implementAPI } from "@semicoder/fia/api";
import { join } from "node:path";
import { Document } from "@semicoder/fn-host/document";
import type {} from "@semicoder/fn-activity";
import type {} from "@semicoder/fn-rpc";
import api from "./contract.ts";
import { type AppearanceConfig, type AppearanceUpdate } from "./theme.ts";
import { parsePreferences } from "./preferences.ts";
export default class Appearance extends Service {
  static inject = ["rpc", "activity"];
  private document!: Document<AppearanceConfig>;
  constructor(ctx: Context) {
    super(ctx, "appearance");
  }
  async *[Service.init]() {
    this.document = await Document.open(
      join(this.ctx.host.dataDirectory, "appearance", "preferences.json"),
      { theme: "system" },
      parsePreferences,
    );
    yield () => this.document.close();
    await this.applyNative(this.document.value.theme);
    this.ctx.activity.watch(() => this.document.busy());
    this.ctx.rpc.register(
      "appearance",
      implementAPI(api, { get: () => this.get(), set: (input) => this.set(input) }),
    );
  }
  get(): AppearanceConfig {
    return structuredClone(this.document.value);
  }
  private applyNative(mode: AppearanceConfig["theme"]) {
    return this.ctx.host.platform.native.application.setAppearance({ mode });
  }
  async set(input: AppearanceUpdate) {
    return this.ctx.activity.run(async () => {
      const previous = this.document.value.theme;
      try {
        await this.document.update(async (draft) => {
          if (input.theme) await this.applyNative(input.theme);
          Object.assign(draft, input);
        });
      } catch (error) {
        await this.applyNative(previous);
        throw error;
      }
      const value = this.get();
      this.ctx.rpc.emit("appearance", "changed", value);
      return value;
    });
  }
}
declare module "@deepseek-ai/cordis" {
  interface Context {
    appearance: Appearance;
  }
}
