import { assert } from "./config";

// The organization feed starts a new history; the retired gh-pages branch is never read or modified.
export const updateBranch = "updates-site";
export async function hasUpdateHistory(listRefs: () => Promise<string>): Promise<boolean> {
  const refs: unknown = JSON.parse(await listRefs());
  assert(Array.isArray(refs) && refs.every(ref => ref && typeof ref.ref === "string"), "Invalid update history response");
  return (refs as { ref: string }[]).some(ref => ref.ref === `refs/heads/${updateBranch}`);
}
