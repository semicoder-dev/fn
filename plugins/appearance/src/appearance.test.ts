import { expect, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Document } from "@semicoder/fn-host/document";
import { appearanceSchema, appearanceUpdate } from "./theme.ts";
import { parsePreferences } from "./preferences.ts";

test("existing candidate preferences retain their mode and stop persisting removed colors", async () => {
  const root = await mkdtemp(join(tmpdir(), "fn-appearance-"));
  try {
    for (const theme of ["system", "light", "dark"] as const) {
      const path = join(root, `${theme}.json`);
      // Retired colors no longer affect startup, even if that data is invalid.
      const previous = { theme, colorTheme: { preset: "custom", custom: "retired" } };
      await writeFile(path, JSON.stringify(previous));
      const document = await Document.open(path, { theme: "system" }, parsePreferences);
      try {
        expect(document.value).toEqual({ theme });
        expect(JSON.parse(await readFile(path, "utf8"))).toEqual(previous);
        await document.update((draft) => {
          draft.theme = "light";
        });
        expect(JSON.parse(await readFile(path, "utf8"))).toEqual({ theme: "light" });
      } finally {
        await document.close();
      }
      const reopened = await Document.open(path, { theme: "system" }, parsePreferences);
      expect(reopened.value).toEqual({ theme: "light" });
      await reopened.close();
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("appearance API accepts only a valid light, dark or system mode", () => {
  for (const theme of ["system", "light", "dark"] as const) {
    expect(appearanceSchema.parse({ theme })).toEqual({ theme });
    expect(appearanceUpdate.parse({ theme })).toEqual({ theme });
  }
  for (const input of [
    {},
    { colorTheme: { preset: "default" } },
    { theme: "dark", colorTheme: { preset: "custom" } },
    { theme: "github" },
  ]) {
    expect(appearanceUpdate.safeParse(input).success).toBe(false);
  }
  expect(() => parsePreferences({ theme: "invalid", colorTheme: {} })).toThrow();
  expect(() => parsePreferences({ theme: "light", unrelated: true })).toThrow();
});
