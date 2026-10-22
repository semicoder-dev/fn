#!/usr/bin/env python3
"""Verify actual TestFlight archive metadata before export/upload; no signing secrets printed."""
import pathlib
import plistlib
import subprocess
import sys

archive = pathlib.Path(sys.argv[1])
apps = list((archive / 'Products' / 'Applications').glob('*.app'))
assert len(apps) == 1, 'Expected one iOS application'
app = apps[0]
info = plistlib.loads((app / 'Info.plist').read_bytes())
expected = {
    'CFBundleIdentifier': 'com.semicoder.fn.ios',
    'FNCloudKitContainer': 'iCloud.com.semicoder.fn.production',
    'FNCommunicationEnvironment': 'production',
    'ITSAppUsesNonExemptEncryption': False,
}
for key, value in expected.items():
    assert info.get(key) == value, f'Unexpected or missing {key}: {info.get(key)!r}'
assert info.get('CFBundleIcons', {}).get('CFBundlePrimaryIcon'), 'Missing AppIcon'
entitlements = plistlib.loads(subprocess.check_output(['codesign', '-d', '--entitlements', ':-', str(app)], stderr=subprocess.DEVNULL))
assert entitlements.get('com.apple.developer.icloud-container-environment') == 'Production'
assert entitlements.get('com.apple.developer.icloud-container-identifiers') == ['iCloud.com.semicoder.fn.production']
print(f"Verified {info['CFBundleIdentifier']} {info['CFBundleShortVersionString']} ({info['CFBundleVersion']}) production archive")
