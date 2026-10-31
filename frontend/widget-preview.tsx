import React, { useEffect, useState } from "react";
import { jsonHost, openHostSocket } from "@semicoder/fn-sdk/client";
import {
  widgetDimensions,
  type WidgetSnapshot,
  type TextValue,
} from "@semicoder/fn-sdk/widgets";
import type { WidgetDefinition } from "@semicoder/fn-sdk/manifest";
import { Widget } from "@semicoder/fn-ui/widgets";
import { Select, Notice, Icon, useTheme } from "@semicoder/fn-ui";
import styles from "./platform.module.css";
const words = {
  en: {
    title: "Widget preview",
    size: "Size",
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
    title: "小组件预览",
    size: "尺寸",
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
export function WidgetPreview({ id }: { id: string }) {
  const [value, set] = useState<{
      snapshot: WidgetSnapshot;
      definition?: WidgetDefinition;
      messages: Record<string, Record<string, string>>;
    }>(),
    [error, setError] = useState(""),
    [locale, language] = useState<"en" | "zh-CN">("zh-CN"),
    [theme, setTheme] = useState("system"),
    [state, status] = useState("running");
  useTheme(theme);
  const t = words[locale];
  const size = value?.definition?.size ?? "1x1";
  const { columns, rows } = widgetDimensions(size);
  useEffect(() => {
    let stopped = false,
      socket: WebSocket | undefined;
    const refresh = () =>
      jsonHost("/widget-preview/" + id)
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
    <main style={{ padding: 32, maxWidth: 1100, margin: "auto" }}>
      <h1>{t.title}</h1>
      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}
      >
        <span>
          {t.size}: {size.replace("x", " × ")}
        </span>
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
      <div className={styles.grid}>
        <section
          className={styles.card}
          data-size={size}
          data-columns={columns}
          style={
            {
              "--widget-columns": columns,
              "--widget-rows": rows,
            } as React.CSSProperties
          }
        >
          <div className={styles.cardHeading}>
            <span className={styles.appIcon}>
              <Icon name="grid" size={21} />
            </span>
            <span>{value?.definition?.id ?? t.title}</span>
          </div>
          <div className={styles.widgetButton}>
            {value && <Widget snapshot={value.snapshot} text={text} />}
          </div>
          <footer className={styles.cardFooter}>
            <span>{t[state as keyof typeof t]}</span>
          </footer>
        </section>
      </div>
    </main>
  );
}
