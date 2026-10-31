import type { ReactNode } from "react";
export type IconName =
  | "grid"
  | "search"
  | "settings"
  | "sun"
  | "moon"
  | "plus"
  | "close"
  | "minus"
  | "expand"
  | "arrow"
  | "check"
  | "chevron"
  | "translate"
  | "note"
  | "board"
  | "chart"
  | "bell"
  | "phone"
  | "download"
  | "refresh"
  | "copy"
  | "trash"
  | "pin"
  | "play"
  | "stop"
  | "edit"
  | "cloud"
  | "help"
  | "keyboard"
  | "send"
  | "more";
const paths: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  settings: (
    <>
      <path d="m9 3-1 3-3 1-2 5 2 5 3 1 1 3h6l1-3 3-1 2-5-2-5-3-1-1-3Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  moon: <path d="M20.5 14.4A8.6 8.6 0 0 1 9.6 3.5a8.7 8.7 0 1 0 10.9 10.9Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  minus: <path d="M5 12h14" />,
  expand: (
    <>
      <path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" />
    </>
  ),
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m8 10 4 4 4-4" />,
  translate: (
    <>
      <path d="M3 5h12M9 3v2m4 0c0 5-4 9-9 11m1-8c1 4 4 7 8 9m1 4 4-11 4 11m-6-4h4" />
    </>
  ),
  note: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="M8 8h8M8 12h8m-8 4h5" />
    </>
  ),
  board: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M9 4v16m6-16v16M6 8v3m6-3v6m6-6v2" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h17M7 14l4-5 4 3 6-7" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-12 12a3 3 0 0 0 6 0" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M10 5h4m-3 14h2" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 2M5 16a8 8 0 0 0 13 2" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M16 4V3H3v13h1" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7" />
    </>
  ),
  pin: (
    <>
      <path d="m8 3 8 0-1 7 4 4H5l4-4-1-7m4 11v7" />
    </>
  ),
  play: <path d="m8 4 12 8-12 8Z" />,
  stop: <rect x="5" y="5" width="14" height="14" rx="2" />,
  edit: (
    <>
      <path d="m4 16 12-12 4 4L8 20H4Z" />
      <path d="m13 7 4 4" />
    </>
  ),
  cloud: <path d="M7 18h11a4 4 0 0 0 1-8 7 7 0 0 0-13-1 4.5 4.5 0 0 0 1 9Z" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .6-1.5 1-1.5 3m0 3h.01" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" />
    </>
  ),
  send: (
    <>
      <path d="m3 3 19 9-19 9 3-9-3-9Zm3 9h16" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
};
export function Icon({
  name,
  size = 18,
  ...props
}: { name: IconName; size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
