import { z } from "zod";
export type WidgetSpan = 1 | 2 | 3 | 4;
export type WidgetSize = `${WidgetSpan}x${WidgetSpan}`;
export const widgetSizeSchema = z
  .string()
  .regex(/^[1-4]x[1-4]$/, "Expected columns x rows, each between 1 and 4")
  .transform((value) => value as WidgetSize);
export function widgetDimensions(size: WidgetSize) {
  const [columns, rows] = widgetSizeSchema.parse(size).split("x").map(Number);
  return { columns: columns!, rows: rows! };
}
export const textValue = z.union([
  z.string().max(4000),
  z.strictObject({
    key: z.string().max(160),
    args: z
      .record(z.string(), z.union([z.string().max(500), z.number()]))
      .optional(),
  }),
]);
export type TextValue = z.infer<typeof textValue>;
export type WidgetNode =
  | {
      type: "row" | "column" | "list";
      gap?: "xs" | "sm" | "md";
      children: WidgetNode[];
    }
  | { type: "text"; text: TextValue; variant?: "title" | "body" | "caption" }
  | { type: "metric"; value: string | number; label?: TextValue }
  | {
      type: "badge";
      text: TextValue;
      tone?: "neutral" | "success" | "warning" | "danger";
    }
  | { type: "progress"; value: number; label?: TextValue }
  | { type: "divider" }
  | {
      type: "sparkline";
      values: number[];
      tone?: "neutral" | "success" | "warning" | "danger";
    };
export interface WidgetSnapshot {
  version: 1;
  body: WidgetNode;
}
const tone = z.enum(["neutral", "success", "warning", "danger"]);
const node: z.ZodType<WidgetNode> = z.lazy(() =>
  z.union([
    z.strictObject({
      type: z.enum(["row", "column", "list"]),
      gap: z.enum(["xs", "sm", "md"]).optional(),
      children: z.array(node).max(32),
    }),
    z.strictObject({
      type: z.literal("text"),
      text: textValue,
      variant: z.enum(["title", "body", "caption"]).optional(),
    }),
    z.strictObject({
      type: z.literal("metric"),
      value: z.union([z.string().max(100), z.number().finite()]),
      label: textValue.optional(),
    }),
    z.strictObject({
      type: z.literal("badge"),
      text: textValue,
      tone: tone.optional(),
    }),
    z.strictObject({
      type: z.literal("progress"),
      value: z.number().min(0).max(1),
      label: textValue.optional(),
    }),
    z.strictObject({ type: z.literal("divider") }),
    z.strictObject({
      type: z.literal("sparkline"),
      values: z.array(z.number().finite()).min(2).max(120),
      tone: tone.optional(),
    }),
  ]),
);
export function parseWidget(input: unknown): WidgetSnapshot {
  let count = 0;
  const inspect = (value: unknown, depth: number) => {
    if (++count > 128 || depth > 8) throw new Error("Widget complexity limit");
    if (
      value &&
      typeof value === "object" &&
      "children" in value &&
      Array.isArray(value.children)
    )
      for (const child of value.children) inspect(child, depth + 1);
  };
  if (JSON.stringify(input).length > 65536)
    throw new Error("Widget size limit");
  inspect((input as WidgetSnapshot)?.body, 0);
  return z.strictObject({ version: z.literal(1), body: node }).parse(input);
}
