import { expect, test } from "bun:test";
import { classes } from "../src/classes.ts";

test("resolves compound CSS Module classes used by the board header", () => {
  expect(
    classes(
      { "kb-topbar": "topbar_hash", "kb-board-header": "header_hash" },
      "kb-topbar kb-board-header",
    ),
  ).toBe("topbar_hash header_hash");
});

test("resolves dynamic label classes and skips empty conditional values", () => {
  const color = "green";
  expect(
    classes(
      { "kb-label-color": "color_hash", "kb-green": "green_hash" },
      false,
      ` kb-label-color\t kb-${color}\n`,
      undefined,
      "",
      "  ",
    ),
  ).toBe("color_hash green_hash");
});

test("preserves external classes and CSS Module compositions in order", () => {
  expect(
    classes({ button: "button_hash base_hash" }, "button", "external active"),
  ).toBe("button_hash base_hash external active");
});
