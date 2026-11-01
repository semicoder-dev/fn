/** Retry registry installation only; callers must not retry builds or publication. */
export async function retryRegistryInstall(
  install: (attempt: number) => Promise<boolean>,
  wait: () => Promise<unknown> = () => Bun.sleep(5000),
  attempts = 12,
) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (await install(attempt)) return;
    if (attempt + 1 < attempts) await wait();
  }
  throw new Error(
    "Public SDK/UI independent installation failed after bounded retries",
  );
}
