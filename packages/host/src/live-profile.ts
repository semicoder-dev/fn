import type Loader from "@deepseek-ai/cordis-plugin-loader";
import type { EntryOptions } from "@deepseek-ai/cordis-plugin-loader";

export const packageName = (name: string) =>
  name
    .split("/")
    .slice(0, name.startsWith("@") ? 2 : 1)
    .join("/");
export const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Keep unchanged entry identities. Await disposal before registering replacement services. */
export async function reconcileEntries(
  loader: Loader,
  previous: EntryOptions[],
  next: EntryOptions[],
  changed: ReadonlySet<string>,
) {
  for (const row of previous) {
    const replacement = next.find((entry) => entry.id === row.id);
    if (replacement && same(row, replacement) && !changed.has(packageName(row.name))) continue;
    const entry = loader.resolve(row.id!);
    const fiber = entry.fiber;
    if (fiber?.runtime) entry.ctx.registry.delete(fiber.runtime.callback);
    while (fiber?.inertia !== undefined) await fiber.inertia;
    delete entry.fiber;
    loader.remove(entry.id);
  }
  // Calling root.update would also update every unchanged entry. Preserve those fibers and configs.
  for (const row of next) {
    const old = previous.find((entry) => entry.id === row.id);
    if (old && same(old, row) && !changed.has(packageName(row.name))) continue;
    await loader.root.create(structuredClone(row));
  }
  loader.root.data = structuredClone(next);
  await loader.await();
  const failed = [...loader.entries()].filter(
    (entry) => !entry.disabled && entry.fiber?.state !== 2,
  );
  if (failed.length)
    throw new Error(
      `Plugin composition did not activate: ${failed.map((entry) => entry.id).join(", ")}`,
    );
}
