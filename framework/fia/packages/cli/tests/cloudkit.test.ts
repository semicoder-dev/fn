import { expect, test } from "bun:test";
import {
  selectApplicationSigning,
  infoPlist,
  validateCloudKitEntitlements,
} from "../src/application.ts";
import { validateConfig } from "../src/project-config.ts";

const base = {
  app: { name: "Cloud Test", identifier: "test.cloud", version: "1.0.0", build: 1 },
  agent: { command: "cloud-test", description: "test" },
};
test("application signing never falls back across build environments", () => {
  const config = validateConfig(
    {
      ...base,
      signing: {
        application: {
          development: {
            entitlements: "dev.plist",
            provisioningProfile: "dev.provisionprofile",
            cloudKitContainers: ["iCloud.test.dev"],
          },
        },
      },
    },
    "/tmp",
  );
  expect(selectApplicationSigning(config, "development")?.entitlements).toBe("dev.plist");
  expect(() => selectApplicationSigning(config, "production")).toThrow("never inherited");
  expect(() => selectApplicationSigning(config, "preview")).toThrow("never inherited");
  expect(selectApplicationSigning(validateConfig(base, "/tmp"), "production")).toBeUndefined();
  expect(infoPlist(config, undefined, false, ["iCloud.test.dev"])).toContain(
    "<key>FIACloudKitContainers</key><string>iCloud.test.dev</string>",
  );
  expect(infoPlist(validateConfig(base, "/tmp"))).not.toContain("FIACloudKitContainers");
});
test("CloudKit cannot be configured without provisioning or with malformed container IDs", () => {
  for (const profile of [
    { entitlements: "dev.plist", cloudKitContainers: ["iCloud.test.dev"] },
    {
      entitlements: "dev.plist",
      provisioningProfile: "dev.profile",
      cloudKitContainers: ["iCloud.test.dev,other"],
    },
  ])
    expect(() =>
      validateConfig({ ...base, signing: { application: { development: profile } } }, "/tmp"),
    ).toThrow();
});

test("CloudKit signing rejects mismatched bundle identities and container allowlists", () => {
  const entitlements = {
    "com.apple.developer.icloud-container-identifiers": ["iCloud.test.dev"],
    "com.apple.developer.icloud-services": ["CloudKit"],
    "com.apple.application-identifier": "TEAM.test.cloud.dev",
    "com.apple.developer.icloud-container-environment": "Development",
  };
  expect(() =>
    validateCloudKitEntitlements(["iCloud.test.dev"], entitlements, "test.cloud.dev"),
  ).not.toThrow();
  expect(() =>
    validateCloudKitEntitlements(["iCloud.test.dev"], entitlements, "test.cloud"),
  ).toThrow();
  expect(() =>
    validateCloudKitEntitlements(["iCloud.test.production"], entitlements, "test.cloud.dev"),
  ).toThrow();
});
