import type { Context } from "@deepseek-ai/cordis";
import type { Scope } from "@deepseek-ai/dsh-scope";
import type { SessionEvent } from "@deepseek-ai/dsh-session";
import type { ModelSelection } from "@semicoder/fn-connections/selection";
export type { ModelSelection } from "@semicoder/fn-connections/selection";
export interface SessionInfo extends ModelSelection {
  id: string;
  targetId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
  policy: "controlled" | "automatic";
  cwd?: string;
  status: "idle" | "running" | "unloaded";
}
export interface CreateSession extends ModelSelection {
  targetId: string;
  title?: string;
  cwd?: string;
  policy?: "controlled" | "automatic";
}
export interface SessionTarget {
  id: string;
  name: string;
  systemPrompt?: string;
}
export interface TargetBinding extends SessionTarget {
  scope: Scope;
  context: Context;
}
export interface SessionPage {
  events: readonly SessionEvent[];
  nextOffset: number;
  hasMore: boolean;
}
export interface SessionChange {
  kind: "targets" | "session" | "stream" | "approval";
  sessionId?: string;
  targetId?: string;
  data?: unknown;
}
export interface PendingApproval {
  id: string;
  sessionId: string;
  toolName: string;
  reason?: string;
}
