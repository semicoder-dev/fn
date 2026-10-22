import { z } from "@semicoder/fia/api";
import { id } from "@semicoder/fn-host/contract";
export const selection = { connectionId: id, modelId: z.string().min(1).max(256) };
export interface ModelSelection {
  connectionId: string;
  modelId: string;
}
