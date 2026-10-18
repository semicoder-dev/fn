import { z } from "../packages/sdk/src/runtime";
import { recordSchemas } from "../packages/sdk/src/chat";
const output =
  JSON.stringify(
    Object.fromEntries(
      Object.entries(recordSchemas).map(([key, schema]) => [key, z.toJSONSchema(schema)]),
    ),
    null,
    2,
  ) + "\n";
const path = new URL(
  "../clients/apple/FnChatCore/Sources/FnChatCore/Resources/contracts.json",
  import.meta.url,
);
if (process.argv.includes("--check")) {
  if ((await Bun.file(path).text()) !== output)
    throw new Error("Swift chat contracts need regeneration");
} else await Bun.write(path, output);
