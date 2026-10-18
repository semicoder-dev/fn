import { z } from "zod";
import type { BackendPlugin, JSONValue, PluginContext, PluginMethod } from "./types";
import type { AgentTool, AgentToolContext, AgentToolOutput } from "./agent";
export { z };
export type { BackendPlugin, PluginContext } from "./types";

export function defineMethod<T>(
  description: string,
  schema: z.ZodType<T>,
  handler: (input: T, context: PluginContext) => unknown | Promise<unknown>,
): PluginMethod {
  return {
    description,
    inputSchema: z.toJSONSchema(schema) as JSONValue,
    execute: (input, context) => handler(schema.parse(input), context),
  };
}

export function definePlugin(plugin: BackendPlugin): BackendPlugin {
  return plugin;
}

/** Validate model-generated arguments before executing a plugin tool. */
export function defineTool<T>(description: string, schema: z.ZodType<T>, handler: (input: T, context: AgentToolContext) => AgentToolOutput | Promise<AgentToolOutput>): AgentTool {
  return { description, inputSchema: z.toJSONSchema(schema) as JSONValue, execute: (input, context) => handler(schema.parse(input), context) };
}
