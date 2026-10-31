import type * as Modules from "@deepseek-ai/dsh-client-modules/client";
import type {
  ClientModuleLoaderTarget,
  ClientModuleSystem,
  WebBootGraph,
} from "@deepseek-ai/dsh-client-modules/client";

/** Reuse the upstream module engine and unchanged materialized records; profile instances remain Loader-owned. */
export function nextModules(
  exports: typeof Modules,
  target: ClientModuleLoaderTarget,
  boot: WebBootGraph,
  shared: Record<string, unknown>,
  loadBundle: (url: string) => Promise<void>,
  previous?: ClientModuleSystem,
) {
  const id = "@deepseek-ai/dsh-client-modules";
  const next = exports.createClientModuleSystem(
    target,
    { id, exports: exports as unknown as Record<string, unknown> },
    { boot, staticModules: shared, loadBundle },
  );
  if (previous) {
    const revisions = new Map(previous.manifest.modules.map((row) => [row.id, row.rev]));
    const unchanged = new Set(
      next.manifest.modules.filter((row) => revisions.get(row.id) === row.rev).map((row) => row.id),
    );
    // A materialized factory's require closure still belongs to its original engine. Its lazy scripts
    // are routed to that engine by the shell, and its immutable asset URLs remain served by the host.
    for (const [key, record] of previous.loadCache) {
      if (unchanged.has(record.id) && key !== id) next.loadCache.set(key, record);
    }
  }
  return next;
}
