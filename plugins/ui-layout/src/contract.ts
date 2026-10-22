import type {} from "@deepseek-ai/dsh-client-ui-slots";
declare module "@deepseek-ai/dsh-client-ui-slots" {
  interface SlotMap {
    "fn.sidebar.top": { kind: "list"; scope: "root" };
    "fn.sidebar.bottom": { kind: "list"; scope: "root" };
    "fn.main": { kind: "keyed"; scope: "root" };
    "fn.toolbar": { kind: "list"; scope: "root" };
    "fn.status": { kind: "list"; scope: "root" };
    "fn.overlay": { kind: "list"; scope: "root" };
  }
}
