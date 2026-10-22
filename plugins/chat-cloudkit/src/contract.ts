import { defineAPI, z } from "@semicoder/fia/api";
import { empty, method } from "@semicoder/fn-host/contract";
export default defineAPI({
  methods: {
    status: method("Read CloudKit synchronization state", empty, z.json()),
    connect: method("Connect Chat to this iCloud account", empty, z.null()),
    sync: method("Synchronize Chat commands and projections", empty, z.null()),
  },
  events: { changed: { description: "CloudKit synchronization changed", payload: empty } },
});
