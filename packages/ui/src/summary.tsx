import "./styles.d.ts";
import React from "react";
import {
  parseSummary,
  type ApplicationSummary,
} from "@semicoder/fn-sdk/summary";
import type { TextValue } from "@semicoder/fn-sdk/text";
import s from "./summary.module.css";
export function Summary({
  snapshot,
  text = (v) => (typeof v === "string" ? v : v.key),
  fallback = "",
  trendLabel = "Trend",
  progressLabel = "Progress",
}: {
  snapshot?: ApplicationSummary;
  text?: (value: TextValue) => string;
  fallback?: string;
  trendLabel?: string;
  progressLabel?: string;
}) {
  let value: ApplicationSummary;
  try {
    value = snapshot ? parseSummary(snapshot) : { version: 1 };
  } catch {
    value = { version: 1 };
  }
  const hasContent =
    value.text ||
    value.detail ||
    value.metrics?.length ||
    value.badges?.length ||
    value.progress ||
    value.sparkline;
  const trend = value.sparkline;
  const scale = trend ? Math.max(1, ...trend.values.map(Math.abs)) : 1;
  const normalized = trend?.values.map((v) => v / scale);
  const min = normalized ? Math.min(...normalized) : 0;
  const max = normalized ? Math.max(...normalized) : 0;
  return (
    <span className={s.summary}>
      {(value.text ||
        value.detail ||
        value.badges?.length ||
        value.progress ||
        !hasContent) && (
        <span className={s.content}>
          {(value.text || !hasContent) && (
            <span className={s.text}>
              {value.text ? text(value.text) : fallback}
            </span>
          )}
          {value.detail && (
            <span className={s.detail}>{text(value.detail)}</span>
          )}
          {!!value.badges?.length && (
            <span className={s.badges}>
              {value.badges.map((badge, i) => (
                <span key={i} className={s.badge} data-tone={badge.tone}>
                  {text(badge.text)}
                </span>
              ))}
            </span>
          )}
          {value.progress && (
            <span className={s.progressGroup}>
              <span className={s.detail}>
                {value.progress.label
                  ? text(value.progress.label)
                  : progressLabel}
              </span>
              <progress
                className={s.progress}
                value={value.progress.value}
                max={1}
                aria-label={
                  value.progress.label
                    ? text(value.progress.label)
                    : progressLabel
                }
              />
            </span>
          )}
        </span>
      )}
      {!!value.metrics?.length && (
        <span className={s.metrics}>
          {value.metrics.map((metric, i) => (
            <span key={i} className={s.metric}>
              <strong>{metric.value}</strong>
              {metric.label && (
                <span className={s.detail}>{text(metric.label)}</span>
              )}
            </span>
          ))}
        </span>
      )}
      {trend && (
        <svg
          className={s.sparkline}
          data-tone={trend.tone}
          viewBox="0 0 160 40"
          role="img"
          aria-label={trend.label ? text(trend.label) : trendLabel}
        >
          <polyline
            points={normalized!
              .map(
                (v, i) =>
                  `${(i / (trend.values.length - 1)) * 156 + 2},${36 - ((v - min) / (max - min || 1)) * 32}`,
              )
              .join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </span>
  );
}
