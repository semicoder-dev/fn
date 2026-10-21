/** Payload budgets leave room for FIA's 1 MiB request/response envelope. */
export const MAX_KV_VALUE_BYTES = 256 * 1024;
export const MAX_LIST_PAGE_BYTES = 512 * 1024;
export const MAX_LIST_PAGE_ITEMS = 100;
const encoder = new TextEncoder();

export interface RuntimePage<T> {
  items: T[];
  nextOffset: number;
  hasMore: boolean;
}
export function jsonBytes(value: unknown): number {
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw new TypeError("Value must be JSON serializable");
  return encoder.encode(encoded).byteLength;
}
export function checkedKvValue<T>(value: T): T {
  if (jsonBytes(value) > MAX_KV_VALUE_BYTES)
    throw new RangeError("KV value exceeds 256 KiB of UTF-8 JSON; store large content in application-managed files instead");
  return value;
}
export function boundedPage<T>(values: readonly T[], offset = 0, limit = 50): RuntimePage<T> {
  if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit)
    || limit < 1 || limit > MAX_LIST_PAGE_ITEMS) throw new RangeError("Invalid list page: offset >= 0 and limit 1–100 required");
  const items: T[] = [];
  // Reserve JSON envelope bytes, including cursor digit growth.
  let bytes = 128;
  for (let index = offset; index < values.length && items.length < limit; index++) {
    const itemBytes = jsonBytes(values[index]) + 1;
    if (bytes + itemBytes > MAX_LIST_PAGE_BYTES) {
      if (!items.length) throw new RangeError(`List item at offset ${index} exceeds the 512 KiB page budget`);
      break;
    }
    items.push(values[index]!);
    bytes += itemBytes;
  }
  const nextOffset = offset + items.length;
  return { items, nextOffset, hasMore: nextOffset < values.length };
}
