import { createClient } from "@semicoder/fia/client";
import type api from "../shared/runtime-api";
export const runtimeClient = createClient<typeof api>();
