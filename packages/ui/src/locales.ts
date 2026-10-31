const words = {
  closing_stops_active_tasks_and: {
    en: "Closing stops active tasks and discards unsaved changes.",
    "zh-CN": "关闭应用将停止正在执行的任务，并放弃未保存的更改。",
  },
  application_disconnected: {
    en: "Application disconnected",
    "zh-CN": "应用连接已结束",
  },
  reload: {
    en: "Reload",
    "zh-CN": "重新载入",
  },
  connecting: {
    en: "Connecting…",
    "zh-CN": "正在连接…",
  },
  confirm: {
    en: "Confirm",
    "zh-CN": "确认",
  },
  cancel: {
    en: "Cancel",
    "zh-CN": "取消",
  },
  close: {
    en: "Close",
    "zh-CN": "关闭",
  },
} as const;
export const uiText = (locale: string, key: keyof typeof words): string =>
  words[key][locale === "zh-CN" ? "zh-CN" : "en"];
