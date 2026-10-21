import { randomUUID } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  AuthEvent,
  AuthInteraction,
  AuthPrompt,
  Credential,
  CredentialStore,
} from "@earendil-works/pi-ai";
import { builtinModels, builtinProviders } from "@earendil-works/pi-ai/providers/all";
import {
  credentialKeyId,
  credentialKeyScope,
  type CredentialProvider,
  type CredentialRecord,
  type CredentialRef,
} from "@deepseek-ai/dsh-credentials";
import { recordKeyFor } from "@deepseek-ai/dsh-llm-pi-ai";

export type { AuthEvent, AuthInteraction, AuthPrompt };
export type ConnectionAuthMethod = "api-key" | "oauth";

export interface LoginMethod {
  id: ConnectionAuthMethod;
  label: string;
  subscription: boolean;
}

export interface AuthConnection {
  id: string;
  provider: string;
  auth: ConnectionAuthMethod;
  credentials: CredentialProvider;
  apiKeyReference: CredentialRef;
}

export interface ConnectionAuthOptions {
  dataDirectory: string;
  connection(id: string): AuthConnection;
  /** Acquires exclusive credential-edit admission for this connection. */
  acquire(id: string, operation: "login" | "logout"): () => void;
  changed(id: string): Promise<void>;
}

/**
 * The only fn-owned coupling to llm-pi-ai's credential record encoding.
 * recordKeyFor and the storage interface are public; the payload codec is not.
 * Keep this bridge covered by the original adapter's read/refresh contract.
 */
function decodeCredential(record: CredentialRecord | undefined): Credential | undefined {
  if (record === undefined) return undefined;
  if (record.kind === "api-key") {
    return {
      type: "api_key",
      ...(record.key === undefined ? {} : { key: record.key }),
      ...(record.env === undefined ? {} : { env: { ...record.env } }),
    };
  }
  const value = record.payload;
  if (
    value === null ||
    typeof value !== "object" ||
    !("type" in value) ||
    value.type !== "oauth" ||
    !("access" in value) ||
    typeof value.access !== "string" ||
    !("refresh" in value) ||
    typeof value.refresh !== "string" ||
    !("expires" in value) ||
    typeof value.expires !== "number"
  ) {
    throw new Error("Stored OAuth credential has an unsupported format");
  }
  return structuredClone(value) as Credential;
}

function jsonImage(value: unknown): unknown {
  if (Array.isArray(value))
    return value.map((entry) => (entry === undefined ? null : jsonImage(entry)));
  if (
    value !== null &&
    typeof value === "object" &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, jsonImage(entry)]),
    );
  }
  return value;
}

function encodeCredential(credential: Credential): CredentialRecord {
  if (credential.type === "api_key") {
    return {
      kind: "api-key",
      ...(credential.key === undefined ? {} : { key: credential.key }),
      ...(credential.env === undefined ? {} : { env: { ...credential.env } }),
    };
  }
  return { kind: "grant", payload: jsonImage(credential) };
}

/** Pi's entire read-modify-write callback, including refresh, stays inside the file lock. */
export function createPiCredentialStore(provider: CredentialProvider): CredentialStore {
  return {
    async read(id, options) {
      options?.signal?.throwIfAborted();
      return decodeCredential(await provider.readRecord(recordKeyFor(id)));
    },
    async list(options) {
      options?.signal?.throwIfAborted();
      const entries = await provider.listRecords();
      return entries
        .filter((entry) => credentialKeyScope(entry.key) === "llm-pi-ai")
        .map((entry) => ({
          providerId: credentialKeyId(entry.key),
          type: entry.kind === "api-key" ? ("api_key" as const) : ("oauth" as const),
        }));
    },
    async modify(id, mutate, options) {
      options?.signal?.throwIfAborted();
      const record = await provider.modifyRecord(recordKeyFor(id), async (current) => {
        options?.signal?.throwIfAborted();
        const next = await mutate(decodeCredential(current));
        // Once mutation began, a provider may have rotated the refresh token.
        // Cancellation must not discard the only valid post-refresh credential.
        return next === undefined ? undefined : encodeCredential(next);
      });
      return decodeCredential(record);
    },
    async delete(id, options) {
      options?.signal?.throwIfAborted();
      await provider.deleteRecord(recordKeyFor(id));
    },
  };
}

async function installationId(dataDirectory: string): Promise<string> {
  await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
  const path = join(dataDirectory, "installation-id");
  try {
    await writeFile(path, randomUUID(), { flag: "wx", mode: 0o600 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
  const info = await stat(path);
  if ((info.mode & 0o077) !== 0) throw new Error("Installation identity file must be private");
  const id = (await readFile(path, "utf8")).trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error("Installation identity is invalid; the existing file was preserved");
  }
  return id;
}

/** Runs Pi's own login protocol; the desktop owns how its interaction is presented. */
export class ConnectionAuthService {
  private readonly catalog = builtinProviders();
  private readonly attempts = new Map<
    string,
    { controller: AbortController; done: Promise<void> }
  >();
  private deviceId: Promise<string> | undefined;
  private closed = false;

  constructor(private readonly options: ConnectionAuthOptions) {}

  methods(providerId: string): LoginMethod[] {
    const provider = this.catalog.find((entry) => entry.id === providerId);
    if (provider === undefined) return [];
    return [
      ...(provider.auth.apiKey?.login === undefined
        ? []
        : [
            {
              id: "api-key" as const,
              label: provider.auth.apiKey.name,
              subscription: false,
            },
          ]),
      ...(provider.auth.oauth === undefined
        ? []
        : [
            {
              id: "oauth" as const,
              label: provider.auth.oauth.loginLabel ?? provider.auth.oauth.name,
              subscription: provider.auth.oauth.isSubscription === true,
            },
          ]),
    ];
  }

  providers() {
    return this.catalog
      .map((provider) => ({
        id: provider.id,
        name: provider.name,
        methods: this.methods(provider.id),
        modelCount: provider.getModels().length,
        dynamic: typeof provider.refreshModels === "function",
      }))
      .filter((provider) => provider.methods.length > 0);
  }

  presetModels(providerId: string) {
    const provider = this.catalog.find(provider => provider.id === providerId);
    if (!provider) throw new Error("未知服务商");
    return provider.getModels().map(model => ({ id: model.id, name: model.name, api: model.api, baseURL: model.baseUrl }));
  }

  async refreshCatalog(id: string, signal: AbortSignal) {
    const connection = this.options.connection(id);
    const provider = this.catalog.find(provider => provider.id === connection.provider);
    if (!provider?.refreshModels) return null;
    const models = builtinModels({
      credentials: createPiCredentialStore(connection.credentials),
      authContext: { env: async () => undefined, fileExists: async () => false },
    });
    const result = await models.refresh({ providers: [connection.provider], force: true, allowNetwork: true, signal });
    signal.throwIfAborted();
    if (result.errors.has(connection.provider)) throw new Error("刷新账号模型失败，请检查登录状态与网络后重试");
    return models.getModels(connection.provider).map(model => ({
      id: model.id, name: model.name, contextWindow: model.contextWindow, maxTokens: model.maxTokens,
      input: [...model.input],
    }));
  }

  isBusy(id?: string): boolean {
    return id === undefined ? this.attempts.size > 0 : this.attempts.has(id);
  }

  login(id: string, interaction: AuthInteraction): Promise<void> {
    if (this.closed) return Promise.reject(new Error("Authentication service is stopped"));
    if (this.attempts.has(id))
      return Promise.reject(new Error("This connection already has a login in progress"));
    const connection = this.options.connection(id);
    if (!this.methods(connection.provider).some((method) => method.id === connection.auth)) {
      return Promise.reject(new Error("The selected provider does not support this login method"));
    }
    const release = this.options.acquire(id, "login");
    const controller = new AbortController();
    const signal =
      interaction.signal === undefined
        ? controller.signal
        : AbortSignal.any([controller.signal, interaction.signal]);
    const done = Promise.resolve()
      .then(async () => {
        signal.throwIfAborted();
        const deviceId = await (this.deviceId ??= installationId(this.options.dataDirectory));
        signal.throwIfAborted();
        const models = builtinModels({
          credentials: createPiCredentialStore(connection.credentials),
          authContext: { env: async () => undefined, fileExists: async () => false },
        });
        const credential = await models.login(
          connection.provider,
          connection.auth === "api-key" ? "api_key" : "oauth",
          {
            signal,
            notify: (event) => {
              if (!signal.aborted) interaction.notify(event);
            },
            prompt: async (prompt) => {
              const promptSignal =
                prompt.signal === undefined ? signal : AbortSignal.any([signal, prompt.signal]);
              promptSignal.throwIfAborted();
              return interaction.prompt({ ...prompt, signal: promptSignal });
            },
          },
          { getDeviceId: () => deviceId },
        );
        if (credential.type === "api_key") {
          if (!credential.key?.trim())
            throw new Error("This connection requires an explicit API key");
          await connection.credentials.set(connection.apiKeyReference, credential.key.trim());
        }
        await this.options.changed(id);
      })
      .finally(() => {
        this.attempts.delete(id);
        release();
      });
    this.attempts.set(id, { controller, done });
    return done;
  }

  cancel(id: string): void {
    this.attempts.get(id)?.controller.abort(new Error("Login cancelled"));
  }

  cancelAll(): void {
    for (const attempt of this.attempts.values()) {
      attempt.controller.abort(new Error("Authentication service is stopping"));
    }
  }

  async logout(id: string): Promise<void> {
    if (this.closed) throw new Error("Authentication service is stopped");
    if (this.attempts.has(id)) throw new Error("Cancel the current login before signing out");
    const release = this.options.acquire(id, "logout");
    try {
      const connection = this.options.connection(id);
      await connection.credentials.deleteRecord(recordKeyFor(connection.provider));
      await connection.credentials.unset(connection.apiKeyReference);
      await this.options.changed(id);
    } finally {
      release();
    }
  }

  async dispose(): Promise<void> {
    this.closed = true;
    this.cancelAll();
    await Promise.allSettled([...this.attempts.values()].map((attempt) => attempt.done));
  }
}
