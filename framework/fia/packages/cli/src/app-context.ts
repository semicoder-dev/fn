import { resolve } from "node:path";

/** Immutable runtime resources must not follow a switched code-release directory. */
export function appDirectories(
  initialize: { development: boolean; webRoot: string; bundlePath?: string },
  projectRoot = process.cwd(),
): { codeDirectory: string; runtimeDirectory: string } {
  if (initialize.development) return { codeDirectory: projectRoot, runtimeDirectory: projectRoot };
  return {
    codeDirectory: resolve(initialize.webRoot, "../backend"),
    runtimeDirectory: initialize.bundlePath
      ? resolve(initialize.bundlePath, "Contents/Resources/runtime")
      : // Older initialization frames predate runtime assets and bundlePath.
        resolve(initialize.webRoot, "../../runtime"),
  };
}
