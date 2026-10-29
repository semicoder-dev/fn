import { appearanceSchema, type AppearanceConfig } from "./theme.ts";

/** Ignore the removed palette in this candidate's own preferences, preserving its mode. */
export function parsePreferences(input: unknown): AppearanceConfig {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    const { colorTheme: _removed, ...preferences } = input as Record<string, unknown>;
    return appearanceSchema.parse(preferences);
  }
  return appearanceSchema.parse(input);
}
