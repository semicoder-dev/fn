import { classes } from "@semicoder/fn-ui";
import styles from "./style.module.css";
const cx = (...values: (string | false | undefined)[]) => classes(styles, ...values);
import { Checkbox } from "@semicoder/fn-ui";
import { Select, Input, Button } from "@semicoder/fn-ui";
import React, { useEffect, useState } from "react";
import {
  validateResponse,
  type SessionCard,
  type CardValues,
} from "@semicoder/fn-chat-cards/contract";
import type { APIClient } from "@semicoder/fia/api";
import type api from "@semicoder/fn-chat-cards/api";
const labels: Record<string, string> = {
  pending: "等待回复",
  running: "处理中",
  completed: "已完成",
  failed: "处理失败",
  cancelled: "已取消",
  expired: "已过期",
  interrupted: "已中断，未自动重试",
};
export default function Card({
  remote,
  record,
  enabled,
  refresh,
}: {
  remote: APIClient<typeof api>;
  record: SessionCard;
  enabled: boolean;
  refresh(): Promise<void>;
}) {
  const [values, setValues] = useState<CardValues>({});
  const [included, setIncluded] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (record.answer) {
      setValues(record.answer.values);
      setIncluded(Object.keys(record.answer.values));
    }
  }, [record.answer]);
  const editable = enabled && !pending && record.state === "pending" && record.expiresAt > now;
  const set = (id: string, value: CardValues[string]) =>
    setValues((current) => ({ ...current, [id]: value }));
  async function submit(actionId: string) {
    if (!editable) return;
    setError("");
    try {
      const input: CardValues = {};
      for (const field of record.card.inputs)
        if (field.required || included.includes(field.id)) {
          const value = values[field.id];
          input[field.id] =
            field.type === "number"
              ? value === undefined || value === ""
                ? NaN
                : Number(value)
              : (value ??
                (field.type === "boolean" ? false : field.type === "multiSelect" ? [] : ""));
        }
      validateResponse(record.card, actionId, input);
      setPending(true);
      await remote.call("respond", {
        sessionId: record.sessionId,
        cardId: record.id,
        actionId,
        values: input,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      try {
        await refresh();
      } finally {
        setPending(false);
      }
    }
  }
  return (
    <article className={cx("runtime-card runtime-session-card")} aria-label={record.card.title}>
      <h2>{record.card.title}</h2>
      <p>{record.card.summary}</p>
      {record.card.blocks.map((block, index) =>
        block.type === "divider" ? (
          <hr key={index} />
        ) : block.type === "text" ? (
          <p key={index} style={{ whiteSpace: "pre-wrap" }}>
            {block.text}
          </p>
        ) : (
          <dl key={index}>
            {block.fields.map((field, i) => (
              <React.Fragment key={i}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </React.Fragment>
            ))}
          </dl>
        ),
      )}
      <fieldset disabled={!editable} className={cx("runtime-form")}>
        {record.card.inputs.map((field) => (
          <div key={field.id}>
            {!field.required && (
              <Checkbox
                checked={included.includes(field.id)}
                onChange={(checked) =>
                  setIncluded((current) =>
                    checked ? [...current, field.id] : current.filter((id) => id !== field.id),
                  )
                }
                label={`填写 ${field.label}（可选）`}
              />
            )}
            {(field.required || included.includes(field.id)) &&
              (field.type === "boolean" ? (
                <Checkbox
                  checked={values[field.id] === true}
                  onChange={(checked) => set(field.id, checked)}
                  label={field.label}
                />
              ) : field.type === "multiSelect" ? (
                <fieldset>
                  <legend>{field.label}</legend>
                  {field.options?.map((option) => (
                    <Checkbox
                      key={option.id}
                      checked={
                        Array.isArray(values[field.id]) &&
                        (values[field.id] as string[]).includes(option.id)
                      }
                      onChange={(checked) => {
                        const chosen = Array.isArray(values[field.id])
                          ? (values[field.id] as string[])
                          : [];
                        set(
                          field.id,
                          checked
                            ? [...chosen, option.id]
                            : chosen.filter((id) => id !== option.id),
                        );
                      }}
                      label={option.label}
                    />
                  ))}
                </fieldset>
              ) : field.type === "select" ? (
                <label>
                  {field.label}
                  <Select
                    value={String(values[field.id] ?? "")}
                    onValueChange={(value) => set(field.id, value)}
                    label={field.label}
                    options={[
                      { value: "", label: "请选择" },
                      ...(field.options?.map((option) => ({
                        value: option.id,
                        label: option.label,
                      })) ?? []),
                    ]}
                  />
                </label>
              ) : (
                <label>
                  {field.label}
                  <Input
                    type={field.type === "number" ? "number" : "text"}
                    min={field.minimum}
                    max={field.maximum}
                    maxLength={field.maxLength ?? 16000}
                    value={String(values[field.id] ?? "")}
                    onChange={(event) => set(field.id, event.target.value)}
                  />
                </label>
              ))}
          </div>
        ))}
        <div className={cx("runtime-actions")}>
          {record.card.actions.map((action) => (
            <Button
              key={action.id}
              className={cx(
                action.style === "primary"
                  ? "runtime-primary"
                  : action.style === "danger"
                    ? "runtime-danger"
                    : undefined,
              )}
              onClick={() => void submit(action.id)}
              type="button"
              variant={action.style === "primary" ? "primary" : "ghost"}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </fieldset>
      <small>
        {pending
          ? "等待宿主确认"
          : record.state === "pending" && record.expiresAt <= now
            ? "已过期"
            : labels[record.state]}
      </small>
      {(error || record.error) && <p role="alert">{error || record.error}</p>}
    </article>
  );
}
