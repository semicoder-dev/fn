import { defineConfig } from "@semicoder/fia/config";
import release from "./release/config.json";
import pkg from "./package.json";
const beta = process.env.FN_TESTFLIGHT_COMPANION === "1";
const identity = process.env.FN_SIGNING_IDENTITY;
const betaEntitlements = process.env.FN_BETA_ENTITLEMENTS;
const betaProfile = process.env.FN_BETA_PROFILE;
if (beta && (!identity || !betaEntitlements || !betaProfile))
  throw new Error(
    "Fn Beta 需要独立 Developer ID 签名、entitlements 和 profile",
  );
const productionEntitlements = process.env.FN_CLOUDKIT_PRODUCTION_ENTITLEMENTS;
const productionProfile = process.env.FN_CLOUDKIT_PRODUCTION_PROFILE;
if (Boolean(productionEntitlements) !== Boolean(productionProfile))
  throw new Error("CloudKit 正式签名需要同时配置 entitlements 和 profile");
const cloudIdentity = process.env.FN_CLOUDKIT_DEVELOPMENT_IDENTITY;
const cloudEntitlements = process.env.FN_CLOUDKIT_DEVELOPMENT_ENTITLEMENTS;
const cloudProfile = process.env.FN_CLOUDKIT_DEVELOPMENT_PROFILE;
if (
  [cloudIdentity, cloudEntitlements, cloudProfile].some(Boolean) &&
  ![cloudIdentity, cloudEntitlements, cloudProfile].every(Boolean)
)
  throw new Error(
    "CloudKit 开发签名需要同时配置 identity、entitlements 和 profile",
  );
export default defineConfig({
  app: {
    name: beta ? "Fn Beta" : "Fn",
    identifier: beta ? "com.semicoder.fn.beta" : "com.semicoder.fn",
    version: pkg.version,
    build: release.build,
    icon: "assets/icon.icns",
  },
  agent: {
    command: beta ? "fn-beta" : "fn",
    description: "Manage Fn applications, models and messages.",
    instructions: "agent/instructions.md",
    commands: {
      plugin: {
        description: "Create, build and debug Fn applications",
        entry: "commands/plugin.ts",
      },
    },
  },
  backend: {
    entry: "host/backend.ts",
    startupTimeoutMs: 15_000,
    assets: ["resources/app-runner.js"],
  },
  runtime: { assets: [] },
  api: { entry: "host/api.ts" },
  statusItem: { symbol: "square.stack.3d.up", tooltip: "Fn" },
  ...(beta || process.env.FN_DISABLE_UPDATES === "1"
    ? {}
    : {
        updates: {
          url: release.updatesURL,
          publicKey: release.publicKey,
          downloadURL: release.downloadURL,
        },
      }),
  ...(identity || cloudIdentity
    ? {
        signing: {
          ...(identity
            ? { releaseIdentity: identity, notarizationProfile: "fn-notary" }
            : {}),
          application:
            beta || productionProfile || cloudIdentity
              ? {
                  ...(beta
                    ? {
                        production: {
                          entitlements: betaEntitlements!,
                          provisioningProfile: betaProfile!,
                          cloudKitContainers: [
                            "iCloud.com.semicoder.fn.production",
                          ],
                        },
                      }
                    : productionProfile
                      ? {
                          production: {
                            entitlements: productionEntitlements!,
                            provisioningProfile: productionProfile,
                            cloudKitContainers: [
                              "iCloud.com.semicoder.fn.production",
                            ],
                          },
                        }
                      : {}),
                  ...(cloudIdentity && !beta
                    ? {
                        development: {
                          entitlements: cloudEntitlements!,
                          provisioningProfile: cloudProfile!,
                          cloudKitContainers: [
                            "iCloud.com.semicoder.fn.development",
                          ],
                        },
                      }
                    : {}),
                }
              : undefined,
          ...(cloudIdentity && !beta
            ? { developmentIdentity: cloudIdentity }
            : {}),
        },
      }
    : {}),
});
