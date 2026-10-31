// Generated from the application's API contract.

export namespace Method0InputTypes {
export interface Method0Input {
  epoch: string;
  generationId: string;
  clientId: string;
  [k: string]: unknown;
}

}
export namespace Method0OutputTypes {
export type Method0Output = null;

}
export namespace Method1InputTypes {
export interface Method1Input {
  epoch: string;
  generationId: string;
  clientId: string;
  error: string;
  [k: string]: unknown;
}

}
export namespace Method1OutputTypes {
export type Method1Output = null;

}
export namespace Method2InputTypes {
export interface Method2Input {
  [k: string]: unknown;
}

}
export namespace Method2OutputTypes {
export interface Method2Output {
  ready: boolean;
  epoch: string;
  error: string | null;
  namespaces: string[];
}

}
export namespace Method3InputTypes {
export interface Method3Input {
  mode: "previous" | "default";
  [k: string]: unknown;
}

}
export namespace Method3OutputTypes {
export type Method3Output = null;

}
export namespace Event4Types {
export interface Event4 {
  generationId: string;
}

}
export namespace Event5Types {
export interface Event5 {
  namespaces: string[];
}

}
export interface FIAApplication {
call(method: "host.ready", input: Method0InputTypes.Method0Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method0OutputTypes.Method0Output>;
call(method: "host.updateFailed", input: Method1InputTypes.Method1Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method1OutputTypes.Method1Output>;
call(method: "host.status", input: Method2InputTypes.Method2Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method2OutputTypes.Method2Output>;
call(method: "host.recover", input: Method3InputTypes.Method3Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method3OutputTypes.Method3Output>;
on(event: "host.composition", listener: (payload: Event4Types.Event4) => void, options?: {match?: Readonly<Record<string, string | number | boolean | null>>}): () => void;
on(event: "host.apis", listener: (payload: Event5Types.Event5) => void, options?: {match?: Readonly<Record<string, string | number | boolean | null>>}): () => void;
onReconnect(listener: () => void): () => void;
close(): void;
}
declare global { const app: FIAApplication; function help(name?: string): string; }
