import { useEffect, useState, useId, useLayoutEffect } from "react";
import type { ViewClient } from "./client.ts";
import type { Contract } from "./contract.ts";
import type { Preferences } from "./types.ts";
export function useUnsavedChanges<C extends Contract>(
  view: ViewClient<C>,
  dirty: boolean,
) {
  const scope = useId();
  useLayoutEffect(() => {
    void view.application.setUnsavedChanges(dirty, scope).catch(() => {});
    return () => {
      void view.application.setUnsavedChanges(false, scope).catch(() => {});
    };
  }, [view, dirty, scope]);
}
export function useApplication<C extends Contract>(view: ViewClient<C>) {
  const [preferences, set] = useState<Preferences | undefined>(
    view.preferences,
  );
  const [error, setError] = useState<string>();
  useEffect(() => {
    const changed = () =>
      set(view.preferences ? { ...view.preferences } : undefined);
    const stale = () =>
      setError(
        view.preferences?.locale === "zh-CN"
          ? "应用已停止，未完成的任务已中断。请从 Fn 重新打开。"
          : "The app stopped and unfinished tasks were interrupted. Reopen it from Fn.",
      );
    view.addEventListener("preferences", changed);
    view.addEventListener("stale", stale);
    view.ready.then(changed).catch((e) => setError(String(e)));
    return () => {
      view.removeEventListener("preferences", changed);
      view.removeEventListener("stale", stale);
    };
  }, [view]);
  return { preferences, error, ready: !!preferences };
}
export function useI18n<C extends Contract>(view: ViewClient<C>) {
  const { preferences } = useApplication(view);
  const locale = preferences?.locale ?? "en";
  return {
    locale,
    t: (key: string, args?: Record<string, string | number>) => {
      let value =
        view.bootstrap?.messages[locale]?.[key] ??
        view.bootstrap?.messages.en?.[key] ??
        key;
      for (const [name, text] of Object.entries(args ?? {}))
        value = value.replaceAll("{" + name + "}", String(text));
      return value;
    },
  };
}
