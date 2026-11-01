import React, { useEffect, useState } from "react";
import { jsonHost, openHostSocket } from "@semicoder/fn-sdk/client";
import { type ApplicationSummary } from "@semicoder/fn-sdk/summary";
import type { TextValue } from "@semicoder/fn-sdk/text";
import { ApplicationRow } from "./application-row.tsx";
import { Select, Notice, Icon, useTheme } from "@semicoder/fn-ui";
import styles from "./platform.module.css";
const words = {
  en: {
    title: "Application summary preview",
    theme: "Theme",
    language: "Language",
    state: "State",
    light: "Light",
    dark: "Dark",
    system: "System",
    running: "Running",
    closed: "Closed · cached snapshot",
    failed: "Failed · cached snapshot",
  },
  "zh-CN": {
    title: "应用摘要预览",
    theme: "主题",
    language: "语言",
    state: "运行状态",
    light: "浅色",
    dark: "深色",
    system: "跟随系统",
    running: "运行中",
    closed: "已关闭 · 缓存快照",
    failed: "已停止 · 缓存快照",
  },
};
export function SummaryPreview({ id }: { id: string }) {
  const [value, set] = useState<{
      snapshot: ApplicationSummary;
      name: TextValue;
      messages: Record<string, Record<string, string>>;
    }>(),
    [error, setError] = useState(""),
    [locale, language] = useState<"en" | "zh-CN">("zh-CN"),
    [theme, setTheme] = useState("system"),
    [state, status] = useState("running");
  useTheme(theme);
  const t = words[locale];
  useEffect(() => {
    let stopped = false,
      socket: WebSocket | undefined;
    const refresh = () =>
      jsonHost("/summary-preview/" + id)
        .then((v) => {
          if (!stopped) {
            set(v);
            setError("");
          }
        })
        .catch((e) => {
          if (!stopped) setError(String(e));
        });
    void refresh();
    void openHostSocket("/api/fn/v1/events").then((s) => {
      if (stopped) {
        s.close();
        return;
      }
      socket = s;
      s.onmessage = () => void refresh();
    });
    return () => {
      stopped = true;
      socket?.close();
    };
  }, [id]);
  const text = (v: TextValue) => {
    if (typeof v === "string") return v;
    let result =
      value?.messages[locale]?.[v.key] ?? value?.messages.en?.[v.key] ?? v.key;
    for (const [key, text] of Object.entries(v.args ?? {}))
      result = result.replaceAll("{" + key + "}", String(text));
    return result;
  };
  const choices = (keys: (keyof typeof t)[]) =>
    keys.map((value) => ({ value, label: t[value] }));
  return (
    <main style={{ padding: 16, maxWidth: 1100, margin: "auto" }}>
      <h1>{t.title}</h1>
      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}
      >
        <Select
          label={t.theme}
          value={theme}
          onValueChange={setTheme}
          options={choices(["light", "dark", "system"])}
        />
        <Select
          label={t.language}
          value={locale}
          onValueChange={(v) => language(v as typeof locale)}
          options={[
            { value: "zh-CN", label: "简体中文" },
            { value: "en", label: "English" },
          ]}
        />
        <Select
          label={t.state}
          value={state}
          onValueChange={status}
          options={choices(["running", "closed", "failed"])}
        />
      </div>
      {error && <Notice>{error}</Notice>}
      <ApplicationRow
        name={value ? text(value.name) : t.title}
        icon={
          <span className={styles.appIcon}>
            <Icon name="grid" />
          </span>
        }
        status={t[state as keyof typeof t]}
        summary={value?.snapshot}
        fallback=""
        text={text}
        running={state === "running"}
        openLabel=""
        trendLabel={locale === "en" ? "Trend" : "趋势"}
        progressLabel={locale === "en" ? "Progress" : "进度"}
      />
    </main>
  );
}
