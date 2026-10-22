/** Matches dsh's browser carrier: Node internal loading is unreachable in browsers. */
export function createRequire(): never {
  throw new Error("node:module is not available in the browser");
}
