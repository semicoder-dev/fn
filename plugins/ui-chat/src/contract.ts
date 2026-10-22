import type { SessionDisplayItem } from "@semicoder/fn-session-controller/projection";
import type { SessionInfo } from "@semicoder/fn-session-controller/types";
import type {} from "@deepseek-ai/dsh-client-ui-slots";
declare module "@deepseek-ai/dsh-client-ui-slots" {
  interface SlotMap {
    "fn.chat.message": { kind: "single"; scope: "root"; owner: { item: SessionDisplayItem } };
    "fn.chat.cards": {
      kind: "list";
      scope: "root";
      owner: { sessionId: string; enabled: boolean };
    };
    "fn.chat.input-actions": { kind: "list"; scope: "root"; owner: { session: SessionInfo } };
  }
}
