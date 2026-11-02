import { chmod } from "node:fs/promises";
import { resolve } from "node:path";
import { atomicJSON } from "./store.ts";
import { chatGPTStream } from "./chatgpt-stream.ts";
import { FnError, type Model, type Connection } from "@semicoder/fn-sdk/types";
interface Credential {
  id: string;
  email: string;
  subject: string;
  clientId: string;
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
  scopes: string[];
}
interface Credentials {
  hostId: string;
  accounts: Credential[];
}
interface Attempt {
  state: string;
  nonce: string;
  verifier: string;
  callback: string;
  clientId?: string;
  accountId?: string;
  expiresAt: number;
}
const issuer = "https://auth.openai.com";
const resource = "https://api.openai.com/v1";
const secret = () =>
  Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
import { validateResponseRequest } from "@semicoder/fn-sdk/responses";
export { validateResponseRequest };
export async function verifyIdentity(
  token: string,
  clientId: string,
  nonce?: string,
  fetcher: typeof fetch = fetch,
) {
  const parts = token.split(".");
  if (parts.length !== 3)
    throw new FnError("invalid_identity", "Invalid identity token");
  const header = JSON.parse(Buffer.from(parts[0]!, "base64url").toString());
  const claims = JSON.parse(Buffer.from(parts[1]!, "base64url").toString());
  if (header.alg !== "RS256" || typeof header.kid !== "string")
    throw new FnError("invalid_identity", "Unsupported identity signature");
  const discovery = await (
    await fetcher(issuer + "/.well-known/openid-configuration")
  ).json();
  const jwksURL = new URL(discovery.jwks_uri);
  if (discovery.issuer !== issuer || jwksURL.origin !== issuer)
    throw new FnError("invalid_identity", "Unexpected identity authority");
  const keys = await (await fetcher(jwksURL)).json();
  const jwk = keys.keys.find(
    (k: JsonWebKey & { kid?: string }) =>
      k.kid === header.kid && k.kty === "RSA" && (!k.alg || k.alg === "RS256"),
  );
  if (!jwk)
    throw new FnError("invalid_identity", "Identity signing key not found");
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    Buffer.from(parts[2]!, "base64url"),
    new TextEncoder().encode(parts[0] + "." + parts[1]),
  );
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  const now = Date.now() / 1000;
  if (
    !valid ||
    claims.iss !== issuer ||
    !audience.includes(clientId) ||
    ((audience.length > 1 || claims.azp !== undefined) &&
      claims.azp !== clientId) ||
    typeof claims.exp !== "number" ||
    claims.exp <= now ||
    claims.nbf > now + 60 ||
    typeof claims.sub !== "string" ||
    (nonce !== undefined && claims.nonce !== nonce)
  )
    throw new FnError("invalid_identity", "Identity verification failed");
  return {
    subject: claims.sub as string,
    email:
      typeof claims.email === "string" ? claims.email : (claims.sub as string),
  };
}
export class Models {
  private values: Credentials = {
    hostId: "urn:uuid:" + crypto.randomUUID(),
    accounts: [],
  };
  private attempt?: Attempt;
  private refreshing = new Map<string, Promise<Credential>>();
  private writes = Promise.resolve();
  private active = 0;
  private sessions = new Map<string, AbortController>();
  private signingOut = new Set<string>();
  private waiting: {
    resolve: () => void;
    reject: (error: unknown) => void;
    signal: AbortSignal;
  }[] = [];
  constructor(
    readonly directory: string,
    readonly fetcher: typeof fetch = fetch,
  ) {}
  async open() {
    const file = Bun.file(resolve(this.directory, "chatgpt-auth.json"));
    if (await file.exists()) {
      await chmod(file.name!, 0o600);
      this.values = await file.json();
    } else await this.save();
  }
  private save() {
    const value = structuredClone(this.values);
    this.writes = this.writes
      .catch(() => {})
      .then(() =>
        atomicJSON(resolve(this.directory, "chatgpt-auth.json"), value),
      );
    return this.writes;
  }

  list(): Connection[] {
    return this.values.accounts.map((a) => ({
      id: a.id,
      email: a.email,
      enabled:
        !!a.accessToken && a.scopes.includes("chatgpt.tokens.use.direct"),
    }));
  }
  signIn(callback: string, accountId?: string) {
    const account = accountId
      ? this.values.accounts.find((a) => a.id === accountId)
      : undefined;
    if (accountId && !account)
      throw new FnError("not_found", "Account not found");
    const attempt: Attempt = {
      state: secret(),
      nonce: secret(),
      verifier: secret(),
      callback,
      clientId: account?.clientId,
      accountId,
      expiresAt: Date.now() + 10 * 60_000,
    };
    this.attempt = attempt;
    const url = new URL(issuer + "/api/accounts/authorize");
    url.search = new URLSearchParams({
      client_id: account?.clientId ?? "dynamic_agent_client",
      ...(account
        ? account.idToken
          ? { id_token_hint: account.idToken }
          : {}
        : { agent_name_hint: "Fn" }),
      ext_agent_host_id: this.values.hostId,
      response_type: "code",
      redirect_uri: callback,
      scope:
        "openid profile email offline_access resource.invoke chatgpt.tokens.use.direct",
      resource,
      state: attempt.state,
      nonce: attempt.nonce,
      code_challenge_method: "S256",
      code_challenge: new Bun.CryptoHasher("sha256")
        .update(attempt.verifier)
        .digest("base64url"),
    }).toString();
    return url.href;
  }
  async callback(url: URL) {
    const attempt = this.attempt;
    if (
      !attempt ||
      attempt.expiresAt < Date.now() ||
      url.searchParams.get("state") !== attempt.state
    )
      throw new FnError(
        "invalid_authorization",
        "Authorization expired or state mismatch",
      );
    this.attempt = undefined;
    if (url.searchParams.has("error"))
      throw new FnError("authorization_declined", "Authorization declined");
    const clientId = url.searchParams.get("client_id") ?? attempt.clientId;
    const code = url.searchParams.get("code");
    if (
      !clientId ||
      clientId === "dynamic_agent_client" ||
      !code ||
      (attempt.clientId && clientId !== attempt.clientId)
    )
      throw new FnError(
        "invalid_authorization",
        "Invalid registration response",
      );
    const token = await this.exchange({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      code_verifier: attempt.verifier,
      redirect_uri: attempt.callback,
      resource,
    });
    const identity = await verifyIdentity(
      token.id_token,
      clientId,
      attempt.nonce,
      this.fetcher,
    );
    const existing = attempt.accountId
      ? this.values.accounts.find((a) => a.id === attempt.accountId)
      : this.values.accounts.find(
          (a) => a.clientId === clientId && a.subject === identity.subject,
        );
    if (existing && existing.subject !== identity.subject)
      throw new FnError("invalid_identity", "Selected account does not match");
    const account: Credential = {
      id: existing?.id ?? crypto.randomUUID(),
      ...identity,
      clientId,
      accessToken: token.access_token ?? "",
      refreshToken: token.refresh_token ?? "",
      idToken: token.id_token,
      expiresAt: Date.now() + token.expires_in * 1000,
      scopes: String(token.scope ?? "").split(" "),
    };
    this.values.accounts = this.values.accounts.filter(
      (a) => a.id !== account.id,
    );
    this.values.accounts.push(account);
    await this.save();
    return account.id;
  }
  private async exchange(body: Record<string, string>) {
    const response = await this.fetcher(issuer + "/api/accounts/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok)
      throw new FnError(
        "authorization_failed",
        "Authorization failed; sign in again",
      );
    const token = await response.json();
    if (
      typeof token.access_token !== "string" ||
      !token.access_token ||
      typeof token.expires_in !== "number" ||
      !Number.isFinite(token.expires_in) ||
      token.expires_in <= 0 ||
      (token.token_type && token.token_type.toLowerCase() !== "bearer")
    )
      throw new FnError("invalid_authorization", "Invalid token response");
    return token;
  }
  async account(id: string) {
    const account = this.values.accounts.find((a) => a.id === id);
    if (!account || !account.accessToken || this.signingOut.has(id))
      throw new FnError("not_connected", "Select a connected ChatGPT account");
    if (!account.scopes.includes("chatgpt.tokens.use.direct"))
      throw new FnError(
        "consent_required",
        "ChatGPT plan usage is not enabled",
      );
    if (account.expiresAt > Date.now() + 60_000) return account;
    let refreshing = this.refreshing.get(id);
    if (!refreshing) {
      refreshing = (async () => {
        const token = await this.exchange({
          grant_type: "refresh_token",
          client_id: account.clientId,
          refresh_token: account.refreshToken,
          resource,
        });
        if (token.id_token) {
          const identity = await verifyIdentity(
            token.id_token,
            account.clientId,
            undefined,
            this.fetcher,
          );
          if (identity.subject !== account.subject)
            throw new FnError("invalid_identity", "Account identity changed");
        }
        const updated = {
          ...account,
          accessToken: token.access_token,
          refreshToken: token.refresh_token ?? account.refreshToken,
          idToken: token.id_token ?? account.idToken,
          expiresAt: Date.now() + token.expires_in * 1000,
          scopes: token.scope ? String(token.scope).split(" ") : account.scopes,
        };
        if (
          this.signingOut.has(id) ||
          !this.values.accounts.some((a) => a.id === id && a.accessToken)
        )
          throw new FnError("not_connected", "Account signed out");
        this.values.accounts = this.values.accounts.map((a) =>
          a.id === id ? updated : a,
        );
        await this.save();
        return updated;
      })().finally(() => this.refreshing.delete(id));
      this.refreshing.set(id, refreshing);
    }
    return refreshing;
  }
  async logout(id: string) {
    this.signingOut.add(id);
    this.sessions.get(id)?.abort();
    this.sessions.delete(id);
    await this.refreshing.get(id)?.catch(() => {});
    const account = this.values.accounts.find((a) => a.id === id);
    let revoked = !account?.refreshToken;
    try {
      if (account?.refreshToken) {
        const discovery = await this.fetcher(
          issuer + "/.well-known/openid-configuration",
          { signal: AbortSignal.timeout(10000) },
        );
        const metadata = await discovery.json();
        const endpoint = new URL(metadata.revocation_endpoint);
        if (!discovery.ok || endpoint.origin !== issuer)
          throw new Error("Invalid revocation endpoint");
        for (let attempt = 0; attempt < 3 && !revoked; attempt++) {
          try {
            const response = await this.fetcher(endpoint, {
              method: "POST",
              headers: { "content-type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                token: account.refreshToken,
                token_type_hint: "refresh_token",
                client_id: account.clientId,
              }),
              signal: AbortSignal.timeout(10000),
            });
            revoked = response.status === 200;
            if (!revoked && response.status < 500) break;
          } catch {}
          if (!revoked && attempt < 2) await Bun.sleep(250 * 2 ** attempt);
        }
      }
    } catch {
    } finally {
      if (account)
        Object.assign(account, {
          accessToken: "",
          refreshToken: "",
          idToken: "",
          expiresAt: 0,
          scopes: [],
        });
      try {
        await this.save();
      } finally {
        this.signingOut.delete(id);
      }
    }
    return { revoked };
  }
  async catalog(): Promise<Model[]> {
    const entries = await Promise.all(
      this.list()
        .filter((a) => a.enabled)
        .map(async (connection) => {
          const account = await this.account(connection.id);
          const response = await this.fetcher(resource + "/models", {
            headers: { authorization: "Bearer " + account.accessToken },
            signal: AbortSignal.timeout(20_000),
          });
          if (!response.ok)
            throw new FnError(
              "models_unavailable",
              "Could not load account models",
            );
          const body = await response.json();
          return (body.models ?? [])
            .filter((m: any) => m.visibility === "list")
            .map((m: any) => ({
              connectionId: connection.id,
              id: m.slug,
              name: m.display_name ?? m.slug,
            }));
        }),
    );
    return entries.flat();
  }
  async responses(connectionId: string, body: unknown, signal: AbortSignal) {
    const request = validateResponseRequest(body);
    let session = this.sessions.get(connectionId);
    if (!session) {
      session = new AbortController();
      this.sessions.set(connectionId, session);
    }
    signal = AbortSignal.any([signal, session.signal]);
    signal.throwIfAborted();
    if (this.active >= 4) {
      if (this.waiting.length >= 32)
        throw new FnError("busy", "Model queue is full");
      await new Promise<void>((resolve, reject) => {
        const item = {
          resolve: () => {
            signal.removeEventListener("abort", abort);
            resolve();
          },
          reject,
          signal,
        };
        const abort = () => {
          this.waiting = this.waiting.filter((v) => v !== item);
          reject(signal.reason);
        };
        this.waiting.push(item);
        signal.addEventListener("abort", abort, { once: true });
      });
    } else this.active++;
    const release = () => {
      const next = this.waiting.shift();
      if (next) next.resolve();
      else this.active--;
    };
    try {
      signal.throwIfAborted();
      const account = await this.account(connectionId);
      const response = await this.fetcher(resource + "/responses", {
        method: "POST",
        headers: {
          authorization: "Bearer " + account.accessToken,
          "content-type": "application/json",
        },
        body: JSON.stringify(request),
        signal,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new FnError(
          error.error?.code ?? "model_unavailable",
          error.error?.message ??
            "Model request failed (" + response.status + ")",
        );
      }
      if (!response.body)
        throw new FnError("interrupted", "Missing model stream");
      const reader = chatGPTStream(response, signal).getReader();
      let ended = false;
      const finish = () => {
        if (!ended) {
          ended = true;
          signal.removeEventListener("abort", cancel);
          release();
        }
      };
      const cancel = () => {
        void reader
          .cancel(signal.reason)
          .catch(() => {})
          .finally(finish);
      };
      signal.addEventListener("abort", cancel, { once: true });
      if (signal.aborted) cancel();
      return new Response(
        new ReadableStream({
          async pull(controller) {
            try {
              const next = await reader.read();
              if (next.done) {
                finish();
                controller.close();
              } else controller.enqueue(next.value);
            } catch (error) {
              finish();
              controller.error(error);
            }
          },
          async cancel() {
            try {
              await reader.cancel();
            } finally {
              finish();
            }
          },
        }),
        {
          headers: {
            "content-type": "text/event-stream",
            "cache-control": "no-store",
          },
        },
      );
    } catch (error) {
      release();
      throw error;
    }
  }
}
