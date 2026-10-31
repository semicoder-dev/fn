import "./styles.d.ts";
import React from "react";
import {
  parseWidget,
  type WidgetNode,
  type TextValue,
} from "@semicoder/fn-sdk/widgets";
import s from "./widgets.module.css";
export function Widget({
  snapshot,
  text = (value: TextValue) => (typeof value === "string" ? value : value.key),
}: {
  snapshot: unknown;
  text?: (value: TextValue) => string;
}) {
  let body: WidgetNode;
  try {
    body = parseWidget(snapshot).body;
  } catch {
    return <span className={s.caption}>Invalid widget</span>;
  }
  const render = (node: WidgetNode, key: number): React.ReactNode => {
    if (node.type === "row" || node.type === "column" || node.type === "list")
      return (
        <div key={key} className={s[node.type]} data-gap={node.gap ?? "sm"}>
          {node.children.map(render)}
        </div>
      );
    if (node.type === "text")
      return (
        <div key={key} className={s[node.variant ?? "body"]}>
          {text(node.text)}
        </div>
      );
    if (node.type === "metric")
      return (
        <div key={key}>
          <strong className={s.metric}>{node.value}</strong>
          {node.label && <div className={s.caption}>{text(node.label)}</div>}
        </div>
      );
    if (node.type === "badge")
      return (
        <span key={key} className={s.badge} data-tone={node.tone}>
          {text(node.text)}
        </span>
      );
    if (node.type === "divider") return <hr key={key} className={s.divider} />;
    if (node.type === "progress")
      return (
        <div key={key}>
          {node.label && <span className={s.caption}>{text(node.label)}</span>}
          <progress className={s.progress} value={node.value} max={1} />
        </div>
      );
    if (node.type === "sparkline") {
      const min = Math.min(...node.values),
        max = Math.max(...node.values);
      const points = node.values
        .map(
          (v, i) =>
            `${(i / (node.values.length - 1)) * 200},${52 - ((v - min) / (max - min || 1)) * 45}`,
        )
        .join(" ");
      return (
        <svg
          key={key}
          className={s.sparkline}
          viewBox="0 0 200 60"
          aria-label="Trend"
        >
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    }
    return null;
  };
  return <div className={s.widget}>{render(body, 0)}</div>;
}
