import { Service, type Context } from "@deepseek-ai/cordis";
import type {} from "@semicoder/fn-sdk/client";
/** FIA owns automatic checks, signatures, download and installation. */
export default class Updates extends Service {
  static inject = ["platform"];
  constructor(ctx: Context) {
    super(ctx, "appUpdates");
  }
  get native() {
    return this.ctx.platform.native;
  }
}
declare module "@deepseek-ai/cordis" {
  interface Context {
    appUpdates: Updates;
  }
}
