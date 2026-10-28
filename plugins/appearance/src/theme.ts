import { z } from "@semicoder/fia/api";

export const themeMode = z.enum(["system", "light", "dark"]);
export type ThemeMode = z.infer<typeof themeMode>;
export type ColorMode = "light" | "dark";
const hex = z.string().regex(/^#[0-9a-f]{6}$/i, "请输入完整的六位 HEX 颜色，如 #1F6FEB");
const palette = z
  .strictObject({ accent: hex, background: hex, foreground: hex })
  .refine((value) => contrast(value.background, value.foreground) >= 4.5, {
    message: "前景与背景的对比度需达到 4.5:1，请调整颜色。",
  });
export type Palette = z.infer<typeof palette>;
export const themePresets = {
  default: {
    light: { accent: "#0F1115", background: "#FFFFFF", foreground: "#0F1115" },
    dark: { accent: "#F9FAFB", background: "#151517", foreground: "#F9FAFB" },
  },
  github: {
    light: { accent: "#0969DA", background: "#FFFFFF", foreground: "#1F2328" },
    dark: { accent: "#1F6FEB", background: "#0D1117", foreground: "#E6EDF3" },
  },
} satisfies Record<string, Record<ColorMode, Palette>>;
export const colorThemeSchema = z.strictObject({
  preset: z.enum(["default", "github", "custom"]),
  custom: z.strictObject({ light: palette, dark: palette }),
});
export type ColorTheme = z.infer<typeof colorThemeSchema>;
export const defaultColorTheme = (): ColorTheme => ({
  preset: "default",
  custom: structuredClone(themePresets.default),
});
export const appearanceSchema = z.strictObject({ theme: themeMode, colorTheme: colorThemeSchema });
export const appearanceUpdate = appearanceSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0);
export type AppearanceConfig = z.infer<typeof appearanceSchema>;
export type AppearanceUpdate = z.infer<typeof appearanceUpdate>;
export const paletteFor = (theme: ColorTheme, mode: ColorMode): Palette =>
  theme.preset === "custom" ? theme.custom[mode] : themePresets[theme.preset][mode];

function channels(color: string) {
  return [1, 3, 5].map((index) => parseInt(color.slice(index, index + 2), 16));
}
function luminance(color: string) {
  const values = channels(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return values[0]! * 0.2126 + values[1]! * 0.7152 + values[2]! * 0.0722;
}
export function contrast(a: string, b: string) {
  const first = luminance(a),
    second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
function mix(a: string, b: string, amount: number) {
  const end = channels(b);
  return (
    "#" +
    channels(a)
      .map((start, index) =>
        Math.round(start + (end[index]! - start) * amount)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
function readable(color: string, backgrounds: string[], ratio = 4.5) {
  const destination = ["#000000", "#ffffff"].sort(
    (a, b) =>
      Math.min(...backgrounds.map((bg) => contrast(b, bg))) -
      Math.min(...backgrounds.map((bg) => contrast(a, bg))),
  )[0]!;
  for (let step = 0; step <= 100; step++) {
    const candidate = mix(color, destination, step / 100);
    if (backgrounds.every((bg) => contrast(candidate, bg) >= ratio)) return candidate;
  }
  return destination;
}

/** Overrides are applied to body so original DSH controls and their portals inherit them. */
export function colorTokens(theme: ColorTheme, mode: ColorMode): Record<string, string> {
  if (theme.preset === "default") return {};
  const { background: bg, foreground: fg, accent } = paletteFor(theme, mode);
  const dark = luminance(bg) < 0.4;
  const surface = (amount: number) => {
    // Keep the user's foreground readable even for palettes near the minimum contrast.
    for (let step = amount; step > 0; step -= 0.005) {
      const value = mix(bg, fg, step);
      if (contrast(value, fg) >= 4.5) return value;
    }
    return bg;
  };
  const surfaces = [bg, surface(0.06), surface(0.12), surface(0.16)];
  const muted = readable(mix(bg, fg, 0.65), surfaces);
  const onAccent =
    contrast(accent, "#ffffff") >= contrast(accent, "#000000") ? "#ffffff" : "#000000";
  const sidebar = dark ? mix(bg, "#000000", 0.3) : surface(0.025);
  return {
    "--dsw-alias-bg-base": bg,
    "--dsw-alias-bg-layer-1": surfaces[0]!,
    "--dsw-alias-bg-layer-2": surfaces[1]!,
    "--dsw-alias-bg-layer-3": surfaces[2]!,
    "--dsw-alias-bg-module-platform": surfaces[1]!,
    "--dsw-alias-label-primary": fg,
    "--dsw-alias-label-secondary": muted,
    "--dsw-alias-label-tertiary": muted,
    "--dsw-alias-label-caption": muted,
    "--dsw-alias-label-primary-inverted": onAccent,
    "--dsw-alias-brand-primary": accent,
    "--dsw-alias-brand-text": fg,
    "--dsw-alias-button-primary-fill": accent,
    "--dsw-alias-button-primary-hover": mix(
      accent,
      onAccent === "#ffffff" ? "#000000" : "#ffffff",
      0.08,
    ),
    "--dsw-alias-border-l1": mix(bg, fg, 0.1),
    "--dsw-alias-border-l2": mix(bg, fg, 0.18),
    "--dsw-alias-border-l3": mix(bg, fg, 0.22),
    "--dsw-alias-border-l4": mix(bg, fg, 0.24),
    "--dsw-alias-interactive-bg-hover": surfaces[2]!,
    "--dsw-alias-interactive-bg-active": surfaces[3]!,
    "--dsw-alias-interactive-bg-hover-solid": surfaces[2]!,
    "--dsw-specific-sidebar-fill": contrast(sidebar, fg) >= 4.5 ? sidebar : bg,
    "--dsw-specific-sidebar-nav-item-hover": surfaces[2]!,
    "--dsw-specific-sidebar-nav-item-active": surfaces[3]!,
    "--dsw-menu-surface-fill": surfaces[1]!,
    "--dsw-alias-menu-group-header-fill": surfaces[1]!,
    "--dsw-alias-menu-icon": fg,
    "--dsw-specific-input-major": bg,
    "--dsw-specific-selector": surfaces[1]!,
    "--dsw-alias-state-error-primary": readable("#c42b1c", surfaces),
    "--dsw-alias-state-success-primary": readable("#287d3c", surfaces),
    "--dsw-alias-state-warn-label": readable("#8a6800", surfaces),
  };
}
