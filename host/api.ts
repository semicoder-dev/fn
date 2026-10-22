import { defineAPI } from "@semicoder/fia/api";
import contract from "./contract.ts";
// Only recovery is statically declared. Product contracts join FIA's live schema when their plugins activate.
export default defineAPI({
  methods: Object.fromEntries(
    Object.entries(contract.methods).map(([name, value]) => [`host.${name}`, value]),
  ),
  events: Object.fromEntries(
    Object.entries(contract.events).map(([name, value]) => [`host.${name}`, value]),
  ),
});
