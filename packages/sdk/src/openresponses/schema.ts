/** JSON Schema keywords used by the pinned OpenResponses contract. Generation
 * rejects new keywords so an upstream constraint cannot silently go unchecked. */
export interface Schema {
  $ref?: string;
  type?:
    "object" | "array" | "string" | "number" | "integer" | "boolean" | "null";
  enum?: unknown[];
  properties?: Record<string, Schema>;
  required?: string[];
  additionalProperties?: boolean | Schema;
  items?: Schema;
  anyOf?: Schema[];
  oneOf?: Schema[];
  allOf?: Schema[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  maxProperties?: number;
}

export interface ProtocolIssue {
  path: string;
  message: string;
}
/** Validate without defaults, coercion, stripping extension fields or mutation. */
export function validateSchema(
  schema: Schema,
  value: unknown,
  schemas: Record<string, Schema>,
  path = "$",
  depth = 0,
): ProtocolIssue | undefined {
  const fail = (message: string) => ({ path, message });
  if (depth > 128) return fail("Maximum protocol nesting exceeded");
  const check = (next: Schema, item = value, at = path) =>
    validateSchema(next, item, schemas, at, depth + 1);
  if (schema.$ref) {
    const target = schemas[schema.$ref.split("/").at(-1)!];
    if (!target) return fail("Unknown protocol reference");
    const issue = check(target);
    if (issue) return issue;
  }
  for (const [key, exactlyOne] of [
    ["anyOf", false],
    ["oneOf", true],
  ] as const) {
    const variants = schema[key];
    if (variants) {
      const issues = variants.map((variant) => check(variant));
      const matches = issues.filter((issue) => !issue).length;
      if (!matches || (exactlyOne && matches !== 1))
        return fail(
          `Expected ${exactlyOne ? "exactly one" : "a"} protocol variant`,
        );
    }
  }
  for (const variant of schema.allOf ?? []) {
    const issue = check(variant);
    if (issue) return issue;
  }
  if (schema.enum && !schema.enum.some((item) => Object.is(item, value)))
    return fail("Invalid enum value");
  switch (schema.type) {
    case "null":
      if (value !== null) return fail("Expected null");
      break;
    case "boolean":
      if (typeof value !== "boolean") return fail("Expected boolean");
      break;
    case "string": {
      if (typeof value !== "string") return fail("Expected string");
      const length = Array.from(value).length;
      if (schema.minLength !== undefined && length < schema.minLength)
        return fail("String too short");
      if (schema.maxLength !== undefined && length > schema.maxLength)
        return fail("String too long");
      if (schema.pattern && !new RegExp(schema.pattern, "u").test(value))
        return fail("String does not match pattern");
      break;
    }
    case "number":
    case "integer":
      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        (schema.type === "integer" && !Number.isInteger(value))
      )
        return fail("Expected finite " + schema.type);
      if (schema.minimum !== undefined && value < schema.minimum)
        return fail("Number below minimum");
      if (schema.maximum !== undefined && value > schema.maximum)
        return fail("Number above maximum");
      break;
    case "array":
      if (!Array.isArray(value)) return fail("Expected array");
      if (schema.minItems !== undefined && value.length < schema.minItems)
        return fail("Too few items");
      if (schema.maxItems !== undefined && value.length > schema.maxItems)
        return fail("Too many items");
      for (let i = 0; i < value.length; i++) {
        const issue = check(schema.items ?? {}, value[i], `${path}[${i}]`);
        if (issue) return issue;
      }
      break;
    case "object": {
      if (!value || typeof value !== "object" || Array.isArray(value))
        return fail("Expected object");
      const object = value as Record<string, unknown>;
      if (
        schema.maxProperties !== undefined &&
        Object.keys(object).length > schema.maxProperties
      )
        return fail("Too many properties");
      for (const name of schema.required ?? [])
        if (!Object.hasOwn(object, name) || object[name] === undefined)
          return {
            path: `${path}.${name}`,
            message: "Required property missing",
          };
      for (const [name, item] of Object.entries(object)) {
        // JSON serialization omits optional undefined properties. Required fields were checked above.
        if (item === undefined) continue;
        const property = Object.hasOwn(schema.properties ?? {}, name)
          ? schema.properties![name]
          : undefined;
        if (!property && schema.additionalProperties === false)
          return { path: `${path}.${name}`, message: "Unknown property" };
        const shape =
          property ??
          (typeof schema.additionalProperties === "object"
            ? schema.additionalProperties
            : undefined);
        if (shape) {
          const issue = check(shape, item, `${path}.${name}`);
          if (issue) return issue;
        }
      }
    }
  }
}
