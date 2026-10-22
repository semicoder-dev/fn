import "./style.css";
import React, { useEffect, useState } from "react";
import type { Context } from "@deepseek-ai/cordis";
import { client, readAllPages } from "@semicoder/fn-sdk/client";
import { SlidersHorizontal } from "@semicoder/fn-sdk/ui";
import connectionApi from "@semicoder/fn-connections/contract";
import authApi from "@semicoder/fn-connections/login-contract";
import modelApi from "@semicoder/fn-models/contract";
import { NavigationButton } from "@semicoder/fn-ui-navigation/view";
import type {} from "@semicoder/fn-ui-settings/contract";
import ModelsPage, { type Clients } from "./page.tsx";
export const inject = [
  "settingsSlots",
  "api:connections",
  "api:auth",
  "api:models",
  "slots",
  "navigation",
  "platform",
];
function ModelSettings({ clients }: { clients: Clients }) {
  const [connections, setConnections] = useState<Awaited<ReturnType<typeof read>>>([]);
  const [error, setError] = useState("");
  const read = () =>
    readAllPages((offset, limit) => clients.connectionsApi.call("list", { offset, limit }));
  const refresh = async () => {
    setConnections(await read());
  };
  const action = async (operation: () => Promise<unknown>) => {
    try {
      await operation();
      await refresh();
    } catch (error) {
      setError(String(error));
    }
  };
  useEffect(() => {
    let alive = true;
    const update = () => {
      void read()
        .then((value) => {
          if (alive) setConnections(value);
        })
        .catch((error) => {
          if (alive) setError(String(error));
        });
    };
    const off = clients.connectionsApi.on("changed", update);
    const reconnect = clients.connectionsApi.onReconnect(update);
    update();
    return () => {
      alive = false;
      off();
      reconnect();
    };
  }, []);
  return (
    <>
      {error && <p role="alert">{error}</p>}
      <ModelsPage connections={connections} refresh={refresh} action={action} clients={clients} />
    </>
  );
}
export function apply(ctx: Context) {
  const clients = {
    connectionsApi: client(ctx, "connections", connectionApi),
    authApi: client(ctx, "auth", authApi),
    modelsApi: client(ctx, "models", modelApi),
    native: ctx.platform.native,
  };
  ctx.slots.register({ name: "fn.settings.navigation", id: "models", order: 0 }, () => (
    <NavigationButton navigation={ctx.navigation} path="settings/models" label="模型服务">
      <SlidersHorizontal size={18} />
    </NavigationButton>
  ));
  ctx.slots.register(
    { name: "fn.settings.content", key: "models", inject: () => ({ clients }) },
    ModelSettings,
  );
}
