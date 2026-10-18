import type { ChatClient, PluginChat } from "./chat";
export type { ChatClient, ChatCard, ChatMessage, ChatEventContext, PluginChat } from "./chat";
import type { WebClient } from "./web";
export type {
  WebClient,
  WebOptions,
  WebTask,
  WebEngine,
  WebSource,
  WebSearchInput,
  WebFetchInput,
  WebSearchResult,
  WebFetchResult,
} from "./web";
export type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue };

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  model: string;
  baseURL: string;
  kind: "openai-compatible" | "pi" | "chatgpt";
  configured: boolean;
  preset: string | null;
  hasApiKey: boolean;
  /** Stable host account reference; no identity or credentials. */
  chatgptProfileId?: string;
  options: Record<string, string>;
}

export interface ProviderPreset {
  id: string;
  name: string;
  modelCount: number;
  apiKeySupported: boolean;
  keyLabel: string;
  notice: string;
  fields: { key: string; label: string; placeholder: string; required: boolean }[];
}

export interface PresetModel {
  id: string;
  name: string;
  api: string;
  baseURL: string;
  contextWindow: number;
  reasoning: boolean;
}

export interface ModelRequest {
  modelId: string;
  prompt: string;
  system?: string;
  title?: string;
}

export interface ModelRun {
  id: string;
  pluginId: string;
  modelId: string;
  title: string;
  input: string;
  output: string;
  status: "running" | "completed" | "cancelled" | "failed";
  error: string | null;
  createdAt: number;
  updatedAt: number;
  revision: number;
  /** Legacy history marker. New runs always use a configured model and return false. */
  demo: boolean;
}

export interface PluginManifest {
  schemaVersion: 1;
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sdkVersion: "0.3";
  frontend: string;
  backend?: string;
  styles: string;
  /** Keep the page mounted while hidden. Defaults to false. */
  keepAlive?: boolean;
}

export interface PluginInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  version: string;
  packageName: string;
  source: string;
  market: { marketId: string; marketURL: string } | null;
  enabled: boolean;
  status: "active" | "disabled" | "error";
  error: string | null;
  clientURL: string;
  styleURL: string | null;
  keepAlive: boolean;
  methods: { name: string; description: string; inputSchema: JSONValue }[];
}

export interface InstallJob {
  operation: "install" | "update";
  targetVersion: string | null;
  id: string;
  source: string;
  status: "installing" | "completed" | "failed";
  message: string;
  pluginId: string | null;
  createdAt: number;
}

export interface PluginContext {
  readonly pluginId: string;
  chat?: ChatClient;
  web: WebClient;
  models: { list(): ModelInfo[]; start(input: ModelRequest): Promise<ModelRun> };
  kv: {
    get(key: string): JSONValue | null;
    set(key: string, value: JSONValue): Promise<void>;
    delete(key: string): Promise<void>;
  };
}

export interface PluginMethod {
  description: string;
  inputSchema: JSONValue;
  execute(input: unknown, context: PluginContext): unknown | Promise<unknown>;
}

export interface BackendPlugin {
  /** Explicit opt-in; existing methods are never exposed remotely. */
  chat?: PluginChat;
  methods: Record<string, PluginMethod>;
  activate?(context: PluginContext): void | Promise<void>;
  dispose?(): void | Promise<void>;
}

export interface HostBridge {
  call(method: string, input: unknown): Promise<unknown>;
  on(event: string, listener: (payload: unknown) => void): () => void;
  onReconnect(listener: () => void): () => void;
}
