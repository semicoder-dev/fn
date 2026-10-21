import type { ApplicationCards } from "./card-contract.ts";
export type { ChatCard, SessionCard, CardValues, CardResponse, ApplicationCards } from "./card-contract.ts";
import type { Context, Plugin } from "@deepseek-ai/cordis";
import type { Agent } from "@deepseek-ai/dsh-agent";
import type { SessionEvent } from "@deepseek-ai/dsh-session";

export interface ModelSelection {
  connectionId: string;
  modelId: string;
}
export type ExecutionPolicy = "controlled" | "automatic";
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export interface ApplicationManifest {
  icon?: string;
  /** SVG image data; never insert as HTML. */
  iconSvg?: string;
  id: string;
  name: string;
  description?: string;
  version: string;
  packageName: string;
  client?: string;
}
export interface ApplicationInfo extends ApplicationManifest {
  enabled: boolean;
  status: "active" | "disabled" | "error";
  error?: string;
  methods: string[];
  chats: ChatEndpoint[];
}
export interface ApplicationLoad {
  manifest: ApplicationManifest;
  plugin: Plugin;
  config?: Record<string, unknown>;
}
export interface ChatEndpoint {
  id: string;
  name: string;
  systemPrompt?: string;
}
export interface SessionInfo extends ModelSelection {
  id: string;
  appId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
  policy: ExecutionPolicy;
  cwd?: string;
  endpointId?: string;
  status: "idle" | "running" | "unloaded";
}
export interface CreateSession extends ModelSelection {
  appId: string;
  title?: string;
  cwd?: string;
  endpointId?: string;
  policy?: ExecutionPolicy;
}
export interface SessionPage {
  events: readonly SessionEvent[];
  nextOffset: number;
  hasMore: boolean;
}
export interface RuntimeChange {
  kind: "applications" | "connections" | "session" | "stream" | "approval";
  sessionId?: string;
  appId?: string;
  data?: unknown;
}
export interface ApplicationKv {
  get(key: string): Json | undefined;
  set(key: string, value: Json): void;
  delete(key: string): void;
  list(): { key: string; value: Json }[];
}
export interface ApplicationRuntime {
  readonly info: ApplicationManifest;
  readonly kv: ApplicationKv;
  readonly cards: ApplicationCards;
  method(name: string, handler: (input: Json) => Json | Promise<Json>): () => void;
  chat(endpoint: ChatEndpoint): () => void;
  useTools(names: string[]): () => void;
  createSession(input: Omit<CreateSession, "appId">): Promise<SessionInfo>;
  send(sessionId: string, text: string, requestId?: string): Promise<SessionInfo>;
  agent(sessionId: string): Promise<Agent>;
}
declare module "@deepseek-ai/cordis" {
  interface Context {
    app: ApplicationRuntime;
  }
}
export type ApplicationContext = Context;
