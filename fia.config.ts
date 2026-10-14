import { defineConfig } from "@semicoder/fia/config";
import release from "./release/config.json";
import pkg from "./package.json";
const identity = process.env.FN_SIGNING_IDENTITY;
export default defineConfig({
  app: {
    name: "fn",
    identifier: "com.semicoder.fn",
    version: pkg.version,
    build: release.build,
    icon: "assets/icon.icns",
  },
  agent: {
    command: "fn",
    description:
      "Manage fn plugins and models, invoke plugin methods, and follow model runs.",
    instructions: "agent/instructions.md",
    commands: {
      plugin: {
        description: "Create, check, build and pack SDK 0.3 plugins",
        entry: "commands/plugin.ts",
      },
    },
  },
  backend: {
    assets: [
      "resources/sdk",
    ],
  },
  statusItem: { symbol: "square.stack.3d.up", tooltip: "fn" },
  ...(process.env.FN_DISABLE_UPDATES === "1"
    ? {}
    : {
        updates: {
          url: release.updatesURL,
          publicKey: release.publicKey,
          downloadURL: release.downloadURL,
        },
      }),
  ...(identity
    ? { signing: { releaseIdentity: identity, notarizationProfile: "fn-notary" } }
    : {}),
});
