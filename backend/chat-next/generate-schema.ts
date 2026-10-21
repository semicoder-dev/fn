import { z } from "@semicoder/fia/api";
import { recordSchemas } from "./protocol.ts";

const path = new URL("../../clients/apple/FnChatCore/Sources/FnChatCore/Resources/session-contracts.json", import.meta.url);
const expected = JSON.stringify(Object.fromEntries(Object.entries(recordSchemas).map(([key, value]) => [key, z.toJSONSchema(value)])), null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (await Bun.file(path).text() !== expected) throw new Error("Session Chat Swift schemas are stale");
} else {
  await Bun.write(path, expected);
}
