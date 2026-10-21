import React, { useEffect, useState } from "react";
import { validateResponse, type SessionCard, type CardValues } from "@semicoder/fn-sdk/cards";
import { runtimeClient as client } from "./runtime-bridge";

const labels: Record<string, string> = { pending: "等待回复", running: "处理中", completed: "已完成", failed: "处理失败", cancelled: "已取消", expired: "已过期", interrupted: "已中断，未自动重试" };
export default function RuntimeCard({ record, enabled, refresh }: { record: SessionCard; enabled: boolean; refresh(): Promise<void> }) {
  const [values, setValues] = useState<CardValues>({});
  const [included, setIncluded] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { if (record.answer) { setValues(record.answer.values); setIncluded(Object.keys(record.answer.values)); } }, [record.answer]);
  const editable = enabled && !pending && record.state === "pending" && record.expiresAt > now;
  const set = (id: string, value: CardValues[string]) => setValues(current => ({ ...current, [id]: value }));
  async function submit(actionId: string) {
    if (!editable) return;
    setError("");
    try {
      const input: CardValues = {};
      for (const field of record.card.inputs) if (field.required || included.includes(field.id)) {
        const value = values[field.id];
        input[field.id] = field.type === "number" ? (value === undefined || value === "" ? NaN : Number(value)) : value ?? (field.type === "boolean" ? false : field.type === "multiSelect" ? [] : "");
      }
      validateResponse(record.card, actionId, input); setPending(true);
      await client.call("cards.respond", { sessionId: record.sessionId, cardId: record.id, actionId, values: input });
    } catch (caught) { setError(caught instanceof Error ? caught.message : String(caught)); }
    finally { try { await refresh(); } finally { setPending(false); } }
  }
  return <article className="runtime-card runtime-session-card" aria-label={record.card.title}>
    <h2>{record.card.title}</h2><p>{record.card.summary}</p>
    {record.card.blocks.map((block, index) => block.type === "divider" ? <hr key={index} /> : block.type === "text" ? <p key={index} style={{ whiteSpace: "pre-wrap" }}>{block.text}</p> : <dl key={index}>{block.fields.map((field, i) => <React.Fragment key={i}><dt>{field.label}</dt><dd>{field.value}</dd></React.Fragment>)}</dl>)}
    <fieldset disabled={!editable} className="runtime-form">
      {record.card.inputs.map(field => <div key={field.id}>
        {!field.required && <label><input type="checkbox" checked={included.includes(field.id)} onChange={event => setIncluded(current => event.target.checked ? [...current, field.id] : current.filter(id => id !== field.id))} />填写 {field.label}（可选）</label>}
        {(field.required || included.includes(field.id)) && (field.type === "boolean" ? <label><input type="checkbox" checked={values[field.id] === true} onChange={event => set(field.id, event.target.checked)} />{field.label}</label> : field.type === "multiSelect" ? <fieldset><legend>{field.label}</legend>{field.options?.map(option => <label key={option.id}><input type="checkbox" checked={Array.isArray(values[field.id]) && (values[field.id] as string[]).includes(option.id)} onChange={event => { const chosen = Array.isArray(values[field.id]) ? values[field.id] as string[] : []; set(field.id, event.target.checked ? [...chosen, option.id] : chosen.filter(id => id !== option.id)); }} />{option.label}</label>)}</fieldset> : field.type === "select" ? <label>{field.label}<select value={String(values[field.id] ?? "")} onChange={event => set(field.id, event.target.value)}><option value="">请选择</option>{field.options?.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label> : <label>{field.label}<input type={field.type === "number" ? "number" : "text"} min={field.minimum} max={field.maximum} maxLength={field.maxLength ?? 16000} value={String(values[field.id] ?? "")} onChange={event => set(field.id, event.target.value)} /></label>)}
      </div>)}
      <div className="runtime-actions">{record.card.actions.map(action => <button key={action.id} className={action.style === "primary" ? "runtime-primary" : action.style === "danger" ? "runtime-danger" : undefined} onClick={() => void submit(action.id)}>{action.label}</button>)}</div>
    </fieldset>
    <small>{pending ? "等待宿主确认" : record.state === "pending" && record.expiresAt <= now ? "已过期" : labels[record.state]}</small>
    {(error || record.error) && <p role="alert">{error || record.error}</p>}
  </article>;
}
