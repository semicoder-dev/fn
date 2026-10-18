import { definePlugin, defineMethod, z } from "@semicoder/fn-sdk/runtime";
import type { ChatCard } from "@semicoder/fn-sdk/chat";
const card = (template: ChatCard["template"], title: string): ChatCard => ({
  version: 1,
  template,
  title,
  summary: "仅验证聊天交互，不执行外部操作。",
  blocks: [
    { type: "text", text: "在任一聊天设备提交，其他设备会同步结果。" },
    { type: "divider" },
    { type: "fields", fields: [{ label: "用途", value: "开发验收" }] },
  ],
  inputs: [],
  actions: [
    { id: "approve", label: "批准", style: "primary" },
    { id: "reject", label: "拒绝", style: "danger" },
  ],
});
export default definePlugin({
  methods: {
    notify: defineMethod(
      "主动发送验收消息",
      z.strictObject({ text: z.string().min(1).max(16000) }),
      async ({ text }, ctx) => {
        if (!ctx.chat) throw new Error("聊天不可用");
        return ctx.chat.sendText(text);
      },
    ),
    cancel: defineMethod(
      "取消验收请求",
      z.strictObject({ id: z.string() }),
      async ({ id }, ctx) => {
        await ctx.chat?.cancel(id);
        return null;
      },
    ),
  },
  chat: {
    version: 1,
    async onMessage(message, ctx) {
      const chat = ctx.chat!;
      await ctx.progress("已收到文字，正在处理");
      const text = message.text.trim();
      if (text === "批准" || text === "选择" || text === "表单") {
        const c = card(
          text === "批准" ? "approval" : text === "选择" ? "choice" : "form",
          text + "验收",
        );
        if (text !== "批准") {
          c.actions = [{ id: "submit", label: "提交", style: "primary" }];
          c.inputs = [
            {
              id: "choice",
              label: "单选",
              type: "select",
              required: true,
              options: [
                { id: "a", label: "选项 A" },
                { id: "b", label: "选项 B" },
              ],
            },
            {
              id: "choices",
              label: "多选",
              type: "multiSelect",
              required: true,
              options: [
                { id: "a", label: "选项 A" },
                { id: "b", label: "选项 B" },
              ],
            },
          ];
          if (text === "表单")
            c.inputs.push(
              { id: "text", label: "文字", type: "text", required: true, maxLength: 100 },
              {
                id: "count",
                label: "数字",
                type: "number",
                required: true,
                minimum: 1,
                maximum: 5,
              },
              { id: "enabled", label: "开关", type: "boolean", required: true },
              { id: "note", label: "备注", type: "text", required: false },
            );
        }
        const id = await chat.request({ card: c });
        await ctx.kv.set("request:" + id, { eventId: message.id });
      } else {
        await chat.sendText("回声：" + message.text);
      }
    },
    async onResponse(response, ctx) {
      const checkpoint = ctx.kv.get("request:" + response.requestId);
      if (!checkpoint) throw new Error("验收请求检查点不存在");
      await ctx.progress("已读取持久检查点");
      await ctx.chat!.sendText(
        "已收到卡片回复：" + response.actionId + "\n" + JSON.stringify(response.values),
      );
      await ctx.kv.set("result:" + response.requestId, {
        eventId: response.id,
        actionId: response.actionId,
        values: response.values,
      });
    },
  },
});
