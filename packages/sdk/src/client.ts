import type { Context } from "@deepseek-ai/cordis";
import type { APIClient, APIContract } from "@semicoder/fia/api";
import type { native } from "@semicoder/fia/client";
import type {} from "@deepseek-ai/dsh-client-ui-renderer/client";

export interface ClientPlatform {
  readonly native: typeof native;
  readonly api: APIClient;
}
declare module "@deepseek-ai/cordis" {
  interface Context {
    platform: ClientPlatform;
  }
}

/** A typed namespace view; requests and subscriptions are owned by the calling fiber. */
export function client<C extends APIContract>(
  ctx: Context,
  namespace: string,
  _contract: C,
): APIClient<C> {
  const signal = new AbortController();
  const stops = new Set<() => void>();
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    signal.abort();
    for (const off of stops) off();
    stops.clear();
  };
  ctx.effect(() => close);
  const own = (stop: () => void) => {
    stops.add(stop);
    return () => {
      stops.delete(stop);
      stop();
    };
  };
  return {
    call: (method, input, options = {}) => {
      signal.signal.throwIfAborted();
      return ctx.platform.api.call(`${namespace}.${method}`, input, {
        ...options,
        signal: AbortSignal.any([signal.signal, ...(options.signal ? [options.signal] : [])]),
      }) as never;
    },
    on: (event, listener, options) => {
      signal.signal.throwIfAborted();
      return own(ctx.platform.api.on(`${namespace}.${event}`, listener as never, options));
    },
    onReconnect: (listener) => {
      signal.signal.throwIfAborted();
      return own(ctx.platform.api.onReconnect(listener));
    },
    close,
  };
}
export async function readAllPages<T>(
  read: (
    offset: number,
    limit: number,
  ) => Promise<{ items: T[]; hasMore: boolean; nextOffset: number }>,
): Promise<T[]> {
  const result: T[] = [];
  let offset = 0;
  for (let page = 0; page < 1000; page++) {
    const value = await read(offset, 100);
    result.push(...value.items);
    if (!value.hasMore) return result;
    if (value.nextOffset <= offset) throw new Error("Pagination did not advance");
    offset = value.nextOffset;
  }
  throw new Error("Pagination limit exceeded");
}
