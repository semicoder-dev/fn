import { classes } from "@semicoder/fn-ui";
import styles from "./style.module.css";
const cx = (...values: (string | false | undefined)[]) => classes(styles, ...values);
import React, { useEffect, useId, useState } from "react";
import {
  SettingsSection,
  SettingsRow,
  Notice,
  Button,
  PageHeader,
  Input,
  Select,
  SegmentedControl,
} from "@semicoder/fn-ui";
import {
  colorThemeSchema,
  contrast,
  defaultColorTheme,
  paletteFor,
  type ColorTheme,
  type Palette,
  type ThemeMode,
} from "@semicoder/fn-appearance/theme";
import { useSyncExternalStore } from "react";
import type Theme from "./client.tsx";
const choices: {
  value: ThemeMode;
  title: string;
  description: string;
}[] = [
  { value: "light", title: "浅色", description: "清晰、明亮的工作空间" },
  { value: "dark", title: "深色", description: "适合低光环境" },
  { value: "system", title: "跟随系统", description: "与系统外观保持一致" },
];
const colors: {
  key: keyof Palette;
  label: string;
  description: string;
}[] = [
  { key: "accent", label: "强调色", description: "主要按钮与操作" },
  { key: "background", label: "背景", description: "页面、输入区域与浮层的基色" },
  { key: "foreground", label: "前景", description: "文字与图标的基色" },
];
export default function AppearanceSettings({
  visible = true,
  service,
}: {
  visible?: boolean;
  service: Theme;
}) {
  const { theme, colorTheme, resolved, choose, saveColors, previewColors, ready, pending, error } =
    useSyncExternalStore(service.subscribe, service.snapshot);
  const [draft, setDraft] = useState(colorTheme);
  const [saved, setSaved] = useState(false);
  const id = useId();
  const savedColors = JSON.stringify(colorTheme);
  const changed = JSON.stringify(draft) !== savedColors;
  const parsed = colorThemeSchema.safeParse(draft);
  const palette = paletteFor(draft, resolved);
  const validation = !parsed.success ? parsed.error.issues[0]!.message : "";
  const ratio =
    /^#[0-9a-f]{6}$/i.test(palette.background) && /^#[0-9a-f]{6}$/i.test(palette.foreground)
      ? contrast(palette.background, palette.foreground).toFixed(1)
      : "—";
  useEffect(() => {
    setDraft(JSON.parse(savedColors) as ColorTheme);
  }, [savedColors, visible]);
  useEffect(() => {
    if (visible && changed && colorThemeSchema.safeParse(draft).success) previewColors(draft);
    else previewColors(null);
    return () => previewColors(null);
  }, [visible, changed, draft, previewColors]);
  const edit = (key: keyof Palette, value: string) => {
    setSaved(false);
    setDraft((current) => ({
      preset: "custom",
      custom: {
        light: { ...paletteFor(current, "light") },
        dark: { ...paletteFor(current, "dark") },
        [resolved]: { ...paletteFor(current, resolved), [key]: value.toUpperCase() },
      },
    }));
  };
  return (
    <div className={cx("settings-page")}>
      <PageHeader title="外观" description="为所有插件选择统一的界面主题。" />
      <SettingsSection title="模式">
        <SettingsRow label="明暗模式" description="应用内容与原生标题栏共同切换，更改自动保存。">
          <span>{choices.find((choice) => choice.value === theme)?.title}</span>
        </SettingsRow>
      </SettingsSection>
      <div className={cx("appearance-choices")}>
        <SegmentedControl
          id={`${id}-mode`}
          label="明暗模式"
          value={theme}
          options={choices.map((choice) => ({
            value: choice.value,
            label: choice.title,
            title: choice.description,
          }))}
          disabled={!ready || pending}
          onChange={(value) => {
            setSaved(false);
            void choose(value as ThemeMode);
          }}
        />
        <p
          id={`${id}-mode-${theme}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-mode-${theme}`}
          className={cx("settings-note")}
        >
          {choices.find((choice) => choice.value === theme)?.description}
        </p>
      </div>
      <div className={cx("appearance-palette")}>
        <SettingsSection
          title="配色主题"
          description="配色仅应用于内容区；原生标题栏保持明暗模式。"
        >
          <SettingsRow
            label={<label id={`${id}-preset`}>主题</label>}
            description="更改会在当前窗口即时预览，保存后同步到其他窗口。"
          >
            <Select
              label="配色主题"
              value={draft.preset}
              disabled={!ready || pending}
              options={[
                { value: "default", label: "默认" },
                { value: "github", label: "GitHub" },
                { value: "custom", label: "自定义" },
              ]}
              onValueChange={(value) => {
                setDraft((current) => ({ ...current, preset: value as ColorTheme["preset"] }));
                setSaved(false);
              }}
            />
          </SettingsRow>
          {colors.map(({ key, label, description }) => (
            <SettingsRow
              key={key}
              label={<label htmlFor={`${id}-${key}`}>{label}</label>}
              description={description}
            >
              <div className={cx("theme-color-input")}>
                <input
                  type="color"
                  aria-label={`选择${label}颜色`}
                  disabled={!ready || pending}
                  value={/^#[0-9a-f]{6}$/i.test(palette[key]) ? palette[key] : "#000000"}
                  onChange={(event) => edit(key, event.target.value)}
                />
                <Input
                  id={`${id}-${key}`}
                  value={palette[key]}
                  spellCheck={false}
                  maxLength={7}
                  aria-invalid={!!validation}
                  aria-describedby={validation ? `${id}-error` : undefined}
                  disabled={!ready || pending}
                  onChange={(event) => edit(key, event.target.value)}
                />
              </div>
            </SettingsRow>
          ))}
        </SettingsSection>
        <p className={cx("settings-note")}>
          正在编辑{resolved === "dark" ? "深色" : "浅色"}配色 · 文字对比度 {ratio}
          :1。切换明暗模式可分别设置。
        </p>
        {validation && <Notice id={`${id}-error`}>{validation}</Notice>}
        <div className={cx("appearance-actions")}>
          <Button
            variant="ghost"
            disabled={!ready || pending}
            onClick={() => {
              setDraft(defaultColorTheme());
              setSaved(false);
            }}
          >
            恢复默认
          </Button>
          <span role="status">
            {pending ? "正在保存…" : changed ? "尚未保存" : saved ? "配色已保存" : ""}
          </span>
          <Button
            variant="outline"
            disabled={!changed || pending}
            onClick={() => {
              setDraft(colorTheme);
              setSaved(false);
            }}
          >
            取消
          </Button>
          <Button
            variant="primary"
            disabled={!ready || pending || !changed || !parsed.success}
            onClick={async () => {
              if (await saveColors(draft)) setSaved(true);
            }}
          >
            保存配色
          </Button>
        </div>
        <p className={cx("settings-note")}>离开外观设置会取消未保存的预览。</p>
      </div>
      {error && <Notice>{error}</Notice>}
    </div>
  );
}
