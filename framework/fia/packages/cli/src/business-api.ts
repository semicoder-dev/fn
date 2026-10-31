import { z } from "zod";
import type { BackendRouteContext } from "./backend.ts";
export { z };
import { assertJSON, type EventOptions } from "./api-values.ts";
export { assertJSON } from "./api-values.ts";
export type { EventOptions, JSONScalar } from "./api-values.ts";

/** Request and response JSON envelopes each have a 1 MiB UTF-8 limit. Use pagination for large results. */
export interface APIMethod {
  description: string;
  input: z.ZodType;
  output: z.ZodType;
  examples?: readonly { input: unknown; output?: unknown }[];
}
/** Each encoded event frame is limited to 1 MiB; delivery is live-only, without replay. */
export interface APIEvent {
  description: string;
  payload: z.ZodType;
}
export interface APIContract {
  methods: Record<string, APIMethod>;
  events: Record<string, APIEvent>;
}
export interface APISchema {
  protocolVersion: 1;
  methods: Record<
    string,
    {
      description: string;
      input: Record<string, unknown>;
      output: Record<string, unknown>;
      examples?: APIMethod["examples"];
    }
  >;
  events: Record<
    string,
    { description: string; payload: Record<string, unknown> }
  >;
}
export interface CallOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}
export interface APIClient<C extends APIContract = APIContract> {
  call<K extends keyof C["methods"] & string>(
    method: K,
    input: z.input<C["methods"][K]["input"]>,
    options?: CallOptions,
  ): Promise<z.output<C["methods"][K]["output"]>>;
  on<K extends keyof C["events"] & string>(
    event: K,
    listener: (payload: z.output<C["events"][K]["payload"]>) => void,
    options?: EventOptions,
  ): () => void;
  onReconnect(listener: () => void): () => void;
  close(): void;
}
export interface InvocationContext<
  C extends APIContract = APIContract,
> extends BackendRouteContext<C> {
  source: "ui" | "cli" | "script";
  requestId: string;
  sessionId: string;
  signal: AbortSignal;
}
export interface APIEmitter<C extends APIContract = APIContract> {
  emit<K extends keyof C["events"] & string>(
    event: K,
    payload: z.input<C["events"][K]["payload"]>,
  ): void;
}
export type APIHandlers<C extends APIContract> = {
  [K in keyof C["methods"]]: (
    input: z.output<C["methods"][K]["input"]>,
    context: InvocationContext<C>,
  ) =>
    | z.input<C["methods"][K]["output"]>
    | Promise<z.input<C["methods"][K]["output"]>>;
};
export interface APIImplementation<C extends APIContract = APIContract> {
  contract: C;
  handlers: Record<
    string,
    (input: never, context: InvocationContext) => unknown
  >;
}

/** A live API composition. Registration owns its calls and its event namespace. */
export class APIRegistry implements APIImplementation {
  readonly contract: APIContract = {
    methods: Object.create(null),
    events: Object.create(null),
  };
  readonly handlers: APIImplementation["handlers"] = Object.create(null);
  private readonly owners = new Map<string, () => Promise<void>>();
  private readonly active = new Set<string>();
  private readonly listeners = new Set<(namespaces: string[]) => void>();
  get namespaces(): string[] {
    return [...this.active].sort();
  }
  subscribe(listener: (namespaces: string[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  private changed() {
    for (const listener of this.listeners) {
      try {
        listener(this.namespaces);
      } catch {
        /* observers cannot break registration */
      }
    }
  }

  register<C extends APIContract>(
    namespace: string,
    implementation: APIImplementation<C>,
  ): () => Promise<void> {
    if (!/^[a-zA-Z][a-zA-Z0-9]*(?:[._-][a-zA-Z0-9]+)*$/.test(namespace))
      throw new TypeError("Invalid API namespace");
    if (this.owners.has(namespace))
      throw new TypeError(`API namespace already registered: ${namespace}`);
    describeAPI(implementation.contract);
    const methods = Object.fromEntries(
      Object.entries(implementation.contract.methods).map(([key, value]) => [
        `${namespace}.${key}`,
        value,
      ]),
    );
    const events = Object.fromEntries(
      Object.entries(implementation.contract.events).map(([key, value]) => [
        `${namespace}.${key}`,
        value,
      ]),
    );
    describeAPI({ methods, events });
    for (const key of Object.keys(methods)) {
      const local = key.slice(namespace.length + 1);
      if (
        Object.hasOwn(this.contract.methods, key) ||
        typeof implementation.handlers[local] !== "function"
      )
        throw new TypeError(`Invalid or duplicate API method: ${key}`);
    }
    for (const key of Object.keys(events))
      if (Object.hasOwn(this.contract.events, key))
        throw new TypeError(`Duplicate API event: ${key}`);
    const controller = new AbortController();
    const running = new Set<Promise<unknown>>();
    let disposal: Promise<void> | undefined;
    const dispose = () => {
      if (disposal) return disposal;
      for (const key of Object.keys(methods)) {
        delete this.contract.methods[key];
        delete this.handlers[key];
      }
      for (const key of Object.keys(events)) delete this.contract.events[key];
      this.active.delete(namespace);
      this.changed();
      controller.abort(new Error(`API provider unloaded: ${namespace}`));
      // Keep the namespace reserved until old handlers have actually settled.
      disposal = Promise.allSettled([...running]).then(() => {
        this.owners.delete(namespace);
      });
      return disposal;
    };
    for (const [key, definition] of Object.entries(methods)) {
      const handler = implementation.handlers[key.slice(namespace.length + 1)]!;
      this.contract.methods[key] = definition;
      this.handlers[key] = (input, context) => {
        const signal = AbortSignal.any([context.signal, controller.signal]);
        const operation = Promise.resolve().then(async () => {
          signal.throwIfAborted();
          const result = await handler(input, {
            ...context,
            signal,
            emit(event, payload) {
              signal.throwIfAborted();
              if (!Object.hasOwn(implementation.contract.events, event))
                throw new TypeError(`Unknown provider event: ${event}`);
              context.emit(`${namespace}.${event}`, payload);
            },
          });
          signal.throwIfAborted();
          return result;
        });
        running.add(operation);
        return operation.finally(() => {
          running.delete(operation);
        });
      };
    }
    Object.assign(this.contract.events, events);
    this.owners.set(namespace, dispose);
    this.active.add(namespace);
    this.changed();
    return dispose;
  }

  async dispose(): Promise<void> {
    await Promise.all([...this.owners.values()].map((dispose) => dispose()));
  }
}

export function createAPIRegistry(): APIRegistry {
  return new APIRegistry();
}
export function defineAPI<
  const M extends Record<string, APIMethod>,
  const E extends Record<string, APIEvent> = Record<never, never>,
>(definition: { methods: M; events?: E }): { methods: M; events: E } {
  const contract = { ...definition, events: definition.events ?? ({} as E) };
  describeAPI(contract);
  return contract;
}
export function implementAPI<C extends APIContract>(
  contract: C,
  handlers: APIHandlers<C>,
): APIImplementation<C> {
  for (const name of new Set([
    ...Object.keys(contract.methods),
    ...Object.keys(handlers),
  ])) {
    if (
      !Object.hasOwn(contract.methods, name) ||
      typeof handlers[name] !== "function"
    )
      throw new TypeError("API handler mismatch: " + name);
  }
  return { contract, handlers: handlers as APIImplementation["handlers"] };
}
export function describeAPI(contract: APIContract): APISchema {
  const name = (key: string, description: string) => {
    if (
      !/^[a-zA-Z][a-zA-Z0-9]*(?:[._-][a-zA-Z0-9]+)*$/u.test(key) ||
      key.length > 128 ||
      !description?.trim()
    )
      throw new TypeError("API names and descriptions are required: " + key);
  };
  const schema = (
    value: z.ZodType,
    path: string,
    io: "input" | "output" = "output",
  ) => {
    try {
      return z.toJSONSchema(value, { io, unrepresentable: "throw" });
    } catch (error) {
      throw new TypeError(
        `Invalid API schema at ${path}: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  };
  return {
    protocolVersion: 1,
    methods: Object.fromEntries(
      Object.entries(contract.methods).map(([key, method]) => {
        name(key, method.description);
        const input = schema(method.input, `methods.${key}.input`, "input");
        const output = schema(method.output, `methods.${key}.output`);
        for (const example of method.examples ?? []) {
          assertJSON(example);
          method.input.parse(example.input);
          if (Object.hasOwn(example, "output"))
            method.output.parse(example.output);
        }
        return [
          key,
          {
            description: method.description,
            input,
            output,
            ...(method.examples ? { examples: method.examples } : {}),
          },
        ];
      }),
    ),
    events: Object.fromEntries(
      Object.entries(contract.events).map(([key, event]) => {
        name(key, event.description);
        return [
          key,
          {
            description: event.description,
            payload: schema(event.payload, `events.${key}.payload`),
          },
        ];
      }),
    ),
  };
}
