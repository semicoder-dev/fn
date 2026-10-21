import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Context, Service, type Fiber } from "@deepseek-ai/cordis";
import { writeFileAtomic } from "@deepseek-ai/dsh-atomic-write";
import {
  credentialRef,
  isCredentialKeySegment,
  type CredentialProvider,
} from "@deepseek-ai/dsh-credentials";
import { LocalCredentialProvider } from "@deepseek-ai/dsh-credentials-local";
import { createLaunchEnvironmentSnapshot } from "@deepseek-ai/dsh-launch-environment";
import {
  LlmAdapter,
  LlmRuntime,
  resolveRetryPolicy,
  type AdapterRegistrationHandle,
  type GenerateOptions,
  type LlmModelInfo,
  type LlmResolvedModelInfo,
  type PreparedAdapterCall,
  type StreamChunk,
} from "@deepseek-ai/dsh-llm";
import * as piPlugin from "@deepseek-ai/dsh-llm-pi-ai";
import type { PiAiProviderProfile } from "@deepseek-ai/dsh-llm-pi-ai";
import type {} from "@deepseek-ai/dsh-agent";
import {
  ConnectionAuthService,
  createPiCredentialStore,
  type ConnectionAuthMethod,
} from "./auth.ts";

/** Secrets and routing policy are host-owned, never serialized into this profile. */
export type ConnectionProfile = Omit<PiAiProviderProfile, "apiKeyEnv" | "headers" | "retryPolicy">;

export interface CreateConnection {
  name: string;
  provider: string;
  auth: ConnectionAuthMethod;
  profile?: ConnectionProfile;
}

export interface ConnectionInfo extends CreateConnection {
  id: string;
  profile: ConnectionProfile;
  configured: boolean;
  error?: string;
}

interface StoredConnection extends CreateConnection {
  id: string;
  profile: ConnectionProfile;
}

interface ConnectionDocument {
  version: 1;
  connections: StoredConnection[];
  sessions: Record<string, string>;
}

export interface ConnectionServiceOptions {
  dataDirectory: string;
  isSessionBusy?: (sessionId: string) => boolean;
}

interface ConnectionState {
  config: StoredConnection;
  configured: boolean;
  error?: string;
  scope?: Fiber;
  credentials?: CredentialProvider;
  registry?: ConnectionLlmRegistry;
  editing: boolean;
  requests: Map<AbortController, PromiseWithResolvers<void>>;
}

declare module "@deepseek-ai/cordis" {
  interface Context {
    connections: ConnectionService;
  }
}

const API_KEY_REF = credentialRef("FN_CONNECTION_API_KEY");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROFILE_KEYS = new Set([
  "displayName",
  "api",
  "baseURL",
  "models",
  "modelOverrides",
  "compat",
  "defaultContextWindow",
  "defaultMaxTokens",
  "defaultInput",
  "reasoning",
  "thinkingBudgets",
  "cacheRetention",
  "transport",
  "timeoutMs",
  "websocketConnectTimeoutMs",
  "streamIdleTimeoutMs",
  "maxRequestImageBytes",
  "requestImagePixelBudget",
  "requestImageMaxBytes",
]);

function profileCopy(profile: ConnectionProfile = {}): ConnectionProfile {
  if (profile === null || typeof profile !== "object" || Array.isArray(profile)) {
    throw new TypeError("Connection profile must be an object");
  }
  for (const key of Object.keys(profile)) {
    if (!PROFILE_KEYS.has(key)) throw new TypeError(`Unsupported connection profile field: ${key}`);
  }
  if (profile.baseURL !== undefined) {
    const url = new URL(profile.baseURL);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
      throw new TypeError("Model endpoint must be an HTTP(S) URL without embedded credentials");
    }
  }
  const encoded = JSON.stringify(profile);
  if (Buffer.byteLength(encoded, "utf8") > 256 * 1024) throw new TypeError("Connection profile exceeds 256 KiB of UTF-8 JSON");
  return JSON.parse(encoded) as ConnectionProfile;
}

function normalizeConnection(input: CreateConnection, id: string = randomUUID()): StoredConnection {
  if (typeof input.name !== "string" || input.name.trim().length === 0 || input.name.length > 160) {
    throw new TypeError("A connection needs a name of at most 160 characters");
  }
  if (typeof input.provider !== "string" || !isCredentialKeySegment(input.provider)) {
    throw new TypeError("Provider must be a canonical lowercase provider identifier");
  }
  if (input.auth !== "api-key" && input.auth !== "oauth")
    throw new TypeError("Unknown authentication method");
  if (!UUID.test(id)) throw new TypeError("Invalid connection ID");
  return {
    id,
    name: input.name.trim(),
    provider: input.provider,
    auth: input.auth,
    profile: profileCopy(input.profile),
  };
}

/**
 * Observes the public adapter-registration seam while retaining the original
 * runtime's validation, directory and discovery. No private adapter map access.
 */
export class ConnectionLlmRegistry extends LlmRuntime {
  private readonly captured = new Map<string, LlmAdapter>();

  adapterFor(provider: string): LlmAdapter {
    const adapter = this.captured.get(provider);
    if (adapter === undefined) throw new Error(`Connection has no adapter for ${provider}`);
    return adapter;
  }

  override registerAdapter(providers: string[], adapter: LlmAdapter): AdapterRegistrationHandle {
    const upstream = super.registerAdapter(providers, adapter);
    let owned = new Set(providers);
    for (const provider of owned) this.captured.set(provider, adapter);
    const clear = (): void => {
      for (const provider of owned) {
        if (this.captured.get(provider) === adapter) this.captured.delete(provider);
      }
      owned.clear();
    };
    // Fiber teardown invokes the registered effect, not the wrapper handle.
    const disposeCapture = this.ctx.effect(() => clear, "fn.connectionAdapterCapture");
    const handle = (() => {
      clear();
      upstream();
      void disposeCapture();
    }) as AdapterRegistrationHandle;
    handle.replace = (next) => {
      upstream.replace(next);
      clear();
      owned = new Set(next);
      for (const provider of owned) this.captured.set(provider, adapter);
    };
    return handle;
  }
}

/** A single canonical provider registry routes requests to isolated connection adapters. */
export class ConnectionRouterAdapter extends LlmAdapter {
  constructor(private readonly connections: ConnectionService) {
    super();
  }

  override providerInfo(provider: string) {
    return { id: provider, name: provider };
  }
  override providerRetryPolicy() {
    return resolveRetryPolicy({ mode: "normal", maxRetries: 2 }, "fn connection retry policy");
  }
  override listModels(provider: string) {
    const target = this.connections.select(provider);
    return this.connections.catalog(target);
  }
  override resolveModel(provider: string, model: string, signal?: AbortSignal) {
    const target = this.connections.select(provider);
    return this.connections.adapter(target).resolveModel(provider, model, signal);
  }
  override imageRequestPricing(provider: string, model: string) {
    return this.connections
      .adapter(this.connections.select(provider))
      .imageRequestPricing(provider, model);
  }
  override imageRequestTarget(
    provider: string,
    model: string,
    image: Parameters<LlmAdapter["imageRequestTarget"]>[2],
  ) {
    return this.connections
      .adapter(this.connections.select(provider))
      .imageRequestTarget(provider, model, image);
  }
  override async prepareCall(
    provider: string,
    model: string,
    signal?: AbortSignal,
  ): Promise<PreparedAdapterCall> {
    const target = this.connections.select(provider);
    const adapter = this.connections.adapter(target);
    await this.connections.assertConfigured(target);
    signal?.throwIfAborted();
    this.connections.assertCurrent(target);
    const prepared = await adapter.prepareCall(provider, model, signal);
    return {
      model: prepared.model,
      stream: (options) =>
        this.connections.streamThrough(target, options, (request) => prepared.stream(request)),
    };
  }
  override stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    // Capture before returning an iterator: it may be consumed outside the ALS caller.
    const target = this.connections.select(options.provider, options.sessionId);
    const adapter = this.connections.adapter(target);
    return this.connections.streamThrough(target, options, (request) => adapter.stream(request));
  }
}

export class ConnectionService extends Service {
  static inject = ["llm"];
  readonly auth: ConnectionAuthService;
  private readonly root: Context;
  private readonly records = new Map<string, ConnectionState>();
  private readonly sessionBindings = new Map<string, string>();
  private readonly explicit = new AsyncLocalStorage<string>();
  private readonly router: ConnectionRouterAdapter;
  private registration?: AdapterRegistrationHandle;
  private operations: Promise<void> = Promise.resolve();
  private closed = false;
  private readonly filename: string;

  constructor(
    ctx: Context,
    private readonly options: ConnectionServiceOptions,
  ) {
    super(ctx, "connections");
    this.root = ctx;
    this.filename = join(options.dataDirectory, "connections.json");
    this.router = new ConnectionRouterAdapter(this);
    this.auth = new ConnectionAuthService({
      dataDirectory: options.dataDirectory,
      connection: (id) => {
        const target = this.required(id);
        if (target.credentials === undefined) throw new Error("Connection is unavailable");
        return { ...target.config, credentials: target.credentials, apiKeyReference: API_KEY_REF };
      },
      acquire: (id, operation) => this.acquireCredentialEdit(id, operation === "login"),
      changed: async (id) => {
        await this.refreshConfigured(this.required(id));
      },
    });
  }

  async *[Service.init](): AsyncGenerator<() => Promise<void>> {
    yield () => this.dispose();
    await mkdir(this.options.dataDirectory, { recursive: true, mode: 0o700 });
    let text: string;
    try {
      text = await readFile(this.filename, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      return;
    }
    const document = JSON.parse(text) as ConnectionDocument;
    if (
      document.version !== 1 ||
      !Array.isArray(document.connections) ||
      document.sessions === null ||
      typeof document.sessions !== "object" ||
      Array.isArray(document.sessions)
    )
      throw new Error("Connection metadata is invalid; the existing file was preserved");
    for (const input of document.connections) {
      const config = normalizeConnection(input, input.id);
      if (this.records.has(config.id)) throw new Error("Duplicate connection identity");
      this.records.set(config.id, this.state(config));
    }
    for (const [sessionId, connectionId] of Object.entries(document.sessions)) {
      if (!sessionId || typeof connectionId !== "string" || !this.records.has(connectionId)) {
        throw new Error("Session connection binding is invalid");
      }
      this.sessionBindings.set(sessionId, connectionId);
    }
    for (const target of this.records.values()) {
      try {
        await this.mount(target);
      } catch (error) {
        target.error = error instanceof Error ? error.message : "Connection failed to load";
      }
    }
    this.syncRoutes();
  }

  list(): ConnectionInfo[] {
    return [...this.records.values()].map((target) => this.info(target));
  }
  get(id: string): ConnectionInfo {
    return this.info(this.required(id));
  }

  create(input: CreateConnection): Promise<ConnectionInfo> {
    return this.mutate(async () => {
      const target = this.state(normalizeConnection(input));
      if (
        target.config.auth === "oauth" &&
        !this.auth.methods(target.config.provider).some((method) => method.id === "oauth")
      ) {
        throw new Error("This provider has no supported OAuth login");
      }
      await this.mount(target);
      this.records.set(target.config.id, target);
      try {
        await this.persist();
      } catch (error) {
        this.records.delete(target.config.id);
        await target.scope?.dispose();
        throw error;
      }
      this.syncRoutes();
      return this.info(target);
    });
  }

  update(
    id: string,
    input: { name?: string; profile?: ConnectionProfile },
    catalogOnly = false,
  ): Promise<ConnectionInfo> {
    return this.mutate(async () => {
      const current = this.required(id);
      this.assertIdle(current);
      const config = normalizeConnection({ ...current.config, ...input }, id);
      // A connection's endpoint is part of its identity once history exists.
      if (catalogOnly && input.profile) {
        const { models: _oldModels, ...oldIdentity } = current.config.profile;
        const { models: _newModels, ...newIdentity } = input.profile;
        if (JSON.stringify(oldIdentity) !== JSON.stringify(newIdentity)) throw new Error("Catalog refresh cannot change connection identity");
      }
      if (input.profile !== undefined && this.hasSessions(id) && !catalogOnly) {
        throw new Error(
          "Create a new connection to change the profile of a connection used by a session",
        );
      }
      if (input.profile === undefined) {
        const previous = current.config;
        current.config = config;
        try {
          await this.persist();
        } catch (error) {
          current.config = previous;
          throw error;
        }
        return this.info(current);
      }
      const next = this.state(config);
      current.editing = true;
      try {
        await current.scope?.dispose();
        await this.mount(next);
        this.records.set(id, next);
        await this.persist();
      } catch (error) {
        await next.scope?.dispose();
        this.records.set(id, current);
        await this.mount(current);
        throw error;
      } finally {
        current.editing = false;
      }
      this.syncRoutes();
      return this.info(next);
    });
  }

  remove(id: string): Promise<void> {
    return this.mutate(async () => {
      const target = this.required(id);
      this.assertIdle(target);
      if (this.hasSessions(id)) throw new Error("This connection is referenced by saved sessions");
      target.editing = true;
      this.records.delete(id);
      try {
        await this.persist();
      } catch (error) {
        this.records.set(id, target);
        target.editing = false;
        throw error;
      }
      await target.scope?.dispose();
      this.syncRoutes();
      // The private credential file is retained; metadata removal never deletes user secrets.
    });
  }

  async setApiKey(id: string, key: string): Promise<ConnectionInfo> {
    const target = this.required(id);
    if (target.config.auth !== "api-key") throw new Error("This connection uses OAuth");
    const value = key.trim();
    if (!value || /[^\x21-\x7e]/.test(value))
      throw new Error("API key must contain visible ASCII characters");
    const release = this.acquireCredentialEdit(id, true);
    try {
      await target.credentials!.set(API_KEY_REF, value);
      await this.refreshConfigured(target);
      return this.info(target);
    } finally {
      release();
    }
  }

  async listModels(id: string): Promise<LlmModelInfo[]> {
    return this.catalog(this.required(id));
  }

  async refreshModels(id: string) {
    const target = this.required(id);
    this.assertIdle(target);
    const release = this.acquireCredentialEdit(id, false);
    let models: Awaited<ReturnType<ConnectionAuthService["refreshCatalog"]>>;
    try { models = await this.auth.refreshCatalog(id, AbortSignal.timeout(30_000)); }
    finally { release(); }
    if (models) await this.update(id, { profile: { ...target.config.profile, models } }, true);
    return this.listModels(id);
  }

  async resolveModel(
    id: string,
    model: string,
    signal?: AbortSignal,
  ): Promise<LlmResolvedModelInfo> {
    const target = this.required(id);
    return this.adapter(target).resolveModel(target.config.provider, model, signal);
  }

  bindSession(sessionId: string, connectionId: string): Promise<void> {
    return this.mutate(async () => {
      const target = this.required(connectionId);
      if (typeof sessionId !== "string" || !sessionId || sessionId.length > 1024)
        throw new Error("Invalid session identity");
      const existing = this.sessionBindings.get(sessionId);
      if (existing !== undefined) {
        if (existing !== connectionId) throw new Error("A session cannot change its connection");
        return;
      }
      await this.assertConfigured(target);
      this.sessionBindings.set(sessionId, connectionId);
      try {
        await this.persist();
      } catch (error) {
        this.sessionBindings.delete(sessionId);
        throw error;
      }
    });
  }

  connectionForSession(sessionId: string): string | undefined {
    return this.sessionBindings.get(sessionId);
  }

  withConnection<T>(id: string, operation: () => T): T {
    this.required(id);
    return this.explicit.run(id, operation);
  }

  isBusy(): boolean {
    return (
      this.auth.isBusy() ||
      [...this.records.values()].some(
        (target) =>
          target.editing || target.requests.size > 0 || this.sessionsBusy(target.config.id),
      )
    );
  }

  /** Internal public seam used by ConnectionRouterAdapter, not exported over the desktop bridge. */
  select(provider: string, sessionId?: string): ConnectionState {
    const initiator = this.root.get("agents")?.currentInitiator();
    const explicit = this.explicit.getStore();
    const initiatorId =
      initiator === undefined ? undefined : this.sessionBindings.get(String(initiator.id));
    const requestedId =
      sessionId === undefined ? undefined : this.sessionBindings.get(String(sessionId));
    if (sessionId !== undefined && requestedId === undefined)
      throw new Error("Session has no model connection");
    if (initiator !== undefined && initiatorId === undefined)
      throw new Error("Agent has no model connection");
    const selected = explicit ?? initiatorId ?? requestedId;
    if (selected === undefined) throw new Error("A model call requires an explicit connection");
    if (
      (initiatorId !== undefined && initiatorId !== selected) ||
      (requestedId !== undefined && requestedId !== selected)
    ) {
      throw new Error("Model connection does not match the session");
    }
    const target = this.required(selected);
    if (target.config.provider !== provider)
      throw new Error("Provider does not belong to the selected connection");
    return target;
  }

  adapter(target: ConnectionState): LlmAdapter {
    this.assertCurrent(target);
    if (target.editing) throw new Error("Connection is being changed");
    if (target.registry === undefined || target.error)
      throw new Error(target.error ?? "Connection is unavailable");
    return target.registry.adapterFor(target.config.provider);
  }

  async catalog(target: ConnectionState): Promise<LlmModelInfo[]> {
    const adapter = this.adapter(target);
    await this.assertConfigured(target);
    return [...(await adapter.listModels(target.config.provider))];
  }

  async assertConfigured(target: ConnectionState): Promise<void> {
    await this.refreshConfigured(target);
    if (!target.configured) throw new Error("The selected connection has no saved credential");
  }

  assertCurrent(target: ConnectionState): void {
    if (this.closed || this.records.get(target.config.id) !== target) {
      throw new Error("Connection is no longer active");
    }
  }

  async *streamThrough(
    target: ConnectionState,
    options: GenerateOptions,
    dispatch: (request: GenerateOptions) => AsyncIterable<StreamChunk>,
  ): AsyncIterable<StreamChunk> {
    this.assertCurrent(target);
    if (target.editing) throw new Error("Connection is being changed");
    if (
      options.sessionId !== undefined &&
      this.sessionBindings.get(String(options.sessionId)) !== target.config.id
    ) {
      throw new Error("Prepared model call belongs to another connection");
    }
    const controller = new AbortController();
    const done = Promise.withResolvers<void>();
    const signal =
      options.signal === undefined
        ? controller.signal
        : AbortSignal.any([controller.signal, options.signal]);
    target.requests.set(controller, done);
    try {
      await this.assertConfigured(target);
      signal.throwIfAborted();
      yield* dispatch({ ...options, signal });
    } finally {
      target.requests.delete(controller);
      done.resolve();
    }
  }

  private state(config: StoredConnection): ConnectionState {
    return { config, configured: false, editing: false, requests: new Map() };
  }

  private info(target: ConnectionState): ConnectionInfo {
    return {
      ...structuredClone(target.config),
      configured: target.configured,
      ...(target.error ? { error: target.error } : {}),
    };
  }

  private required(id: string): ConnectionState {
    if (this.closed) throw new Error("Connection service is stopped");
    const target = this.records.get(id);
    if (target === undefined) throw new Error("Unknown model connection");
    return target;
  }

  private hasSessions(id: string): boolean {
    return [...this.sessionBindings.values()].includes(id);
  }

  private sessionsBusy(id: string): boolean {
    for (const [sessionId, connectionId] of this.sessionBindings) {
      if (connectionId !== id) continue;
      if (this.options.isSessionBusy?.(sessionId)) return true;
      const agent = this.root
        .get("agents")
        ?.get(sessionId as Parameters<NonNullable<Context["agents"]>["get"]>[0]);
      if (agent?.status === "running") return true;
    }
    return false;
  }

  private assertIdle(target: ConnectionState): void {
    if (
      target.editing ||
      target.requests.size > 0 ||
      this.auth.isBusy(target.config.id) ||
      this.sessionsBusy(target.config.id)
    ) {
      throw new Error("Wait until the connection is idle");
    }
  }

  private acquireCredentialEdit(id: string, changesIdentity: boolean): () => void {
    const target = this.required(id);
    this.assertIdle(target);
    if (target.credentials === undefined) throw new Error("Connection is unavailable");
    if (changesIdentity && this.hasSessions(id)) {
      throw new Error("Create a new connection and session to sign in with another credential");
    }
    target.editing = true;
    return () => {
      target.editing = false;
    };
  }

  private async refreshConfigured(target: ConnectionState): Promise<void> {
    if (target.credentials === undefined) {
      target.configured = false;
      return;
    }
    target.configured =
      target.config.auth === "api-key"
        ? (await target.credentials.resolve(API_KEY_REF)) !== undefined
        : (await createPiCredentialStore(target.credentials).read(target.config.provider))?.type ===
          "oauth";
  }

  private async mount(target: ConnectionState): Promise<void> {
    let mounted: Fiber | undefined;
    try {
      const pending = this.root.plugin(async (owner) => {
        const scope = owner
          .isolate("llm")
          .isolate("credentials")
          .isolate("authorization")
          .isolate("settings")
          .isolate("launchEnvironment");
        scope.reflect.provide("launchEnvironment", createLaunchEnvironmentSnapshot([]));
        await scope.plugin(ConnectionLlmRegistry);
        await scope.plugin(LocalCredentialProvider, {
          path: join(
            this.options.dataDirectory,
            "credentials",
            target.config.id,
            "credentials.yaml",
          ),
          watch: false,
        });
        target.credentials = scope.get("credentials")!;
        target.registry = scope.get("llm") as ConnectionLlmRegistry;
        await scope.plugin(piPlugin, {
          providers: {
            [target.config.provider]: {
              ...target.config.profile,
              ...(target.config.auth === "api-key" ? { apiKeyEnv: API_KEY_REF } : {}),
            },
          },
        });
        target.registry.adapterFor(target.config.provider);
        await this.refreshConfigured(target);
      });
      mounted = pending;
      await pending;
      target.scope = mounted;
      target.error = undefined;
    } catch (error) {
      await mounted?.dispose();
      target.credentials = undefined;
      target.registry = undefined;
      throw error;
    }
  }

  private syncRoutes(): void {
    const routes = [
      ...new Set(
        [...this.records.values()]
          .filter((target) => target.registry !== undefined && !target.error)
          .map((target) => target.config.provider),
      ),
    ];
    if (this.registration === undefined) {
      if (routes.length > 0) this.registration = this.root.llm.registerAdapter(routes, this.router);
    } else this.registration.replace(routes);
  }

  private mutate<T>(operation: () => Promise<T>): Promise<T> {
    if (this.closed) return Promise.reject(new Error("Connection service is stopped"));
    const pending = this.operations.then(() => {
      if (this.closed) throw new Error("Connection service is stopped");
      return operation();
    });
    this.operations = pending.then(
      () => undefined,
      () => undefined,
    );
    return pending;
  }

  private persist(): Promise<void> {
    const document: ConnectionDocument = {
      version: 1,
      connections: [...this.records.values()].map((target) => target.config),
      sessions: Object.fromEntries(this.sessionBindings),
    };
    return writeFileAtomic(this.filename, JSON.stringify(document, null, 2) + "\n", {
      mode: 0o600,
      dirMode: 0o700,
    });
  }

  private async dispose(): Promise<void> {
    this.closed = true;
    await this.operations;
    await this.auth.dispose();
    for (const target of this.records.values()) {
      for (const controller of target.requests.keys())
        controller.abort(new Error("Connection service is stopping"));
    }
    await Promise.allSettled(
      [...this.records.values()].flatMap((target) =>
        [...target.requests.values()].map((request) => request.promise),
      ),
    );
    this.registration?.();
    await Promise.allSettled([...this.records.values()].map((target) => target.scope?.dispose()));
  }
}
