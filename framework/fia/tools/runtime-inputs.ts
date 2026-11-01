import { fingerprint } from "./prepare.ts";
import { repositoryRoot } from "./shared.ts";
import { nativeBuildArguments } from "./native-recipe.ts";
import { hash } from "../packages/cli/src/artifacts.ts";
import {
  BUNDLED_BUN_VERSION,
  FIA_BACKEND_PROTOCOL_VERSION,
} from "../packages/cli/src/metadata.ts";

export const runtimeSourcePaths = [
  "Package.swift",
  "Package.resolved",
  "Sources",
  "native/CloudKitTransport/Package.swift",
  "native/CloudKitTransport/Sources",
];
export async function runtimeInputs(root = repositoryRoot) {
  return hash(
    JSON.stringify({
      source: await fingerprint(root, runtimeSourcePaths),
      recipe: nativeBuildArguments,
      bun: BUNDLED_BUN_VERSION,
      protocol: FIA_BACKEND_PROTOCOL_VERSION,
      architecture: "arm64",
      minimumOS: "14.0",
    }),
  );
}
