import { z } from "@semicoder/fia/api";
import { recordSchemas } from "./src/protocol.ts";
const schemas = Object.fromEntries(
  Object.entries(recordSchemas).map(([key, value]) => [key, z.toJSONSchema(value)]),
);
await Bun.write(
  new URL(
    "../../clients/apple/FnChatCore/Sources/FnChatCore/Resources/session-contracts.json",
    import.meta.url,
  ),
  JSON.stringify(schemas, null, 2) + "\n",
);
