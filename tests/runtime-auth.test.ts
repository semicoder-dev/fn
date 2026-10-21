import { expect, test } from "bun:test";
import { RuntimeAuth } from "../backend/runtime-auth.ts";
import type { FnRuntime } from "../packages/runtime/src/index.ts";
import type { AuthInteraction } from "../packages/runtime/src/auth.ts";

function fixture(login: (id: string, interaction: AuthInteraction) => Promise<void>, openURL = async (_url: string) => {}) {
  let changes = 0;
  const runtime = { connections: { auth: { login } } } as unknown as FnRuntime;
  const auth = new RuntimeAuth(runtime, openURL, () => { changes++; });
  return { auth, changes: () => changes };
}

async function until(check: () => boolean) {
  const deadline = Date.now() + 1000;
  while (!check()) {
    if (Date.now() > deadline) throw new Error("Authentication state did not settle");
    await Bun.sleep(1);
  }
}

async function bounded(work: Promise<void>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([work, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Authentication shutdown did not settle")), 250);
    })]);
  } finally { clearTimeout(timer); }
}

function promptId(auth: RuntimeAuth, id: string): string {
  return (auth.list().find(value => value.id === id)!.prompt as { id: string }).id;
}

test("authentication replies match only the current prompt and a connection cannot start twice", async () => {
  const firstSignal = new AbortController(), answers: string[] = [];
  const { auth, changes } = fixture(async (_id, interaction) => {
    answers.push(await interaction.prompt({ type: "secret", message: "API key", signal: firstSignal.signal }));
    answers.push(await interaction.prompt({ type: "text", message: "Account label" }));
  });
  const start = auth.start("connection");
  try {
    expect(() => auth.start("connection")).toThrow("已有登录进行中");
    await until(() => auth.list()[0]!.prompt !== null);
    const first = promptId(auth, start.id);
    expect(() => auth.reply(start.id, "stale", "wrong")).toThrow("已过期");
    expect(() => auth.reply("another-attempt", first, "wrong")).toThrow("已过期");
    auth.reply(start.id, first, "private-key-fixture");
    await until(() => auth.list()[0]!.prompt !== null && promptId(auth, start.id) !== first);
    const second = promptId(auth, start.id);
    firstSignal.abort();
    expect(promptId(auth, start.id)).toBe(second);
    expect(() => auth.reply(start.id, first, "wrong")).toThrow("已过期");
    expect(JSON.stringify(auth.list())).not.toContain("private-key-fixture");
    const snapshot = auth.list();
    snapshot[0]!.status = "failed";
    expect(auth.list()[0]!.status).toBe("running");
    auth.reply(start.id, second, "Label");
    await until(() => auth.list()[0]!.status === "completed");
    expect(answers).toEqual(["private-key-fixture", "Label"]);
    expect(auth.list()[0]!.prompt).toBeNull();
    expect(() => auth.reply(start.id, second, "wrong")).toThrow("已过期");
    expect(changes()).toBeGreaterThan(3);
    const retry = auth.start("connection");
    await until(() => auth.list().find(value => value.id === retry.id)!.status !== "running");
  } finally { firstSignal.abort(); await auth.close(); }
});

test("cancel and close release prompts even when the provider supplies its own signal", async () => {
  const providerSignals = new Map<string, AbortController>();
  const { auth } = fixture(async (id, interaction) => {
    const controller = new AbortController();
    providerSignals.set(id, controller);
    await interaction.prompt({ type: "manual_code", message: "Code", signal: controller.signal });
  });
  try {
    const cancelled = auth.start("cancelled");
    await until(() => auth.list()[0]!.prompt !== null);
    await bounded(auth.cancel(cancelled.id));
    expect(auth.list()[0]).toMatchObject({ status: "cancelled", prompt: null, error: null });
    expect(providerSignals.get("cancelled")!.signal.aborted).toBe(false);
    auth.start("first");
    auth.start("second");
    await until(() => auth.list().filter(value => value.prompt !== null).length === 2);
    await bounded(auth.close());
    expect(auth.list().every(value => value.status === "cancelled" && value.prompt === null)).toBe(true);
    expect(() => auth.start("after-close")).toThrow("已关闭");
  } finally {
    for (const controller of providerSignals.values()) controller.abort();
    await auth.close();
  }
});

test("provider prompt cancellation releases only that step and a following prompt stays usable", async () => {
  const providerSignal = new AbortController();
  let cancelled = false, answered = "";
  const { auth } = fixture(async (_id, interaction) => {
    try { await interaction.prompt({ type: "manual_code", message: "Manual code", signal: providerSignal.signal }); }
    catch { cancelled = true; }
    answered = await interaction.prompt({ type: "select", message: "Account", options: [{ id: "account", label: "Account" }] });
  });
  const attempt = auth.start("connection");
  try {
    await until(() => auth.list()[0]!.prompt !== null);
    const first = promptId(auth, attempt.id);
    providerSignal.abort();
    await until(() => auth.list()[0]!.prompt !== null && promptId(auth, attempt.id) !== first);
    expect(cancelled).toBe(true);
    expect(() => auth.reply(attempt.id, first, "expired")).toThrow("已过期");
    auth.reply(attempt.id, promptId(auth, attempt.id), "account");
    await until(() => auth.list()[0]!.status === "completed");
    expect(answered).toBe("account");
  } finally { providerSignal.abort(); await auth.close(); }
});

test("authentication state excludes entered credentials and raw provider or browser failure bodies", async () => {
  const secret = "fixture-access-token-never-display";
  const opened: string[] = [];
  const { auth } = fixture(async (_id, interaction) => {
    interaction.notify({ type: "auth_url", url: "https://example.invalid/authorize", instructions: "Continue in your browser" });
    const answer = await interaction.prompt({ type: "secret", message: "API key" });
    expect(answer).toBe(secret);
    throw new Error(`Provider rejected access_token=${secret}`);
  }, async url => { opened.push(url); throw new Error(`Native failure ${secret}`); });
  const attempt = auth.start("connection");
  try {
    await until(() => auth.list()[0]!.events.length === 2 && auth.list()[0]!.prompt !== null);
    expect(opened).toEqual(["https://example.invalid/authorize"]);
    expect(JSON.stringify(auth.list())).not.toContain(secret);
    expect(auth.list()[0]!.events[0]).toMatchObject({ type: "auth_url", url: opened[0] });
    auth.reply(attempt.id, promptId(auth, attempt.id), secret);
    await until(() => auth.list()[0]!.status === "failed");
    expect(auth.list()[0]!.error).toBeTruthy();
    expect(auth.list()[0]!.prompt).toBeNull();
    expect(JSON.stringify(auth.list())).not.toContain(secret);
  } finally { await auth.close(); }
});
