"""Validate actual built native chat bundles before installing or archiving."""
import pathlib
import plistlib
import sys

identities = {
    "com.semicoder.fn.ios.dev": "development",
    "com.semicoder.fn.chat.dev": "development",
    "com.semicoder.fn.ios": "production",
}
for argument in sys.argv[1:]:
    bundle = pathlib.Path(argument)
    info = bundle / ("Contents/Info.plist" if (bundle / "Contents").exists() else "Info.plist")
    with info.open("rb") as stream:
        values = plistlib.load(stream)
    environment = identities[values["CFBundleIdentifier"]]
    assert values.get("FNCommunicationEnvironment") == environment, "Missing/wrong chat environment"
    assert values.get("FNCloudKitContainer") == "iCloud.com.semicoder.fn." + environment, "Missing/wrong CloudKit container"
    assert any(bundle.rglob("session-contracts.json")), "Missing Chat v3 protocol validation resource"
    print(f"Verified {bundle.name}: {environment} chat configuration and protocol resource")
if len(sys.argv) < 2:
    raise SystemExit("Usage: python3 clients/apple/verify-build.py <built.app> [...]")
