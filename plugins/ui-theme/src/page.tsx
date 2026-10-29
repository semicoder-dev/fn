import React, { useId, useSyncExternalStore } from "react";
import {
  Button,
  IconDarkOutlineRegular,
  IconFollowsystemOutlineRegular,
  IconLightOutlineRegular,
  Notice,
  PageHeader,
  classes,
} from "@semicoder/fn-ui";
import type { ThemeMode } from "@semicoder/fn-appearance/theme";
import type Theme from "./client.tsx";
import styles from "./style.module.css";

const cx = (...values: (string | false | undefined)[]) => classes(styles, ...values);
const choices = [
  { value: "light", title: "浅色", Icon: IconLightOutlineRegular },
  { value: "dark", title: "深色", Icon: IconDarkOutlineRegular },
  { value: "system", title: "跟随系统", Icon: IconFollowsystemOutlineRegular },
] satisfies { value: ThemeMode; title: string; Icon: typeof IconLightOutlineRegular }[];

export default function AppearanceSettings({ service }: { service: Theme; visible?: boolean }) {
  const { theme, resolved, choose, ready, pending, error } = useSyncExternalStore(
    service.subscribe,
    service.snapshot,
  );
  const id = useId();
  return (
    <div className={cx("settings-page")}>
      <PageHeader title="外观" description="选择适合你的明暗模式。" />
      <section className={cx("appearance-group")} aria-labelledby={`${id}-title`}>
        <h2 id={`${id}-title`}>明暗模式</h2>
        <div className={cx("appearance-choices")} role="group" aria-labelledby={`${id}-title`}>
          {choices.map(({ value, title, Icon }) => (
            <Button
              key={value}
              variant="outline"
              className={cx("appearance-choice")}
              aria-pressed={theme === value}
              disabled={!ready || pending}
              onClick={() => void choose(value)}
            >
              <Icon aria-hidden="true" />
              {title}
            </Button>
          ))}
        </div>
        <p className={cx("appearance-note")} role="status">
          {!ready
            ? "正在读取外观设置…"
            : pending
              ? "正在保存…"
              : theme === "system"
                ? `随系统自动切换，当前为${resolved === "dark" ? "深色" : "浅色"}。`
                : "应用界面与标题栏同步切换，更改自动保存。"}
        </p>
      </section>
      {error && <Notice>{error}</Notice>}
    </div>
  );
}
