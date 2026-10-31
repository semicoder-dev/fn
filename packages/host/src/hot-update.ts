import type { Generation } from "./generations.ts";
import { children } from "./profile-schema.ts";
import { packageName, same } from "./live-profile.ts";

/** Core/profile owners are restart boundaries; ordinary external leaf entries may be replaced. */
export function planHotUpdate(
  previous: Generation,
  next: Generation,
): { changed: Set<string>; reason?: string } {
  const changed = new Set<string>();
  const result = (reason?: string) => ({ changed, reason });
  if (
    previous.manifest.seedId !== next.manifest.seedId ||
    previous.manifest.core !== next.manifest.core ||
    !same(previous.manifest.coreVersions, next.manifest.coreVersions)
  )
    return result("共享内核发生变化");
  const plugins = new Map(
    [...previous.plugins, ...next.plugins].map((plugin) => [plugin.packageName, plugin]),
  );
  for (const name of plugins.keys()) {
    const before = previous.plugins.find((plugin) => plugin.packageName === name);
    const after = next.plugins.find((plugin) => plugin.packageName === name);
    // Entry/archive projection paths include the generation directory even for unchanged code.
    if (
      !before ||
      !after ||
      before.storage !== after.storage ||
      before.version !== after.version ||
      before.dependencyLockSha256 !== after.dependencyLockSha256 ||
      before.hotReload !== after.hotReload
    )
      changed.add(name);
  }
  for (const side of ["plugins", "client"] as const) {
    const before = previous.manifest.profile[side],
      after = next.manifest.profile[side];
    const fixed = (rows: typeof before) =>
      rows.filter((row) => !plugins.has(packageName(row.name)));
    if (!same(fixed(before), fixed(after))) return result("基础插件组合发生变化");
    for (const row of [...before, ...after]) {
      if (!plugins.has(packageName(row.name))) continue;
      if (row.group || children(row).length) return result("插件拥有嵌套组合");
      const old = before.find((entry) => entry.id === row.id),
        updated = after.find((entry) => entry.id === row.id);
      if (!same(old, updated)) changed.add(packageName(row.name));
    }
  }
  for (const name of changed) {
    for (const plugin of [...previous.plugins, ...next.plugins].filter(
      (plugin) => plugin.packageName === name,
    )) {
      if (!plugin.storage) return result("插件没有独立版本目录");
      if (plugin.hotReload === false) return result("插件声明需要重启");
    }
  }
  return result();
}
