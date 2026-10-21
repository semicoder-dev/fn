/** The reviewed DSH release set. Updates are explicit, never registry tag based. */
export const dshRelease = "0.2.1-rc.2";

export const registry = "https://registry.npmjs.org";

export const sourceAudit = {
  repository: "https://github.com/deepseek-ai/deepseek-harness",
  commit: "687f282e8625c6b8d11ff58211a90524be2e4317",
};

export const vendorVersions: Readonly<Record<string, string>> = {
  "@deepseek-ai/cordis": "4.0.5",
  "@deepseek-ai/cosmokit": "1.8.6",
  "@deepseek-ai/schemastery": "3.18.5",
};

export const entryPackages = [
  "@deepseek-ai/cordis",
  ...[
    "agent",
    "agent-loop",
    "session",
    "session-projection",
    "system-prompt",
    "tools",
    "scope",
    "llm",
    "session-persistence",
    "session-checkpoint-policy",
    "llm-pi-ai",
    "credentials",
    "credentials-local",
    "launch-environment",
    "llm-retry",
    "user-approval",
  ].map((name) => `@deepseek-ai/dsh-${name}`),
].sort();

export function selectedVersion(name: string): string {
  if (name.startsWith("@deepseek-ai/dsh-")) return dshRelease;
  const version = vendorVersions[name];
  if (!version) throw new Error(`Unreviewed upstream package: ${name}`);
  return version;
}
