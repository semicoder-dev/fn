import type { AppManifest } from "./manifest.ts";
import type { SummaryState } from "./summary.ts";
export type Locale = "zh-CN" | "en";
export type Theme = "light" | "dark" | "system";
export type ApplicationState =
  "closed" | "starting" | "running" | "minimized" | "stopping" | "failed";
export interface Preferences {
  locale: Locale;
  theme: Theme;
  desktop: string[];
  menu: string[];
  phoneEnabled?: boolean;
  defaultModel?: { connectionId: string; model: string };
}
export interface Model {
  connectionId: string;
  id: string;
  name: string;
}
export interface ResponseRequest {
  model: string;
  input: Record<string, unknown>[];
  instructions?: string;
  store: false;
  stream: true;
  [key: string]: unknown;
}
export interface ResponseEvent {
  type: string;
  [key: string]: unknown;
}
export interface InstalledApplication {
  instanceId: string;
  manifest: AppManifest;
  state: ApplicationState;
  runId?: string;
  error?: string;
  busy: number;
  summary?: SummaryState;
  requiresUpdate: boolean;
  messages: Record<string, Record<string, string>>;
}
export interface RelayMessage {
  id: string;
  hostId: string;
  instanceId: string;
  conversationId: string;
  text: string;
  locale: Locale;
  createdAt: number;
  status:
    | "waiting"
    | "processing"
    | "completed"
    | "interrupted"
    | "failed"
    | "cancelled";
  reply?: string;
  error?: string;
}
export interface ViewBootstrap {
  token: string;
  viewId: string;
  instanceId: string;
  runId: string;
  preferences: Preferences;
  messages: Record<string, Record<string, string>>;
}
export interface Connection {
  id: string;
  email: string;
  enabled: boolean;
}
export class FnError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "FnError";
  }
}
