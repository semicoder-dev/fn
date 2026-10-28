import React, { useId, useState, type ComponentProps, type ReactNode } from "react";
import { Button, Menu, IconChevronDownOutlineRegular } from "@deepseek-ai/dsh-client-ui-primitives";
import styles from "./compositions.module.css";
import layout from "./layout.module.css";

/** Resolve shared layout and plugin-local CSS Modules without global class names. */
export function classes(local: Record<string, string>, ...values: (string | false | undefined)[]) {
  return values
    .filter(Boolean)
    .flatMap((value) => String(value).split(/\s+/))
    .filter(Boolean)
    .map((name) => local[name] ?? layout[name] ?? name)
    .join(" ");
}
export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${styles.textarea} ${className}`} />;
}
export type SelectOption = { value: string; label: ReactNode; disabled?: boolean };
/** A single-value field composed with the original DSH Menu (keyboard, focus and portal). */
export function Select({
  value,
  options,
  onValueChange,
  label,
  disabled,
  required,
  name,
  id,
  className = "",
}: {
  value: string;
  options: readonly SelectOption[];
  onValueChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const generated = useId();
  const selected = options.find((option) => option.value === value);
  return (
    <span className={`${styles.select} ${className}`}>
      <Menu
        open={open && !disabled}
        onClose={() => setOpen(false)}
        portal
        autoFocus
        selectedId={value}
        items={options.map((option) => ({
          id: option.value,
          label: option.label,
          disabled: option.disabled,
        }))}
        onSelect={(id) => {
          onValueChange(id);
          setOpen(false);
        }}
        anchor={
          <Button
            id={id ?? generated}
            variant="outline"
            className={styles.selectTrigger}
            aria-label={label}
            aria-haspopup="menu"
            aria-expanded={open && !disabled}
            disabled={disabled}
            onClick={(event) => {
              // WebKit does not focus buttons on pointer clicks. Keep the Menu
              // anchor focusable for its original keyboard and return-focus logic.
              event.currentTarget.focus();
              setOpen(!open);
            }}
          >
            <span>{selected?.label ?? "请选择"}</span>
            <IconChevronDownOutlineRegular />
          </Button>
        }
      />
      {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
      {required && (
        <input
          className={styles.validation}
          tabIndex={-1}
          aria-hidden="true"
          required
          disabled={disabled}
          value={value}
          onChange={() => {}}
          onInvalid={(event) => {
            event.preventDefault();
            document.getElementById(id ?? generated)?.focus();
            setOpen(true);
          }}
        />
      )}
    </span>
  );
}
export function Notice({
  tone = "error",
  className = "",
  ...props
}: ComponentProps<"div"> & { tone?: "error" | "success" | "warning" | "neutral" }) {
  return (
    <div
      {...props}
      role={tone === "error" ? "alert" : "status"}
      data-tone={tone}
      className={`${styles.notice} ${className}`}
    />
  );
}
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions}
    </header>
  );
}
export function Surface({ className = "", ...props }: ComponentProps<"section">) {
  return <section {...props} className={`${styles.surface} ${className}`} />;
}
export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.settingsSection}>
      <header>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </header>
      <div>{children}</div>
    </section>
  );
}
export function SettingsRow({
  label,
  description,
  children,
}: {
  label: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.settingsRow}>
      <div>
        <strong>{label}</strong>
        {description && <p>{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}
