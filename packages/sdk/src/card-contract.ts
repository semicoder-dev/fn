// Generated from packages/runtime/src/types.ts. Run bun packages/sdk/generate-cordis-types.ts.
import { z } from "zod";
export const idSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[A-Za-z0-9_.-]+$/);
export type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue };
export const jsonSchema: z.ZodType<JSONValue> = z.lazy(() =>
  z.union([
    z.null(),
    z.boolean(),
    z.number().finite(),
    z.string(),
    z.array(jsonSchema),
    z.record(z.string(), jsonSchema),
  ]),
);
const option = z.strictObject({ id: idSchema, label: z.string().min(1).max(200) });
export const fieldSchema = z
  .strictObject({
    id: idSchema,
    label: z.string().min(1).max(200),
    type: z.enum(["text", "number", "boolean", "select", "multiSelect"]),
    required: z.boolean(),
    options: z.array(option).min(1).max(50).optional(),
    maxLength: z.number().int().min(1).max(16000).optional(),
    minimum: z.number().finite().optional(),
    maximum: z.number().finite().optional(),
  })
  .superRefine((f, ctx) => {
    if (
      ["select", "multiSelect"].includes(f.type) !== !!f.options ||
      (f.options && new Set(f.options.map((o) => o.id)).size !== f.options.length) ||
      (f.maxLength !== undefined && f.type !== "text") ||
      ((f.minimum !== undefined || f.maximum !== undefined) && f.type !== "number") ||
      (f.minimum !== undefined && f.maximum !== undefined && f.minimum > f.maximum)
    )
      ctx.addIssue({ code: "custom", message: "卡片字段约束无效" });
  });
export const cardSchema = z
  .strictObject({
    version: z.literal(1),
    template: z.enum(["approval", "choice", "form"]),
    title: z.string().min(1).max(160),
    summary: z.string().max(512),
    blocks: z
      .array(
        z.discriminatedUnion("type", [
          z.strictObject({ type: z.literal("text"), text: z.string().max(16000) }),
          z.strictObject({
            type: z.literal("fields"),
            fields: z
              .array(z.strictObject({ label: z.string().max(200), value: z.string().max(2000) }))
              .max(20),
          }),
          z.strictObject({ type: z.literal("divider") }),
        ]),
      )
      .max(30),
    inputs: z.array(fieldSchema).max(20),
    actions: z
      .array(
        z.strictObject({
          id: idSchema,
          label: z.string().min(1).max(80),
          style: z.enum(["normal", "primary", "danger"]).optional(),
        }),
      )
      .min(1)
      .max(10),
  })
  .superRefine((card, ctx) => {
    if (
      new Set(card.inputs.map((f) => f.id)).size !== card.inputs.length ||
      new Set(card.actions.map((a) => a.id)).size !== card.actions.length
    )
      ctx.addIssue({ code: "custom", message: "卡片控件 ID 重复" });
  });
export type ChatCard = z.infer<typeof cardSchema>;
export function validateResponse(
  card: ChatCard,
  actionId: string,
  values: Record<string, JSONValue>,
) {
  cardSchema.parse(card);
  if (!card.actions.some((a) => a.id === actionId)) throw new Error("卡片操作不存在");
  for (const key of Object.keys(values))
    if (!card.inputs.some((f) => f.id === key)) throw new Error("未知卡片输入");
  for (const f of card.inputs) {
    const v = values[f.id];
    if (v === undefined) {
      if (f.required) throw new Error("请填写：" + f.label);
      continue;
    }
    let valid = false;
    switch (f.type) {
      case "text":
        valid =
          typeof v === "string" &&
          (!f.required || !!v.trim()) &&
          v.length <= (f.maxLength ?? 16000);
        break;
      case "number":
        valid =
          typeof v === "number" &&
          Number.isFinite(v) &&
          (f.minimum === undefined || v >= f.minimum) &&
          (f.maximum === undefined || v <= f.maximum);
        break;
      case "boolean":
        valid = typeof v === "boolean";
        break;
      case "select":
        valid = typeof v === "string" && !!f.options?.some((o) => o.id === v);
        break;
      case "multiSelect":
        valid =
          Array.isArray(v) &&
          (!f.required || v.length > 0) &&
          new Set(v).size === v.length &&
          v.every((x) => typeof x === "string" && f.options?.some((o) => o.id === x));
        break;
    }
    if (!valid) throw new Error("输入格式无效：" + f.label);
  }
}

export const cardValuesSchema = z.record(idSchema, z.union([z.string().max(16000), z.number().finite(), z.boolean(), z.array(z.string().max(200)).max(50)]));
export type CardValues = z.infer<typeof cardValuesSchema>;
export const sessionCardSchema = z.strictObject({
  id: z.string().min(1).max(100), sessionId: z.string().min(1).max(100),
  createdAt: z.number().int().nonnegative().safe(), expiresAt: z.number().int().nonnegative().safe(),
  state: z.enum(["pending", "running", "completed", "failed", "cancelled", "expired", "interrupted"]),
  card: cardSchema,
  answer: z.strictObject({ actionId: idSchema, values: cardValuesSchema }).optional(),
  error: z.string().max(1024).optional(),
});
export type SessionCard = z.infer<typeof sessionCardSchema>;
export interface CardResponse { sessionId: string; cardId: string; actionId: string; values: CardValues; }
export interface ApplicationCards {
  /** Register an application-scoped handler; replies are claimed durably before invocation. */
  action(name: string, handler: (response: CardResponse) => void | Promise<void>): () => void;
  /** key is an idempotency key within this Session. Definitions are immutable. */
  create(sessionId: string, input: { key: string; handler: string; card: ChatCard; expiresAt?: number }): SessionCard;
  cancel(cardId: string): void;
}
