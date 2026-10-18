import { parseRecord, conversationId } from "../packages/sdk/src/chat";
const route = {
  hostId: "host-a",
  pluginId: "fixture",
  conversationId: conversationId("host-a", "fixture"),
};
const base = { protocolVersion: 2, ...route, deviceId: "host-a", createdAt: 1792100000000 };
export const card = {
  version: 1,
  template: "form",
  title: "请求",
  summary: "测试",
  blocks: [
    { type: "text", text: "你好" },
    { type: "divider" },
    { type: "fields", fields: [{ label: "字段", value: "值" }] },
  ],
  inputs: [
    { id: "text", label: "文字", type: "text", required: true, maxLength: 10 },
    { id: "count", label: "数字", type: "number", required: true, minimum: 1, maximum: 5 },
    { id: "enabled", label: "开关", type: "boolean", required: true },
    {
      id: "choice",
      label: "单选",
      type: "select",
      required: true,
      options: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
    },
    {
      id: "choices",
      label: "多选",
      type: "multiSelect",
      required: true,
      options: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
    },
  ],
  actions: [{ id: "submit", label: "提交", style: "primary" }],
};
export const values = { text: "你好", count: 2, enabled: false, choice: "a", choices: ["a", "b"] };
const records = [
  {
    type: "FnChatHost",
    value: {
      protocolVersion: 2,
      id: "host-a",
      role: "host",
      name: "开发 Mac",
      updatedAt: 1792100000000,
    },
  },
  {
    type: "FnChatClient",
    value: {
      protocolVersion: 2,
      id: "phone-a",
      role: "client",
      platform: "iOS",
      name: "手机",
      updatedAt: 1792100000000,
    },
  },
  {
    type: "FnChatBot",
    value: {
      protocolVersion: 2,
      ...route,
      name: "验收",
      icon: "聊",
      version: "0.0.0:1",
      enabled: true,
      updatedAt: 1792100000000,
    },
  },
  {
    type: "FnChatUserMessage",
    value: {
      ...base,
      id: "user-a",
      deviceId: "phone-a",
      kind: "userText",
      text: "你好",
      botVersion: "0.0.0:1",
    },
  },
  { type: "FnChatBotMessage", value: { ...base, id: "bot-a", kind: "botText", text: "收到" } },
  {
    type: "FnChatBotMessage",
    value: {
      ...base,
      id: "request-a",
      kind: "request",
      card,
      expiresAt: 1792186400000,
      botVersion: "0.0.0:1",
    },
  },
  {
    type: "FnChatResponse",
    value: {
      ...base,
      id: "response-a",
      deviceId: "phone-a",
      kind: "response",
      requestId: "request-a",
      actionId: "submit",
      values,
      botVersion: "0.0.0:1",
    },
  },
  {
    type: "FnChatRequestState",
    value: {
      protocolVersion: 2,
      requestId: "request-a",
      phase: "pending",
      revision: 0,
      updatedAt: 1792100000000,
    },
  },
  {
    type: "FnChatDelivery",
    value: {
      protocolVersion: 2,
      ...route,
      eventId: "user-a",
      attemptId: "attempt-a",
      status: "running",
      updatedAt: 1792100000000,
      progress: "处理中",
    },
  },
];
for (const r of records) parseRecord(r.type, JSON.stringify(r.value));
const invalid = [
  { type: "FnChatUserMessage", value: { ...records[3]!.value, protocolVersion: 1 } },
  { type: "FnChatUserMessage", value: { ...records[3]!.value, hostId: "host-b" } },
  { type: "FnChatBotMessage", value: records[3]!.value },
  { type: "FnChatUserMessage", value: { ...records[3]!.value, text: "  " } },
  { type: "FnChatBotMessage", value: { ...records[5]!.value, expiresAt: 1 } },
  { type: "FnChatClient", value: { ...records[1]!.value, role: "host" } },
  { type: "FnChatBot", value: { ...records[2]!.value, extra: true } },
];
await Bun.write(
  new URL("fixtures/v2.json", import.meta.url),
  JSON.stringify({ records, invalid, values }, null, 2) + "\n",
);
