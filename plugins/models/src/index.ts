import { Service, type Context } from "@deepseek-ai/cordis";
import { implementAPI } from "@semicoder/fia/api";
import { join } from "node:path";
import { Document } from "@semicoder/fn-host/document";
import { boundedPage } from "@semicoder/fn-host/pagination";
import type {} from "@semicoder/fn-connections/service";
import type {} from "@semicoder/fn-activity";
import type {} from "@semicoder/fn-rpc";
import api, { savedModel } from "./contract.ts";
export type SavedModel = { id: string; name: string; connectionId: string };
export default class Models extends Service {
  static inject = ["connections", "rpc", "activity"];
  private document!: Document<SavedModel[]>;
  constructor(ctx: Context) {
    super(ctx, "models");
  }
  async *[Service.init]() {
    this.document = await Document.open(
      join(this.ctx.host.dataDirectory, "models", "selected.json"),
      [],
      (value) => savedModel.array().parse(value),
    );
    yield () => this.document.close();
    this.ctx.activity.watch(() => this.document.busy());
    this.ctx.rpc.register(
      "models",
      implementAPI(api, {
        saved: ({ offset, limit }) => boundedPage(this.list(), offset, limit),
        select: async (input) => {
          await this.select(input);
          return null;
        },
      }),
    );
  }
  list(): SavedModel[] {
    const ids = new Set(this.ctx.connections.list().map((connection) => connection.id));
    return this.document.value
      .filter((model) => ids.has(model.connectionId))
      .map((model) => ({ ...model }));
  }
  async select({
    connectionId,
    modelId,
    selected,
  }: {
    connectionId: string;
    modelId: string;
    selected: boolean;
  }) {
    await this.ctx.activity.run(async () => {
      const model = selected
        ? (await this.ctx.connections.listModels(connectionId)).find(
            (model) => model.id === modelId,
          )
        : undefined;
      if (selected && !model) throw new Error("模型不在此连接的可用目录中，请刷新目录");
      await this.document.update((models) => {
        const index = models.findIndex(
          (model) => model.connectionId === connectionId && model.id === modelId,
        );
        if (index !== -1) models.splice(index, 1);
        if (model) models.push({ connectionId, id: model.id, name: model.name ?? model.id });
      });
      this.ctx.rpc.emit("models", "changed", {});
      this.ctx.emit("fn/models-change");
    });
  }
}
declare module "@deepseek-ai/cordis" {
  interface Context {
    models: Models;
  }
  interface Events {
    "fn/models-change"(): void;
  }
}
