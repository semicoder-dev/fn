import React, { useSyncExternalStore, type ReactNode } from "react";
import type Navigation from "./client.tsx";
export const useNavigation = (navigation: Navigation) =>
  useSyncExternalStore(navigation.subscribe, navigation.snapshot);
export function NavigationButton({
  navigation,
  path,
  label,
  children,
  compact = false,
}: {
  navigation: Navigation;
  path: string;
  label: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  const current = useNavigation(navigation);
  return (
    <button
      className={
        compact
          ? `activity-button ${current.split("/")[0] === path.split("/")[0] ? "active" : ""}`
          : current === path
            ? "selected"
            : ""
      }
      title={label}
      aria-label={label}
      aria-current={current === path ? "page" : undefined}
      onClick={() => navigation.go(path)}
    >
      {children}
      {!compact && label}
    </button>
  );
}
