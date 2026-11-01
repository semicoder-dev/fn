// Generated from the application's API contract.

export namespace Method0InputTypes {
export type _Schema0 =
  | string
  | number
  | boolean
  | null
  | _Schema0[]
  | {
      [k: string]: _Schema0;
    };

export interface Method0Input {
  action: string;
  input?: _Schema0;
  [k: string]: unknown;
}

}
export namespace Method0OutputTypes {
export type Method0Output =
  | string
  | number
  | boolean
  | null
  | Method0Output[]
  | {
      [k: string]: Method0Output;
    };

}
export namespace Event1Types {
export interface Event1 {}

}
export interface FIAApplication {
call(method: "platform.command", input: Method0InputTypes.Method0Input, options?: {signal?: AbortSignal; timeoutMs?: number}): Promise<Method0OutputTypes.Method0Output>;
on(event: "platform.changed", listener: (payload: Event1Types.Event1) => void, options?: {match?: Readonly<Record<string, string | number | boolean | null>>}): () => void;
onReconnect(listener: () => void): () => void;
close(): void;
}
declare global { const app: FIAApplication; function help(name?: string): string; }
