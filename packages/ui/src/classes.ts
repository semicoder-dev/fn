/** Resolve each CSS Module class, preserving classes from other sources. */
export const classes = (
  map: Record<string, string>,
  ...names: (string | false | undefined)[]
) =>
  names
    .flatMap((name) => (name ? name.split(/\s+/).filter(Boolean) : []))
    .map((name) => map[name] ?? name)
    .join(" ");
