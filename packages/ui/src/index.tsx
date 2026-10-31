import "./styles.d.ts";
import { uiText } from "./locales.ts";
import React, {
  useEffect,
  useRef,
  useState,
  useId,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import type { ViewClient } from "@semicoder/fn-sdk/client";
import { useApplication } from "@semicoder/fn-sdk/react";
import { Icon } from "./icons.tsx";
import s from "./ui.module.css";
import "./theme.css";
export { Icon };
export type { IconName } from "./icons.tsx";
export { classes } from "./classes.ts";
export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: React.ComponentPropsWithRef<"button"> & {
  variant?: string;
  size?: string;
}) {
  return (
    <button
      type="button"
      {...props}
      data-variant={variant}
      data-size={size}
      className={s.button + " " + className}
    />
  );
}
export function Input({
  icon,
  className = "",
  ...props
}: React.ComponentPropsWithRef<"input"> & { icon?: ReactNode }) {
  return (
    <span className={s.inputWrap + " " + className}>
      {icon}
      <input {...props} className={s.input} />
    </span>
  );
}
export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={s.textarea + " " + className} />;
}
export function Checkbox({
  checked,
  onChange,
  label,
  className = "",
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <label className={s.checkbox + " " + className}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
export function Modal({
  open = true,
  title,
  children,
  onClose,
  className = "",
  contentClassName = "",
  closeLabel = uiText(
    typeof document !== "undefined" ? document.documentElement.lang : "en",
    "close",
  ),
  wide = false,
}: {
  open?: boolean;
  title: ReactNode;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  contentClassName?: string;
  closeLabel?: string;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    close = useRef(onClose);
  close.current = onClose;
  const id = useId();
  useEffect(() => {
    const el = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    if (open) {
      el.showModal();
      el.querySelector<HTMLElement>("[data-modal-autofocus]")?.focus();
    }
    const cancel = (e: Event) => {
      e.preventDefault();
      close.current();
    };
    el.addEventListener("cancel", cancel);
    return () => {
      el.removeEventListener("cancel", cancel);
      el.close();
      previous?.focus();
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={s.dialog + " " + (wide ? s.wide : "") + " " + className}
      aria-labelledby={id}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          onClose();
      }}
    >
      <header className={s.dialogHeader}>
        <h2 id={id}>{title}</h2>
        <Button aria-label={closeLabel} onClick={onClose}>
          <Icon name="close" />
        </Button>
      </header>
      <div className={s.dialogContent + " " + contentClassName}>{children}</div>
    </dialog>
  );
}
export interface MenuItem {
  id: string;
  label?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  checked?: boolean;
  type?: string;
  icon?: ReactNode;
}
export function Menu({
  anchor,
  items,
  open,
  onClose,
  onSelect,
  align = "start",
  autoFocus = true,
  role = "menu",
}: {
  anchor: ReactNode;
  items: MenuItem[];
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  align?: string;
  autoFocus?: boolean;
  portal?: boolean;
  role?: "menu" | "listbox";
}) {
  const ref = useRef<HTMLDivElement>(null),
    target = useRef<HTMLSpanElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const el = ref.current!,
      rect = target.current!.getBoundingClientRect();
    el.showPopover();
    const box = el.getBoundingClientRect();
    el.style.left =
      Math.max(
        8,
        Math.min(
          innerWidth - box.width - 8,
          align === "end" ? rect.right - box.width : rect.left,
        ),
      ) + "px";
    el.style.top =
      Math.max(8, Math.min(innerHeight - box.height - 8, rect.bottom + 6)) +
      "px";
    if (autoFocus)
      (
        el.querySelector<HTMLButtonElement>(
          'button[aria-selected="true"]:not(:disabled)',
        ) ?? el.querySelector<HTMLButtonElement>("button:not(:disabled)")
      )?.focus();
    const outside = (e: PointerEvent) => {
      if (
        !el.contains(e.target as Node) &&
        !target.current?.contains(e.target as Node)
      )
        close.current();
    };
    document.addEventListener("pointerdown", outside, true);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      el.hidePopover();
      target.current?.querySelector<HTMLButtonElement>("button")?.focus();
    };
  }, [open, align, autoFocus]);
  return (
    <>
      <span ref={target}>{anchor}</span>
      <div
        popover="manual"
        ref={ref}
        className={s.menu}
        role={role}
        onKeyDown={(e) => {
          const rows = [
            ...e.currentTarget.querySelectorAll<HTMLButtonElement>(
              "button:not(:disabled)",
            ),
          ];
          const index = rows.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
            e.preventDefault();
            rows[
              e.key === "Home"
                ? 0
                : e.key === "End"
                  ? rows.length - 1
                  : (index + (e.key === "ArrowDown" ? 1 : rows.length - 1)) %
                    rows.length
            ]?.focus();
          }
          if (e.key === "Escape" || e.key === "Tab") {
            if (e.key === "Escape") e.preventDefault();
            onClose();
          }
        }}
      >
        {items.map((item) =>
          item.type === "separator" ? (
            <hr key={item.id} />
          ) : (
            <button
              key={item.id}
              role={role === "listbox" ? "option" : "menuitem"}
              aria-selected={role === "listbox" ? item.checked : undefined}
              disabled={item.disabled}
              data-danger={item.danger || undefined}
              onClick={() => {
                onSelect(item.id);
                onClose();
              }}
            >
              {item.icon}
              {item.label}
              {item.checked && <Icon name="check" size={14} />}
            </button>
          ),
        )}
      </div>
    </>
  );
}
export function Select({
  value,
  onValueChange,
  options,
  label,
  disabled,
  className = "",
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: ReactNode; disabled?: boolean }[];
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, set] = useState(false);
  return (
    <Menu
      role="listbox"
      open={open}
      onClose={() => set(false)}
      onSelect={onValueChange}
      items={options.map((o) => ({
        id: o.value,
        label: o.label,
        checked: o.value === value,
        disabled: o.disabled,
      }))}
      anchor={
        <Button
          className={s.select + " " + className}
          role="combobox"
          aria-label={label}
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          onClick={() => set(!open)}
        >
          {options.find((o) => o.value === value)?.label ?? label}
          <Icon name="chevron" size={14} />
        </Button>
      }
    />
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div role="status" className={s.notice}>
      {children}
    </div>
  );
}
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className={s.pageHeader}>
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions}
    </header>
  );
}
export function Surface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={s.surface + " " + className}>{children}</section>;
}
export function Toast({
  text,
  onClose,
}: {
  text: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.showPopover();
    const timer = setTimeout(onClose, 3500);
    return () => {
      clearTimeout(timer);
      ref.current?.hidePopover();
    };
  }, [text, onClose]);
  return (
    <div ref={ref} popover="manual" role="status" className={s.toast}>
      {text}
    </div>
  );
}
export function useTheme(theme = "system") {
  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme:dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === "system" ? (query.matches ? "dark" : "light") : theme;
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [theme]);
}
export function ApplicationProvider({
  view,
  children,
}: {
  view: ViewClient<any>;
  children: ReactNode;
}) {
  const { preferences, error, ready } = useApplication(view);
  const [toast, setToast] = useState("");
  const [confirmation, setConfirmation] = useState<{
    text: string;
    resolve: (v: boolean) => void;
  }>();
  useTheme(preferences?.theme);
  useEffect(() => {
    if (preferences) document.documentElement.lang = preferences.locale;
  }, [preferences?.locale]);
  const pending = useRef(confirmation);
  pending.current = confirmation;
  useEffect(() => {
    const notify = (e: Event) => setToast((e as CustomEvent).detail.text);
    const confirm = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      pending.current?.resolve(false);
      setConfirmation({
        text: detail.text,
        resolve:
          detail.resolve ??
          ((value: boolean) => {
            void view.request("/ui/answer", { id: detail.id, value });
          }),
      });
    };
    const close = (event: Event) => {
      if (
        (event as CustomEvent).detail?.busy === false &&
        !view.hasUnsavedChanges
      ) {
        void view.request("/apps/close", {}).catch((error) => {
          if (error?.code === "busy") close(new Event("closeRequested"));
          else setToast(String(error));
        });
        return;
      }
      pending.current?.resolve(false);
      setConfirmation({
        text: uiText(
          preferences?.locale ?? "en",
          "closing_stops_active_tasks_and",
        ),
        resolve: (value) => {
          if (value)
            void view
              .request("/apps/close", { force: true })
              .catch((e) => setToast(String(e)));
        },
      });
    };
    const dispose = () => {
      pending.current?.resolve(false);
      setConfirmation(undefined);
    };
    view.addEventListener("toast", notify);
    view.addEventListener("confirm", confirm);
    view.addEventListener("closeRequested", close);
    view.addEventListener("disposed", dispose);
    return () => {
      dispose();
      view.removeEventListener("toast", notify);
      view.removeEventListener("confirm", confirm);
      view.removeEventListener("closeRequested", close);
      view.removeEventListener("disposed", dispose);
    };
  }, [view, preferences?.locale]);
  if (error)
    return (
      <div className={s.failure}>
        <h2>
          {uiText(preferences?.locale ?? "en", "application_disconnected")}
        </h2>
        <p>{error}</p>
        <Button onClick={() => location.reload()}>
          {uiText(preferences?.locale ?? "en", "reload")}
        </Button>
      </div>
    );
  return (
    <>
      {ready ? (
        children
      ) : (
        <div className={s.failure}>
          {uiText(preferences?.locale ?? "en", "connecting")}
        </div>
      )}
      {toast && <Toast text={toast} onClose={() => setToast("")} />}{" "}
      {confirmation && (
        <Modal
          title={uiText(preferences?.locale ?? "en", "confirm")}
          onClose={() => {
            confirmation.resolve(false);
            setConfirmation(undefined);
          }}
        >
          <p>{confirmation.text}</p>
          <div className={s.actions}>
            <Button
              onClick={() => {
                confirmation.resolve(false);
                setConfirmation(undefined);
              }}
            >
              {uiText(preferences?.locale ?? "en", "cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                confirmation.resolve(true);
                setConfirmation(undefined);
              }}
            >
              {uiText(preferences?.locale ?? "en", "confirm")}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
const icon = (name: React.ComponentProps<typeof Icon>["name"]) =>
  function OwnIcon(props: React.SVGProps<SVGSVGElement>) {
    return <Icon {...props} name={name} />;
  };
export const IconEllipsisOutlineRegular = icon("more"),
  IconEditOutlineRegular = icon("edit"),
  IconCloseOutlineRegular = icon("close"),
  IconPlusOutlineRegular = icon("plus"),
  IconSearchOutlineRegular = icon("search"),
  IconChecklistOutlineRegular = icon("board"),
  IconCheckOutlineRegular = icon("check"),
  IconArchiveOutlineRegular = icon("download"),
  IconChevronDownOutlineRegular = icon("chevron");
