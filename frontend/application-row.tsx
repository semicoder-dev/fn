import React from "react";
import { Summary } from "@semicoder/fn-ui/summary";
import type { ApplicationSummary } from "@semicoder/fn-sdk/summary";
import type { TextValue } from "@semicoder/fn-sdk/text";
import s from "./application-row.module.css";
export function ApplicationRow({
  name,
  icon,
  status,
  updated,
  summary,
  fallback,
  text,
  running,
  error,
  actions,
  onOpen,
  onMove,
  draggable,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  openLabel,
  trendLabel,
  progressLabel,
}: {
  name: string;
  icon: React.ReactNode;
  status: string;
  updated?: string;
  summary?: ApplicationSummary;
  fallback: string;
  text: (v: TextValue) => string;
  running?: boolean;
  error?: string;
  actions?: React.ReactNode;
  onOpen?: () => void;
  onMove?: (direction: -1 | 1) => void;
  draggable?: boolean;
  onDragStart?: React.DragEventHandler;
  onDragEnd?: React.DragEventHandler;
  onDragOver?: React.DragEventHandler;
  onDrop?: React.DragEventHandler;
  openLabel: string;
  trendLabel: string;
  progressLabel: string;
}) {
  const descriptionId = React.useId();
  return (
    <section
      className={s.row}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-application-row
    >
      <button
        type="button"
        className={s.open}
        onClick={onOpen}
        aria-label={openLabel + name}
        aria-describedby={`${descriptionId}-state ${descriptionId}-summary ${descriptionId}-meta`}
        aria-keyshortcuts={onMove ? "Alt+ArrowUp Alt+ArrowDown" : undefined}
        onKeyDown={(e) => {
          if (onMove && e.altKey && ["ArrowUp", "ArrowDown"].includes(e.key)) {
            e.preventDefault();
            onMove(e.key === "ArrowUp" ? -1 : 1);
          }
        }}
      >
        <span className={s.identity}>
          {icon}
          <span className={s.name}>
            {name}
            <span
              id={`${descriptionId}-state`}
              className={s.state}
              data-running={running}
            >
              {status}
            </span>
          </span>
        </span>
        <span id={`${descriptionId}-summary`} className={s.summary}>
          <Summary
            snapshot={summary}
            text={text}
            fallback={fallback}
            trendLabel={trendLabel}
            progressLabel={progressLabel}
          />
        </span>
        <span id={`${descriptionId}-meta`} className={s.meta}>
          {error ? <span className={s.error}>{error}</span> : updated}
        </span>
      </button>
      {actions && <div className={s.actions}>{actions}</div>}
    </section>
  );
}
