import type { Contract, Input, Output } from "./contract.ts";
import type {
  Model,
  Preferences,
  RelayMessage,
  ResponseRequest,
  ResponseEvent,
} from "./types.ts";
import type { WidgetSnapshot } from "./widgets.ts";
export interface CallContext {
  signal: AbortSignal;
  requestId: string;
  viewId?: string;
}
export interface Host {
  paths: { data: string; cache: string; logs: string };
  preferences(): Promise<Preferences>;
  models: {
    list(): Promise<Model[]>;
    default(): Promise<Model>;
    responses(
      request: ResponseRequest,
      options: { connectionId: string; signal?: AbortSignal },
    ): AsyncIterable<ResponseEvent>;
  };
  widgets: { publish(id: string, snapshot: WidgetSnapshot): Promise<void> };
  ui: {
    toast(text: string, options?: { viewId?: string }): Promise<void>;
    confirm(text: string, options: { viewId: string }): Promise<boolean>;
  };
}
export type Handlers<C extends Contract> = {
  [K in keyof C]: (
    input: Input<C[K]>,
    context: CallContext,
  ) => Output<C[K]> | Promise<Output<C[K]>> | AsyncIterable<Output<C[K]>>;
};
export interface ChatCall extends CallContext {
  message: RelayMessage;
  reply: { complete(value: { text: string }): Promise<void> };
}
export interface BackendDefinition<C extends Contract = Contract> {
  api: C;
  setup(context: { host: Host }):
    | Promise<{
        handlers: Handlers<C>;
        chat?: Record<string, (call: ChatCall) => Promise<void>>;
        stop?: () => void | Promise<void>;
      }>
    | {
        handlers: Handlers<C>;
        chat?: Record<string, (call: ChatCall) => Promise<void>>;
        stop?: () => void | Promise<void>;
      };
}
export function defineBackend<C extends Contract>(
  definition: BackendDefinition<C>,
): BackendDefinition<C> {
  return definition;
}
