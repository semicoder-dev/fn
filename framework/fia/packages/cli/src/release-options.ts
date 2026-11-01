export function parseApplicationReleaseOptions(args: readonly string[]) {
  let update = false,
    withUpdate = false,
    runtimeBase: string | undefined;
  const seen = new Set<string>();
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (seen.has(arg)) throw new Error("Duplicate release option: " + arg);
    seen.add(arg);
    if (arg === "--update") update = true;
    else if (arg === "--with-update") withUpdate = true;
    else if (arg === "--runtime-base") {
      runtimeBase = args[++index];
      if (!runtimeBase || runtimeBase.startsWith("--"))
        throw new Error("--runtime-base requires a lock file");
    } else throw new Error("Unknown release option: " + arg);
  }
  if (update && withUpdate)
    throw new Error("--update and --with-update are mutually exclusive");
  return { update, withUpdate, runtimeBase };
}
