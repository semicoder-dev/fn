import { z } from "@semicoder/fia/api";

export const themeMode = z.enum(["system", "light", "dark"]);
export type ThemeMode = z.infer<typeof themeMode>;
export const appearanceSchema = z.strictObject({ theme: themeMode });
export const appearanceUpdate = appearanceSchema;
export type AppearanceConfig = z.infer<typeof appearanceSchema>;
export type AppearanceUpdate = z.infer<typeof appearanceUpdate>;
