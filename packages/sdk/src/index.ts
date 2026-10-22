/** Optional npm metadata. Plugin instances and configuration belong to profiles. */
export interface PluginMetadata {
  name?: string;
  description?: string;
  icon?: string;
  iconSvg?: "dist/icon.svg";
  clientSource?: string;
  /** Relative JSON composition, resolved by the installer using upstream patches. */
  bundle?: string;
  profile?: string;
}
export type { Context, Service, Plugin } from "@deepseek-ai/cordis";
export type { PropsRenderSlots, SlotMap, SlotEntryDef } from "@deepseek-ai/dsh-client-ui-slots";
