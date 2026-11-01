/** Changing these compiler inputs requires a newly verified runtime distribution. */
export const nativeBuildArguments = [
  "swift",
  "build",
  "--disable-sandbox",
  "-c",
  "release",
  "--product",
  "FIAHost",
];
