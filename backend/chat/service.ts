import { randomUUID } from "node:crypto";
import { hostname } from "node:os";
import { join } from "node:path";
import type { BackendRouteContext, CloudKitScope } from "@semicoder/fia/backend";
import { z } from "@semicoder/fia/api";
import {
  botSchema,
  hostSchema,
  conversationId,
  defaultRequestTTL,
  type ChatClient,
  type ChatItem,
} from "../../shared/chat/protocol";
import { ChatStore } from "./store";
import { ChatEngine, cloudRecord, errorReason, type ChatTransport } from "./engine";
import { ChatRunner } from "./runner";
import type { Plugins } from "../plugins";
const configSchema = z.strictObject({
  container: z.string().regex(/^iCloud\.[A-Za-z0-9.-]+$/),
  name: z.string().min(1).max(80),
});
export class ChatService {
  private store?: ChatStore;
  private engine?: ChatEngine;
  private runner?: ChatRunner;
  private scope?: CloudKitScope;
  private generation = 0;
  private stopped = false;
  private timer?: ReturnType<typeof setTimeout>;
  private off?: () => void;
  private connecting?: Promise<void>;
  private working?: Promise<void>;
  private reconnect = false;
  private failures = 0;
  private requested = false;
  private status = "尚未配置聊天同步";
  private lastSync: number | null = null;
  constructor(
    private root: string,
    private mode: string,
    private bundleId: string,
    private native: BackendRouteContext["native"],
    private plugins: () => Plugins,
    private changed: () => void,
  ) {}
  snapshot(pluginId?: string, before?: string) {
    const store = this.store,
      hostId = store?.deviceId;
    const hostRecord = store?.get("host:" + hostId);
    return {
      connected: !!this.engine,
      status: this.status,
      hostId: hostId ?? null,
      lastSync: this.lastSync,
      pending: store?.pending().length ?? 0,
      unsupported: store?.unsupported().length ?? 0,
      failures: store?.failures() ?? [],
      host: hostRecord ? hostSchema.parse(JSON.parse(hostRecord.payload)) : null,
      bots: (store?.list("FnChatBot") ?? [])
        .map((r) => botSchema.parse(JSON.parse(r.payload)))
        .filter((b) => b.hostId === hostId),
      ...this.page(pluginId, before, 30),
    };
  }
  private page(pluginId?: string, before?: string, limit = 20) {
    const engine = this.engine;
    let messages = (engine?.messages() ?? [])
      .filter((m) => m.hostId === this.store?.deviceId && (!pluginId || m.pluginId === pluginId))
      .reverse();
    if (before) {
      const i = messages.findIndex((m) => m.id === before);
      messages = i < 0 ? [] : messages.slice(i + 1);
    }
    const items: ChatItem[] = [];
    let size = 0;
    for (const m of messages) {
      const item = {
        message: m,
        state: m.kind === "request" ? engine!.state(m.id) : undefined,
        delivery: engine!.delivery(m.id),
      };
      const bytes = Buffer.byteLength(JSON.stringify(item));
      if (items.length >= limit || size + bytes > 400_000) break;
      items.push(item);
      size += bytes;
    }
    return {
      items,
      ...(items.length < messages.length && items.length ? { next: items.at(-1)!.message.id } : {}),
    };
  }
  async start() {
    this.off = this.native.on?.("cloudKit.changed", (payload) => {
      if ((payload as { reason?: string }).reason === "accountChanged") {
        this.isolate();
        this.reconnect = true;
        void this.connect();
      } else void this.sync();
    });
    if (await Bun.file(join(this.root, "communication-config.json")).exists()) await this.connect();
  }
  private isolate() {
    ++this.generation;
    clearTimeout(this.timer);
    this.engine?.stop();
    this.runner?.stop();
    const old = this.store,
      runner = this.runner,
      work = this.working;
    this.store = undefined;
    this.engine = undefined;
    this.runner = undefined;
    this.scope = undefined;
    this.working = undefined;
    this.lastSync = null;
    void Promise.allSettled([work, runner?.settled()]).then(() => old?.close());
    this.changed();
  }
  stop() {
    this.stopped = true;
    this.off?.();
    this.isolate();
  }
  async connect() {
    if (this.stopped) return;
    if (this.connecting) return this.connecting;
    this.reconnect = false;
    this.connecting = this.connectOnce()
      .catch((e) => {
        this.isolate();
        this.status = String(e instanceof Error ? e.message : e);
        this.changed();
        if (!this.stopped) this.timer = setTimeout(() => void this.connect(), 60_000);
      })
      .finally(() => {
        this.connecting = undefined;
        if (this.reconnect && !this.stopped) void this.connect();
      });
    return this.connecting;
  }
  private async connectOnce() {
    const file = Bun.file(join(this.root, "communication-config.json"));
    if (!(await file.exists())) {
      this.status = "请按开发指南配置 CloudKit 签名和通信配置";
      this.changed();
      return;
    }
    const config = configSchema.parse(await file.json());
    if (
      !["development", "preview", "production"].includes(this.mode) ||
      !config.container.endsWith(this.mode === "production" ? ".production" : ".development")
    )
      throw new Error("CloudKit 容器与实例环境不匹配");
    const epoch = this.generation,
      check = () => {
        if (epoch !== this.generation || this.stopped) throw new Error("账号已变化");
      };
    const account = await this.native.cloudKit.account({ container: config.container });
    check();
    if (!account.accountKey) throw new Error("请在系统设置登录 iCloud");
    if (this.scope?.accountKey === account.accountKey) {
      await this.sync();
      return;
    }
    const scope = {
      container: config.container,
      accountKey: account.accountKey,
      zone: `fn-chat-${this.mode}-v2`,
    };
    await this.native.cloudKit.ensureZone(scope);
    check();
    const store = ChatStore.open(this.root, this.mode, config.container, account.accountKey);
    const transport: ChatTransport = {
      read: async (id) => {
        check();
        try {
          const r = await this.native.cloudKit.read({ scope, id });
          check();
          return r;
        } catch (e) {
          if (errorReason(e) === "unknownItem") return undefined;
          throw e;
        }
      },
      commit: async (records) => {
        check();
        const r = await this.native.cloudKit.commit({ scope, records, deletedIDs: [] });
        check();
        return r;
      },
      changes: async (token) => {
        check();
        const r = await this.native.cloudKit.changes({ scope, token });
        check();
        return r;
      },
    };
    this.store = store;
    this.scope = scope;
    this.engine = new ChatEngine(store, transport, () => this.changed());
    this.runner = new ChatRunner(this.engine, this.plugins(), () => {
      this.changed();
      this.requested = true;
      if (!this.stopped) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => void this.sync(), 100);
      }
    });
    const h = cloudRecord(
      "FnChatHost",
      {
        protocolVersion: 2,
        id: store.deviceId,
        name: config.name || hostname().slice(0, 80),
        role: "host",
        updatedAt: Date.now(),
      },
      await transport.read("host:" + store.deviceId),
    );
    store.acknowledge("", await transport.commit([h]));
    await this.native.cloudKit.unsubscribe({ scope, id: "fn-messages-" + this.bundleId });
    check();
    await this.native.cloudKit.subscribeZone({
      scope,
      id: `fn-chat-v2-host-${this.bundleId}-${this.mode}`,
    });
    check();
    await this.native.cloudKit.registerPush();
    check();
    await this.sync();
  }
  async sync() {
    if (this.stopped) return;
    if (!this.engine) {
      if (!this.connecting) await this.connect();
      return;
    }
    if (this.working) {
      this.requested = true;
      return this.working;
    }
    this.requested = false;
    const epoch = this.generation,
      engine = this.engine,
      runner = this.runner!,
      store = this.store!;
    let retry = 0;
    this.working = (async () => {
      await engine.sync();
      if (epoch !== this.generation) return;
      const catalog = this.plugins().chatCatalog();
      for (const r of store.list("FnChatBot")) {
        const old = botSchema.parse(JSON.parse(r.payload));
        if (old.hostId === store.deviceId && !catalog.some((b) => b.pluginId === old.pluginId))
          catalog.push({ ...old, enabled: false });
      }
      for (const bot of catalog) {
        const value = {
          protocolVersion: 2 as const,
          ...bot,
          hostId: store.deviceId,
          conversationId: conversationId(store.deviceId, bot.pluginId),
          updatedAt: Date.now(),
        };
        const key = "bot:" + store.deviceId + ":" + bot.pluginId,
          previous = await engine.transport.read(key);
        if (previous) {
          const old = JSON.parse(previous.fields.payload!);
          if (
            JSON.stringify({ ...old, updatedAt: 0 }) === JSON.stringify({ ...value, updatedAt: 0 })
          )
            continue;
        }
        try {
          store.acknowledge(
            "",
            await engine.transport.commit([cloudRecord("FnChatBot", value, previous)]),
          );
        } catch (e) {
          if (errorReason(e) !== "serverRecordChanged") throw e;
        }
      }
      if (epoch !== this.generation) return;
      await engine.expireRequests(store.deviceId);
      await runner.scan();
      if (epoch !== this.generation) return;
      this.status = "同步成功";
      this.lastSync = Date.now();
      this.failures = 0;
    })()
      .catch((e) => {
        if (epoch !== this.generation) return;
        if (errorReason(e) === "accountChanged") {
          this.isolate();
          return;
        }
        this.failures++;
        this.status = String(e instanceof Error ? e.message : e);
        retry =
          Number(
            (e as { details?: { retryAfterSeconds?: number } })?.details?.retryAfterSeconds ?? 0,
          ) * 1000;
      })
      .finally(() => {
        if (epoch === this.generation) {
          this.working = undefined;
          this.changed();
          clearTimeout(this.timer);
          this.timer = setTimeout(
            () => void this.sync(),
            Math.max(
              Number.isFinite(retry) ? retry : 0,
              this.requested && !this.failures
                ? 100
                : Math.min(900_000, 60_000 * 2 ** Math.min(this.failures, 4)),
            ),
          );
        }
      });
    return this.working;
  }
  client(pluginId: string): ChatClient {
    // Capturing the generation prevents a delayed plugin callback from crossing accounts.
    const epoch = this.generation;
    const ready = () => {
      if (epoch !== this.generation || !this.engine || !this.store || this.stopped)
        throw new Error("聊天未连接或账号已变化");
      this.plugins().chatVersion(pluginId);
      return this.engine;
    };
    const base = () => {
      ready();
      const hostId = this.store!.deviceId;
      return {
        protocolVersion: 2 as const,
        id: randomUUID(),
        hostId,
        pluginId,
        conversationId: conversationId(hostId, pluginId),
        deviceId: hostId,
        createdAt: Date.now(),
      };
    };
    const send = () => {
      void this.sync();
    };
    return {
      sendText: async (text) => {
        const e = ready(),
          m = e.create({ ...base(), kind: "botText", text });
        send();
        return m.id;
      },
      request: async (input) => {
        const e = ready(),
          b = base(),
          m = e.create({
            ...b,
            kind: "request",
            card: input.card,
            expiresAt: input.expiresAt ?? b.createdAt + defaultRequestTTL,
            botVersion: this.plugins().chatVersion(pluginId).version,
          });
        send();
        return m.id;
      },
      get: async (id) => {
        const e = ready(),
          m = e
            .messages()
            .find(
              (m) => m.id === id && m.hostId === this.store!.deviceId && m.pluginId === pluginId,
            );
        return m ? { message: m, state: e.state(id), delivery: e.delivery(id) } : null;
      },
      list: async (input) => {
        ready();
        return this.page(pluginId, input?.before, Math.max(1, Math.min(50, input?.limit ?? 20)));
      },
      cancel: async (id) => {
        const e = ready(),
          m = e
            .messages()
            .find(
              (m) => m.id === id && m.hostId === this.store!.deviceId && m.pluginId === pluginId,
            );
        if (!m || m.kind !== "request") throw new Error("请求不属于当前机器人");
        e.cancel(m);
        send();
      },
    };
  }
}
