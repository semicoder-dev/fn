import "./style.css";
import React from "react";
import { Service, type Context } from "@deepseek-ai/cordis";
import { client } from "@semicoder/fn-sdk/client";
import { Sun } from "@semicoder/fn-sdk/ui";
import { NavigationButton } from "@semicoder/fn-ui-navigation/view";
import type {} from "@semicoder/fn-ui-settings/contract";
import api from "@semicoder/fn-appearance/contract";
import {
  colorTokens,
  defaultColorTheme,
  type AppearanceConfig,
  type AppearanceUpdate,
  type ColorTheme,
  type ThemeMode,
} from "@semicoder/fn-appearance/theme";
import AppearanceSettings from "./page.tsx";
export default class Theme extends Service {
  static inject = ["settingsSlots", "api:appearance", "platform", "slots", "navigation"];
  private remote;
  private listeners = new Set<() => void>();
  private preview: ColorTheme | null = null;
  private media = matchMedia("(prefers-color-scheme: dark)");
  private tokens: string[] = [];
  private revision = 0;
  private closed = false;
  private state = {
    theme: "system" as ThemeMode,
    colorTheme: defaultColorTheme(),
    resolved: "light" as "light" | "dark",
    ready: false,
    pending: false,
    error: "",
    choose: (theme: ThemeMode) => this.save({ theme }),
    saveColors: (colorTheme: ColorTheme) => this.save({ colorTheme }),
    previewColors: (colorTheme: ColorTheme | null) => {
      this.preview = colorTheme;
      this.changed();
    },
  };
  constructor(ctx: Context) {
    super(ctx, "theme");
    this.remote = client(ctx, "appearance", api);
  }
  snapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  async *[Service.init]() {
    const previous = document.documentElement.dataset.theme;
    const change = () => this.changed();
    this.media.addEventListener("change", change);
    yield () => {
      this.closed = true;
      this.revision++;
      this.media.removeEventListener("change", change);
      for (const key of this.tokens) document.documentElement.style.removeProperty(key);
      if (previous) document.documentElement.dataset.theme = previous;
      else delete document.documentElement.dataset.theme;
      this.listeners.clear();
    };
    this.remote.on("changed", () => void this.refresh());
    this.remote.onReconnect(() => void this.refresh());
    this.ctx.slots.register({ name: "fn.settings.navigation", id: "theme", order: 10 }, () => (
      <NavigationButton navigation={this.ctx.navigation} path="settings/appearance" label="外观">
        <Sun size={18} />
      </NavigationButton>
    ));
    this.ctx.slots.register(
      { name: "fn.settings.content", key: "appearance", inject: () => ({ service: this }) },
      AppearanceSettings,
    );
    await this.refresh();
  }
  private changed() {
    if (this.closed) return;
    const resolved =
      this.state.theme === "system" ? (this.media.matches ? "dark" : "light") : this.state.theme;
    this.state = { ...this.state, resolved };
    const root = document.documentElement;
    root.dataset.theme = this.state.theme;
    for (const key of this.tokens) root.style.removeProperty(key);
    const tokens = colorTokens(this.preview ?? this.state.colorTheme, resolved);
    this.tokens = Object.keys(tokens);
    for (const [key, value] of Object.entries(tokens)) root.style.setProperty(key, value);
    for (const listener of this.listeners) listener();
  }
  private async refresh() {
    const revision = ++this.revision;
    try {
      const value = await this.remote.call("get", {});
      if (revision !== this.revision) return;
      Object.assign(this.state, value, { error: "", ready: true });
    } catch (error) {
      if (revision !== this.revision) return;
      Object.assign(this.state, { error: String(error), ready: true });
    }
    this.changed();
  }
  private async save(patch: AppearanceUpdate) {
    if (this.state.pending) return false;
    this.state.pending = true;
    this.state.error = "";
    this.changed();
    try {
      const value: AppearanceConfig = await this.remote.call("set", patch);
      this.revision++;
      Object.assign(this.state, value);
      if (patch.colorTheme) this.preview = null;
      return true;
    } catch (error) {
      this.state.error = "主题保存失败：" + String(error);
      return false;
    } finally {
      this.state.pending = false;
      this.changed();
    }
  }
}
