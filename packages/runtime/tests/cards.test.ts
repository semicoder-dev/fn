import { afterEach, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Context } from "@deepseek-ai/cordis";
import { FnRuntime, type ApplicationRuntime } from "../src/index.ts";
import { cardSchema, validateResponse } from "../src/card-contract.ts";
import { RuntimeStore } from "../src/store.ts";
const finish: (() => Promise<unknown>)[] = [];
afterEach(async () => { for (const fn of finish.splice(0).reverse()) await fn(); });
const card = cardSchema.parse({ version: 1, template: "form", title: "Confirm", summary: "", blocks: [{ type: "text", text: "**Review**" }], inputs: [
  { id: "text", label: "Text", type: "text", required: true, maxLength: 5 },
  { id: "number", label: "Number", type: "number", required: true, minimum: 1, maximum: 3 },
  { id: "flag", label: "Flag", type: "boolean", required: true },
  { id: "choice", label: "Choice", type: "select", required: true, options: [{ id: "a", label: "A" }] },
  { id: "multi", label: "Multi", type: "multiSelect", required: false, options: [{ id: "a", label: "A" }] },
], actions: [{ id: "ok", label: "OK", style: "primary" }] });
const values = { text: "hello", number: 2, flag: false, choice: "a" };
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "fn-cards-")); finish.push(() => rm(root, { recursive: true, force: true }));
  const host = await FnRuntime.open({ dataDirectory: root }); finish.push(() => host.close());
  let api!: ApplicationRuntime;
  await host.load({ manifest: { id: "cards", name: "Cards", version: "1", packageName: "cards" }, plugin: { inject: ["app"], apply(ctx: Context) { api = ctx.app; } } });
  host.store.putSession({ id: "s", appId: "cards", connectionId: "c", modelId: "m", title: "Cards", createdAt: 1, updatedAt: 1, policy: "controlled", archived: false, status: "idle" });
  return { host, api, root };
}
test("card validation covers all inputs and rejects invalid structure and responses", () => {
  validateResponse(card, "ok", values);
  for (const input of [{...values,text:"too long"},{...values,number:4},{...values,flag:"false"},{...values,choice:"missing"},{...values,multi:["a","a"]},{...values,extra:1}]) expect(() => validateResponse(card,"ok",input)).toThrow();
  expect(() => validateResponse(card,"missing",values)).toThrow();
  expect(() => cardSchema.parse({...card,inputs:[...card.inputs,card.inputs[0]]})).toThrow();
});
test("card claims persist before handler execution; concurrent devices and restart cannot replay effects", async () => {
  const {host,api,root}=await fixture(); let calls=0, release!:()=>void;
  api.cards.action("save", async () => {calls++;await new Promise<void>(resolve=>{release=resolve;});});
  const input={key:"once",handler:"save",card}; const created=api.cards.create("s",input);
  expect(api.cards.create("s",input).id).toBe(created.id);
  expect(()=>api.cards.create("s",{...input,card:{...card,title:"changed"}})).toThrow();
  const first=host.respondCard("s",created.id,"ok",values);
  await Promise.resolve();expect(calls).toBe(1); expect(host.busy()).toBe(true);
  await expect(host.respondCard("s",created.id,"ok",values)).rejects.toThrow();
  expect(host.store.card(created.id)?.state).toBe("running");
  release();await first;expect(host.cards("s")[0]?.state).toBe("completed");expect(host.busy()).toBe(false);
  // Persist a claimed action as if the process died before recording its outcome.
  const interrupted=api.cards.create("s",{...input,key:"crash"});
  host.store.putCard({...host.store.card(interrupted.id)!,state:"running"},"pending");
  await host.close();const reopened=new RuntimeStore(join(root,"applications.sqlite"));
  expect(reopened.card(created.id)?.state).toBe("completed");expect(reopened.card(interrupted.id)?.state).toBe("interrupted");reopened.close();
});
test("ownership, expiry, cancellation, missing handlers and failed storage prevent side effects", async () => {
  const {host,api,root}=await fixture();let calls=0;
  const dispose=api.cards.action("save",()=>{calls++;});
  const create=(key:string)=>api.cards.create("s",{key,handler:"save",card});
  const expired=create("expiry");host.store.putCard({...host.store.card(expired.id)!,expiresAt:1});
  await expect(host.respondCard("s",expired.id,"ok",values)).rejects.toThrow();expect(host.cards("s")[0]?.state).toBe("expired");
  const cancelled=create("cancel");api.cards.cancel(cancelled.id);await expect(host.respondCard("s",cancelled.id,"ok",values)).rejects.toThrow();
  const value=create("valid");await expect(host.respondCard("foreign",value.id,"ok",values)).rejects.toThrow();
  expect(()=>host.cancelCard("other",value.id)).toThrow();
  const db=new Database(join(root,"applications.sqlite"));db.exec("CREATE TRIGGER fail_card BEFORE UPDATE ON cards BEGIN SELECT RAISE(ABORT,'card-write-failed'); END");
  await expect(host.respondCard("s",value.id,"ok",values)).rejects.toThrow("card-write-failed");db.exec("DROP TRIGGER fail_card");db.close();
  dispose();await expect(host.respondCard("s",value.id,"ok",values)).rejects.toThrow("unavailable");expect(calls).toBe(0);
});
test("subplugin card registrations disappear with their Cordis effect and disabled applications reject replies", async () => {
  const {host,api}=await fixture();let childDispose!:()=>Promise<void>,childApi!:ApplicationRuntime;
  await host.load({manifest:{id:"nested-cards",name:"Nested",version:"1",packageName:"nested"},plugin:{inject:["app"],async apply(ctx:Context){
    const child=await ctx.plugin({inject:["app"],apply(childCtx:Context){childApi=childCtx.app;childCtx.app.cards.action("child",()=>{});}});childDispose=child.dispose;
  }}});
  host.store.putSession({...host.session("s"),id:"nested-s",appId:"nested-cards"});
  const value=childApi.cards.create("nested-s",{key:"x",handler:"child",card});await childDispose();
  await expect(host.respondCard("nested-s",value.id,"ok",values)).rejects.toThrow("unavailable");
  api.cards.action("save",()=>{});const pending=api.cards.create("s",{key:"pending",handler:"save",card});await host.unload("cards");
  await expect(host.respondCard("s",pending.id,"ok",values)).rejects.toThrow();
});

test("failed card handlers are terminal and retain the accepted response without automatic retries", async () => {
  const {host,api}=await fixture();let effects=0;
  api.cards.action("fail",()=>{effects++;throw new Error("fixture failure");});
  const value=api.cards.create("s",{key:"failed",handler:"fail",card});
  await expect(host.respondCard("s",value.id,"ok",values)).rejects.toThrow("fixture failure");
  expect(host.cards("s")[0]).toMatchObject({state:"failed",answer:{actionId:"ok",values}});
  await expect(host.respondCard("s",value.id,"ok",values)).rejects.toThrow();
  expect(effects).toBe(1);expect(host.busy()).toBe(false);
});
