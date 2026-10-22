import { defineAPI, z } from "@semicoder/fia/api";
import { empty, id, method, pagination, page } from "@semicoder/fn-host/contract";
import { marketURL, runtimeMarket, runtimeCatalogEntry } from "./schema.ts";
export default defineAPI({
  methods: {
    list: method(
      "List plugin markets",
      empty,
      z.array(runtimeMarket.extend({ count: z.number(), refreshing: z.boolean() })),
    ),
    add: method(
      "Add market",
      z.object({ name: z.string().trim().min(1).max(100), url: marketURL }),
      z.null(),
    ),
    change: method(
      "Configure market",
      z.object({
        id,
        name: z.string().trim().min(1).max(100).optional(),
        enabled: z.boolean().optional(),
      }),
      z.null(),
    ),
    remove: method("Remove market", z.object({ id }), z.null()),
    refresh: method("Refresh markets", z.object({ id: id.optional() }), z.null()),
    catalog: method(
      "List catalog",
      z.object({ ...pagination, query: z.string().max(256).default("") }),
      page(runtimeCatalogEntry),
    ),
    install: method("Install market package", z.object({ marketId: id, id }), z.null()),
  },
  events: { changed: { description: "Market changed", payload: empty } },
});
