import type { Context } from "@deepseek-ai/cordis";
import { defineTool } from "@deepseek-ai/dsh-tools";
import {
  checkedText,
  httpURL,
  limitedText,
  within,
  workspace,
  toolContext,
  registerTools,
  MAX_TOOL_OUTPUT_BYTES,
  MAX_TOOL_FILE_BYTES,
} from "@semicoder/fn-tool-support";
import type {} from "@semicoder/fn-host";
export const name = "fn-tool-native";
export const inject = ["tools", "sessionController"];
export function apply(ctx: Context) {
  const options = toolContext(ctx);
  registerTools(
    ctx,
    [
      defineTool({
        name: "open_url",
        description: "Open an HTTP or HTTPS URL in the user's browser.",
        parameters: { url: { type: "string", required: true } },
        output: {
          schema: {
            type: "object",
            additionalProperties: false,
            properties: { url: { type: "string", required: true } },
          },
          render: (_args, value) => [{ type: "text", text: `Opened ${value.url}` }],
        },
        async execute({ url }, exec) {
          const address = httpURL(url);
          exec.signal.throwIfAborted();
          await ctx.host.platform.native.system.openURL({ url: address }, { signal: exec.signal });
          exec.signal.throwIfAborted();
          return { url: address };
        },
      }),
    ],
    ["open_url"],
  );
}
