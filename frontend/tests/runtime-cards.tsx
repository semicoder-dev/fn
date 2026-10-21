import React, { act } from "react";
import { createRoot } from "react-dom/client";
import type { SessionCard } from "@semicoder/fn-sdk/cards";
import RuntimeCard from "../RuntimeCards";
import { runtimeClient } from "../runtime-bridge";
import "../style.css";
import "../runtime.css";
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const root = createRoot(document.getElementById("fixture")!);
const results: string[] = [], calls: Record<string, unknown>[] = [];
const assert = (value: unknown, message: string) => { if (!value) throw new Error(message); };
const button = () => document.querySelector<HTMLButtonElement>("article button")!;
let resolve!: () => void, reject!: (error: Error) => void;
Object.assign(runtimeClient, { call: async (method: string, args: Record<string, unknown>) => {
  assert(method === "cards.respond", "Uses Session card API"); calls.push(args);
  await new Promise<void>((yes, no) => { resolve = yes; reject = no; });
} });
let record: SessionCard = { id: "card", sessionId: "session", createdAt: 1, expiresAt: Date.now() + 60000, state: "pending", card: {
  version: 1, template: "form", title: "应用卡片验收", summary: "文字、数字、选择与确认", blocks: [{type:"text",text:"请确认以下内容"},{type:"fields",fields:[{label:"来源",value:"应用"}]},{type:"divider"}],
  inputs: [{id:"text",label:"名称",type:"text",required:true,maxLength:10},{id:"number",label:"数量",type:"number",required:true,minimum:1,maximum:3},{id:"flag",label:"确认",type:"boolean",required:true},{id:"choice",label:"选项",type:"select",required:true,options:[{id:"a",label:"A"}]},{id:"multi",label:"更多",type:"multiSelect",required:false,options:[{id:"a",label:"A"}]}],
  actions: [{id:"save",label:"保存",style:"primary"}],
} };
const render = async (enabled = true) => { root.render(<div className="runtime-shell" style={{padding:32,display:"block",height:"auto",maxWidth:720}}><RuntimeCard record={record} enabled={enabled} refresh={render} /></div>); };
async function input(selector: string, value: string) {
  await act(async () => {
    const element = document.querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
    Object.getOwnPropertyDescriptor(element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype, "value")!.set!.call(element, value);
    element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? "change" : "input", {bubbles:true}));
  });
}
async function run() {
  await act(render); await act(async () => {button().click();});
  assert(calls.length===0 && document.querySelector('[role="alert"]'),"Invalid input is rejected before transport");
  await input('input[type="text"]',"笔记"); await input('input[type="number"]',"2"); await input("select","a");
  await act(async () => {document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[1]!.click();});
  await act(async () => {document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[2]!.click();});
  await act(async () => {button().click();});
  assert(calls.length===1 && button().matches(":disabled"),"Submission locks controls until host confirmation");
  assert(JSON.stringify(calls[0])===JSON.stringify({sessionId:"session",cardId:"card",actionId:"save",values:{text:"笔记",number:2,flag:false,choice:"a",multi:["a"]}}),"All input types preserve typed values and Session identity");
  await act(async () => {button().click();}); assert(calls.length===1,"Pending reply cannot be submitted twice");
  results.push("PASS validation, typed fields, optional inputs and pending reply lock");
  await act(async () => {reject(new Error("宿主离线"));});
  assert(document.body.textContent?.includes("宿主离线") && !button().matches(":disabled"),"Transport failure retains values and allows a retry");
  await act(async () => {button().click();});
  await act(async () => {record={...record,state:"completed",answer:{actionId:"save",values:{text:"其他设备",number:1,flag:true,choice:"a"}}};resolve();});
  assert(button().matches(":disabled") && document.querySelector<HTMLInputElement>('input[type="text"]')!.value==="其他设备","Canonical accepted answer wins after refresh");
  results.push("PASS failed transport retry and canonical answer recovery");
  record={...record,state:"pending",expiresAt:1}; await act(render);assert(button().matches(":disabled") && document.body.textContent?.includes("已过期"),"Expired cards cannot submit");
  record={...record,expiresAt:Date.now()+60000};await act(()=>render(false));assert(button().matches(":disabled"),"Disabled application cannot submit");
  results.push("PASS expired card and disabled application admission");
  // Leave a completed card visible for visual inspection.
  record={...record,state:"completed"};await act(render);
  document.getElementById("results")!.textContent=results.join("\n");document.documentElement.dataset.testStatus="passed";
}
void run().catch(error=>{document.getElementById("results")!.textContent=results.join("\n")+"\nFAIL "+error.stack;document.documentElement.dataset.testStatus="failed";});
