import { test, expect } from "bun:test";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  Models,
  verifyIdentity,
  validateResponseRequest,
} from "../src/models.ts";
import { readResponses, encodeSSE } from "@semicoder/fn-sdk/sse";
const issuer = "https://auth.openai.com";
const keys = await crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  },
  true,
  ["sign", "verify"],
);
const jwk = {
  ...(await crypto.subtle.exportKey("jwk", keys.publicKey)),
  kid: "test",
};
async function jwt(claims: Record<string, unknown> = {}) {
  const value = [
    { alg: "RS256", kid: "test" },
    {
      iss: issuer,
      aud: "oaiapp_test",
      sub: "test-user",
      email: "test@example.invalid",
      exp: Date.now() / 1000 + 3600,
      ...claims,
    },
  ]
    .map((v) => Buffer.from(JSON.stringify(v)).toString("base64url"))
    .join(".");
  return (
    value +
    "." +
    Buffer.from(
      await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        keys.privateKey,
        new TextEncoder().encode(value),
      ),
    ).toString("base64url")
  );
}
const identityFetch = (async (url: any) =>
  Response.json(
    String(url).includes("openid-configuration")
      ? {
          issuer,
          jwks_uri: issuer + "/jwks",
          revocation_endpoint: issuer + "/revoke",
        }
      : { keys: [jwk] },
  )) as typeof fetch;
const request = {
  model: "test",
  input: [{ role: "user", content: "hello" }],
  store: false,
  stream: true,
};
test("identity signature, audience, nonce and expiry are verified", async () => {
  expect(
    (
      await verifyIdentity(
        await jwt({ nonce: "valid" }),
        "oaiapp_test",
        "valid",
        identityFetch,
      )
    ).subject,
  ).toBe("test-user");
  for (const claims of [
    { nonce: "wrong" },
    { aud: "wrong", nonce: "valid" },
    { exp: 1, nonce: "valid" },
    { azp: "wrong", nonce: "valid" },
  ])
    await expect(
      verifyIdentity(await jwt(claims), "oaiapp_test", "valid", identityFetch),
    ).rejects.toThrow("verification");
  const token = await jwt({ nonce: "valid" });
  const pieces = token.split(".");
  pieces[1] = Buffer.from(JSON.stringify({ sub: "changed" })).toString(
    "base64url",
  );
  await expect(
    verifyIdentity(pieces.join("."), "oaiapp_test", "valid", identityFetch),
  ).rejects.toThrow();
});
test("OAuth binds state/PKCE/issued client, serializes refresh and clears tokens while retaining registration", async () => {
  const root = await mkdtemp(join(tmpdir(), "fn-oauth-"));
  let nonce = "",
    exchanges = 0,
    refreshes = 0,
    revocations = 0;
  const fetcher = (async (url: any, init: any) => {
    if (String(url).endsWith("/oauth/token")) {
      exchanges++;
      const form = new URLSearchParams(init.body);
      expect(form.get("client_id")).toBe("oaiapp_test");
      if (form.get("grant_type") === "refresh_token") {
        refreshes++;
        await Bun.sleep(15);
      } else {
        expect(form.get("code_verifier")!.length).toBeGreaterThanOrEqual(43);
        expect(form.get("redirect_uri")).toBe("http://127.0.0.1:9999/callback");
      }
      return Response.json({
        access_token: "test-access",
        refresh_token: "test-refresh-" + exchanges,
        id_token: await jwt({ nonce }),
        expires_in: form.get("grant_type") === "refresh_token" ? 3600 : 1,
        scope: "chatgpt.tokens.use.direct",
        token_type: "Bearer",
      });
    }
    if (String(url).endsWith("/revoke")) {
      revocations++;
      expect(new URLSearchParams(init.body).get("token_type_hint")).toBe(
        "refresh_token",
      );
      return new Response(null, { status: 200 });
    }
    return identityFetch(url, init);
  }) as typeof fetch;
  try {
    const models = new Models(root, fetcher);
    await models.open();
    const auth = new URL(models.signIn("http://127.0.0.1:9999/callback"));
    nonce = auth.searchParams.get("nonce")!;
    expect(auth.searchParams.get("client_id")).toBe("dynamic_agent_client");
    expect(auth.searchParams.get("code_challenge_method")).toBe("S256");
    await expect(
      models.callback(
        new URL(
          "http://127.0.0.1:9999/callback?state=wrong&code=test&client_id=oaiapp_test",
        ),
      ),
    ).rejects.toThrow("state");
    expect(exchanges).toBe(0);
    const callback = new URL("http://127.0.0.1:9999/callback");
    callback.search = new URLSearchParams({
      state: auth.searchParams.get("state")!,
      code: "test-code",
      client_id: "oaiapp_test",
    }).toString();
    const id = await models.callback(callback);
    await Promise.all([
      models.account(id),
      models.account(id),
      models.account(id),
    ]);
    expect(refreshes).toBe(1);
    expect((await stat(join(root, "chatgpt-auth.json"))).mode & 0o777).toBe(
      0o600,
    );
    expect(await models.logout(id)).toEqual({ revoked: true });
    expect(revocations).toBe(1);
    const saved = await Bun.file(join(root, "chatgpt-auth.json")).json();
    expect(saved.accounts[0].clientId).toBe("oaiapp_test");
    expect(saved.accounts[0].refreshToken).toBe("");
    expect(models.list()[0]?.enabled).toBe(false);
    expect(
      new URL(
        models.signIn("http://127.0.0.1:9999/callback", id),
      ).searchParams.get("client_id"),
    ).toBe("oaiapp_test");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("model slots remain bounded, cancellation releases waiters, and upstream quota errors are preserved", async () => {
  const root = await mkdtemp(join(tmpdir(), "fn-models-"));
  let count = 0;
  try {
    await Bun.write(
      join(root, "chatgpt-auth.json"),
      JSON.stringify({
        hostId: "test",
        accounts: [
          {
            id: "account",
            email: "test",
            accessToken: "test",
            refreshToken: "test",
            expiresAt: Date.now() + 3600000,
            scopes: ["chatgpt.tokens.use.direct"],
          },
        ],
      }),
    );
    const models = new Models(root, (async (_url: any, init: any) => {
      expect(new Headers(init.headers).get("authorization")).toBe(
        "Bearer test",
      );
      count++;
      return new Response(
        new ReadableStream<Uint8Array>({
          start(c) {
            c.enqueue(encodeSSE({ type: "response.created" }));
          },
        }),
      );
    }) as typeof fetch);
    await models.open();
    const abort = new AbortController();
    const opened = await Promise.all(
      Array.from({ length: 4 }, () =>
        models.responses("account", request, new AbortController().signal),
      ),
    );
    const queued = models.responses("account", request, abort.signal);
    const rejected = queued.then(
      () => null,
      (error) => error,
    );
    abort.abort();
    expect(await rejected).toBeInstanceOf(Error);
    expect(count).toBe(4);
    const fifth = models.responses(
      "account",
      request,
      new AbortController().signal,
    );
    await Bun.sleep(10);
    expect(count).toBe(4);
    await opened[0]!.body!.cancel();
    opened.push(await fifth);
    expect(count).toBe(5);
    await Promise.all(opened.slice(1).map((r) => r.body!.cancel()));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  for (const key of ["temperature", "previous_response_id", "background"])
    expect(() => validateResponseRequest({ ...request, [key]: 0 })).toThrow(
      "not supported",
    );
  expect(() =>
    validateResponseRequest({ ...request, tools: [{ type: "mcp" }] }),
  ).toThrow("Unsupported");
});
test("completed, incomplete, quota and truncated model streams are distinct", async () => {
  const read = async (events: unknown[]) => {
    const values = [];
    for await (const event of readResponses(
      new Response(Buffer.concat(events.map((e) => Buffer.from(encodeSSE(e))))),
    ))
      values.push(event);
    return values;
  };
  expect(
    (
      await read([
        { type: "response.output_text.delta", delta: "hello" },
        { type: "response.completed" },
      ])
    ).length,
  ).toBe(2);
  await expect(
    read([{ type: "response.output_text.delta", delta: "partial" }]),
  ).rejects.toMatchObject({ code: "interrupted" });
  await expect(read([{ type: "response.incomplete" }])).rejects.toMatchObject({
    code: "response.incomplete",
  });
  await expect(
    read([
      {
        type: "response.failed",
        response: {
          error: {
            code: "subscription_sharing_usage_limit_exceeded",
            message: "limit",
          },
        },
      },
    ]),
  ).rejects.toMatchObject({
    code: "subscription_sharing_usage_limit_exceeded",
  });
});
