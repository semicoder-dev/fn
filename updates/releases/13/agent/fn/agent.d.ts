// Generated from the application's API contract.

export namespace Method0InputTypes {
export interface Method0Input {
  epoch: string;
  [k: string]: unknown;
}

}
export namespace Method0OutputTypes {
export type Method0Output = null;

}
export namespace Method1InputTypes {
export interface Method1Input {
  [k: string]: unknown;
}

}
export namespace Method1OutputTypes {
export interface Method1Output {
  ready: boolean;
  epoch: string;
  error: string | null;
  namespaces: string[];
}

}
export namespace Method2InputTypes {
export interface Method2Input {
  mode: "previous" | "default";
  [k: string]: unknown;
}

}
export namespace Method2OutputTypes {
export type Method2Output = null;

}
export namespace Event3Types {
export interface Event3 {
  namespaces: string[];
}

}
export interface FIAApplication {
call(method: "host.ready", input: Method0InputTypes.Method0Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method0OutputTypes.Method0Output>;
call(method: "host.status", input: Method1InputTypes.Method1Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method1OutputTypes.Method1Output>;
call(method: "host.recover", input: Method2InputTypes.Method2Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method2OutputTypes.Method2Output>;
on(event: "host.apis", listener: (payload: Event3Types.Event3) => void, options?: {match?: Readonly<Record<string, string | number | boolean | null>>}): () => void;
onReconnect(listener: () => void): () => void;
close(): void;
}
declare global { const app: FIAApplication; function help(name?: string): string; }
