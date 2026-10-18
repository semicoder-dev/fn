import React from "react";
import { Page, PageHeader, Panel, PanelContent } from "@semicoder/fn-sdk/ui";
export default function Acceptance() {
  return (
    <Page>
      <PageHeader title="聊天验收" description="仅供开发验收，不进入官方市场。" />
      <Panel>
        <PanelContent>
          在 iPhone 或 fn Chat
          选择本机服务端及“聊天验收”。发送普通文字获得回声；发送“批准”“选择”“表单”获得对应卡片。
        </PanelContent>
      </Panel>
    </Page>
  );
}
