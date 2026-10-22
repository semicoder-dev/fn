import type {} from "@deepseek-ai/dsh-client-ui-slots";
declare module "@deepseek-ai/dsh-client-ui-slots" {
  interface SlotMap {
    "fn.settings.navigation": { kind: "list"; scope: "root" };
    "fn.settings.content": { kind: "keyed"; scope: "root" };
  }
}
