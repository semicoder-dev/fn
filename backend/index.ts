import { ChatService } from "./chat/service";
import { WebTools } from "./web";
import { Agents } from "./agent/service";
import { createAgentModel } from "./agent/model";
import { defineBackend, implementAPI } from "@semicoder/fia/backend";
import { ChatGPT } from "./chatgpt";
import { ChatGPTStorage } from "./chatgpt-storage";
import { CHATGPT_USAGE_URL } from "../shared/chatgpt";
import api from "../shared/api";
import { Appearance } from "./appearance";
import { Store } from "./store";
import { Models } from "./models";
import { Marketplaces } from "./marketplaces";
import { Plugins } from "./plugins";
import { listProviders, listPresetModels } from "./providers";

let chatgpt: ChatGPT;
let store: Store;
let appearance: Appearance;
let models: Models;
let plugins: Plugins;
let markets: Marketplaces;
let web: WebTools;
let chat: ChatService;
let agents: Agents;
export default defineBackend({
  api: implementAPI(api, {
    "agents.tools": ({ pluginId }) => plugins.use(pluginId, () => agents.catalog(pluginId)),
    "agents.create": ({ pluginId, input }) => plugins.use(pluginId, () => agents.create(pluginId, input)),
    "agents.send": ({ pluginId, sessionId, text }) => plugins.use(pluginId, () => agents.send(pluginId, sessionId, text)),
    "agents.list": ({ pluginId }) => { plugins.get(pluginId); return agents.list(pluginId); },
    "agents.get": ({ pluginId, sessionId }) => { plugins.get(pluginId); return agents.get(pluginId, sessionId); },
    "agents.events": ({ pluginId, sessionId, after }) => { plugins.get(pluginId); return agents.events(pluginId, sessionId, after); },
    "agents.cancel": ({ pluginId, sessionId }) => { plugins.get(pluginId); return agents.cancel(pluginId, sessionId); },
    "agents.remove": ({ pluginId, sessionId }) => { plugins.get(pluginId); agents.remove(pluginId, sessionId); return null; },
    "chat.snapshot": ({ pluginId, before }) => chat.snapshot(pluginId, before),
    "chat.connect": async () => {
      await chat.connect();
      return null;
    },
    "chat.sync": async () => {
      await chat.sync();
      return null;
    },
    "web.search": ({ pluginId, input }) =>
      plugins.use(pluginId, () => web.start(pluginId, "search", input)),
    "web.fetch": ({ pluginId, input }) =>
      plugins.use(pluginId, () => web.start(pluginId, "fetch", input)),
    "web.get": ({ pluginId, taskId }) => {
      plugins.get(pluginId);
      return web.get(pluginId, taskId);
    },
    "web.cancel": ({ pluginId, taskId }) => {
      plugins.get(pluginId);
      return web.cancel(pluginId, taskId);
    },
    "appearance.get": () => appearance.get(),
    "appearance.set": (input) => appearance.set(input),
    "chatgpt.status": () => chatgpt.status(),
    "chatgpt.signIn": ({ profileId, consent }) => chatgpt.signIn(profileId, consent),
    "chatgpt.cancel": ({ id }) => chatgpt.cancel(id),
    "chatgpt.select": ({ profileId }) => chatgpt.select(profileId),
    "chatgpt.rename": ({ profileId, label }) => chatgpt.rename(profileId, label),
    "chatgpt.remove": ({ profileIds }) => chatgpt.remove(profileIds),
    "chatgpt.signOut": ({ profileId }) => chatgpt.signOut(profileId),
    "chatgpt.acknowledge": ({ profileId }) => chatgpt.acknowledge(profileId),
    "chatgpt.catalog": ({ profileId }) => chatgpt.catalog(profileId),
    "chatgpt.addModel": ({ profileId, modelId }) => models.addChatGPTModel(profileId, modelId),
    "chatgpt.manageUsage": async (_, { native }) => {
      await native.system.openURL({ url: CHATGPT_USAGE_URL });
      return null;
    },
    "models.list": () => models.list(),
    "models.providers": () => listProviders(),
    "models.catalog": ({ providerId }) => listPresetModels(providerId),
    "models.save": (input) => models.save(input),
    "models.remove": async ({ id }) => {
      await models.remove(id);
      return null;
    },
    "models.generate": (input) =>
      plugins.use(input.pluginId, () => models.start(input.pluginId, input)),
    "runs.list": ({ pluginId }) => {
      plugins.get(pluginId);
      return models.listRuns(pluginId);
    },
    "runs.get": ({ pluginId, runId }) => {
      plugins.get(pluginId);
      return models.get(pluginId, runId);
    },
    "runs.cancel": ({ pluginId, runId }) => models.cancel(pluginId, runId),
    "plugins.list": () => plugins.list(),
    "plugins.invoke": ({ pluginId, method, input }) => plugins.invoke(pluginId, method, input),
    "plugins.install": ({ source }) => plugins.install(source),
    "marketplaces.list": () => markets.list(),
    "marketplaces.add": ({ name, url }) => markets.add(name, url),
    "marketplaces.update": ({ id, ...change }) => markets.update(id, change),
    "marketplaces.remove": async ({ id }) => {
      await markets.remove(id);
      return null;
    },
    "marketplaces.refresh": ({ id }) => markets.refresh(id),
    "marketplaces.catalog": (input) => markets.catalog(input, plugins.list()),
    "plugins.installFromMarket": ({ marketId, pluginId }) =>
      plugins.installFromMarket(marketId, pluginId),
    "plugins.update": ({ pluginId, source }) => plugins.update(pluginId, source),
    "plugins.jobs": () => plugins.listJobs(),
    "plugins.setEnabled": ({ pluginId, enabled }) => plugins.setEnabled(pluginId, enabled),
    "plugins.uninstall": async ({ pluginId }) => {
      await plugins.uninstall(pluginId);
      return null;
    },
    "kv.get": ({ pluginId, key }) => plugins.use(pluginId, () => store.get(pluginId, key)),
    "kv.set": ({ pluginId, key, value }) =>
      plugins.use(pluginId, async () => {
        await store.set(pluginId, key, value);
        return null;
      }),
    "kv.delete": ({ pluginId, key }) =>
      plugins.use(pluginId, async () => {
        await store.delete(pluginId, key);
        return null;
      }),
  }),
  http: {
    callbacks: {
      "/oauth/openai/callback": (request) =>
        chatgpt?.callback(request) ?? new Response("Starting", { status: 503 }),
    },
    fetch: (request) => plugins.asset(request),
  },
  async start({ app, native, emit, url }) {
    store = new Store(app.dataDirectory);
    await store.open();
    appearance = new Appearance(
      store,
      (mode) => native.application.setAppearance({ mode }),
      (value) => emit("appearance.changed", value),
    );
    await appearance.restore();
    let revision = 0;
    const credentials = new ChatGPTStorage(app.dataDirectory);
    const modelChanged = () => emit("models.changed", { revision: ++revision });
    chatgpt = new ChatGPT({
      redirectURI: url("/api/oauth/openai/callback").href,
      readSecret: () => credentials.readSecret(),
      writeSecret: (value) => credentials.writeSecret(value),
      openURL: (url) => native.system.openURL({ url }),
      changed: () => {
        emit("chatgpt.changed", { revision: ++revision });
        modelChanged();
      },
      modelCount: (profileId) =>
        store.value.models.filter((model) => model.chatgptProfileId === profileId).length,
    });
    await chatgpt.open();
    models = new Models(
      store,
      (run) =>
        emit("runs.changed", {
          pluginId: run.pluginId,
          runId: run.id,
          revision: run.revision,
          status: run.status,
        }),
      modelChanged,
      fetch,
      chatgpt,
    );
    markets = new Marketplaces(store, () => emit("marketplaces.changed", { revision: ++revision }));
    web = new WebTools(({ pluginId, id, kind, status }) =>
      emit("web.changed", { pluginId, id, kind, status }),
    );
    chat = new ChatService(
      app.dataDirectory,
      app.mode ?? "production",
      app.identifier,
      native,
      () => plugins,
      () => emit("chat.changed", { revision: ++revision }),
    );
    agents = new Agents(app.dataDirectory, models, web, id => plugins.agentTools(id), change => emit("agents.changed", change), createAgentModel(chatgpt));
    await agents.open();
    plugins = new Plugins(
      store,
      models,
      () => emit("plugins.changed", { revision: ++revision }),
      markets,
      fetch,
      web,
      (pluginId) => chat.client(pluginId),
      agents,
    );
    await plugins.open();
    void chat
      .start()
      .catch((error) => console.warn("Communication startup failed:", String(error)));
    const mode = app.mode;
    const title =
      mode === "development" ? "fn · 开发版" : mode === "preview" ? "fn · 预览版" : "fn";
    await native.windows.update({ id: "main", title, width: 1200, height: 800 });
    // FIA preserves its rightmost browser button when application items are empty.
    await native.windows.setTitlebar({ id: "main", items: [] });
  },
  beforeUpdate: () => ({
    ready: !agents.busy() && !models.busy() && !plugins.busy() && !chatgpt.busy() && !web.busy(),
    reason: "模型、网络、插件或登录任务正在运行",
  }),
  async stop() {
    chat?.stop();
    await agents?.stop();
    await web?.stop();
    await chatgpt?.stop();
    await models?.stop();
    await markets?.stop();
    await plugins?.stop();
  },
});
