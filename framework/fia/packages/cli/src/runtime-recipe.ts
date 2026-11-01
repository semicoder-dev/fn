/** Fixed signing behavior belongs to compatibility inputs, unlike timestamps. */
export const bunEntitlements =
  '<?xml version="1.0"?><plist version="1.0"><dict><key>com.apple.security.cs.allow-jit</key><true/><key>com.apple.security.cs.allow-unsigned-executable-memory</key><true/></dict></plist>';
export const hardenedRuntimeArguments = ["--options", "runtime"];
