import { SessionId } from "@deepseek-ai/dsh-session";
import type { Context } from "@deepseek-ai/cordis";
import { implementAPI } from "@semicoder/fia/api";
import { join } from "node:path";
import type {} from "@semicoder/fn-host";
import type {} from "@semicoder/fn-activity";
import type {} from "@semicoder/fn-rpc";
import { ConnectionService, type ConnectionInfo, type ConnectionProfile } from "./service.ts";
import { ConnectionLogin } from "./login.ts";
import api, { runtimeConnection } from "./contract.ts";
import loginApi from "./login-contract.ts";
import { boundedPage } from "@semicoder/fn-host/pagination";
export const name = "fn-connections";
export const inject = ["llm", "rpc", "activity", "agents"];
export async function apply(ctx: Context) {
  await ctx.plugin(ConnectionService, {
    dataDirectory: join(ctx.host.dataDirectory, "connections"),
    isSessionBusy: (id) => ctx.agents.get(SessionId(id))?.status === "running",
  });
  await ctx.inject(["connections"], (scope) => {
    const service = scope.connections;
    const changed = () => {
      scope.rpc.emit("connections", "changed", {});
      scope.rpc.emit("auth", "changed", {});
    };
    const login = new ConnectionLogin(
      service,
      async (url) => {
        await scope.host.platform.native.system.openURL({ url });
      },
      changed,
    );
    const summary = (value: ConnectionInfo) =>
      runtimeConnection.parse({
        ...value,
        profile:
          typeof value.profile.baseURL === "string"
            ? { baseURL: value.profile.baseURL.slice(0, 4096) }
            : {},
      });
    scope.activity.watch(
      () => service.isBusy() || login.list().some((value) => value.status === "running"),
    );
    scope.rpc.register(
      "connections",
      implementAPI(api, {
        providers: () =>
          service.auth
            .providers()
            .map((provider) => ({
              ...provider,
              modelCount: provider.modelCount ?? 0,
              dynamic: provider.dynamic ?? false,
            })),
        presets: ({ provider, offset, limit }) =>
          boundedPage(
            service.auth
              .presetModels(provider)
              .map((model) => ({ id: model.id, name: model.name })),
            offset,
            limit,
          ),
        refresh: async ({ id }) => {
          await service.refreshModels(id);
          changed();
          return null;
        },
        list: ({ offset, limit }) => boundedPage(service.list().map(summary), offset, limit),
        create: async (input) => {
          const value = await service.create({
            ...input,
            profile: input.profile as ConnectionProfile,
          });
          changed();
          return summary(value);
        },
        rename: async ({ id, name }) => {
          const value = await service.update(id, { name });
          changed();
          return summary(value);
        },
        remove: async ({ id }) => {
          await service.remove(id);
          changed();
          return null;
        },
        setKey: async ({ id, key }) => {
          await service.setApiKey(id, key);
          changed();
          return null;
        },
        models: async ({ id, offset, limit }) =>
          boundedPage(
            (await service.listModels(id)).map((model) => ({
              id: model.id,
              name: model.name ?? model.id,
            })),
            offset,
            limit,
          ),
      }),
    );
    scope.rpc.register(
      "auth",
      implementAPI(loginApi, {
        start: ({ connectionId }) => login.start(connectionId),
        list: () => login.list(),
        reply: ({ id, promptId, value }) => {
          login.reply(id, promptId, value);
          return null;
        },
        cancel: async ({ id }) => {
          await login.cancel(id);
          return null;
        },
        logout: async ({ connectionId }) => {
          await service.auth.logout(connectionId);
          changed();
          return null;
        },
      }),
    );
    scope.effect(() => () => login.close());
  });
}
