import { readdir } from "node:fs/promises";
const host = await readdir("frontend");
if (host.some((name) => name.endsWith(".css")))
  throw new Error("Product styles belong to UI plugins, not the host");
console.log("Host has no product styles; UI plugins own lifecycle-managed CSS");
