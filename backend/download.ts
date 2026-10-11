import { httpsURL } from "../shared/marketplace";

/** Bound redirects, duration and streamed bytes, including servers without Content-Length. */
export async function download(
  url: string,
  limit: number,
  signal: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<Uint8Array> {
  for (let redirects = 0; redirects <= 5; redirects++) {
    httpsURL.parse(url);
    const response = await fetcher(url, { signal, redirect: "manual" });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel();
      const location = response.headers.get("location");
      if (!location) throw new Error("下载重定向缺少地址");
      url = new URL(location, url).href;
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`下载失败：HTTP ${response.status}`);
    }
    if (Number(response.headers.get("content-length")) > limit) {
      await response.body?.cancel();
      throw new Error("下载内容超过大小上限");
    }
    if (!response.body) throw new Error("下载内容为空");
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      for (;;) {
        signal.throwIfAborted();
        const { value, done } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > limit) throw new Error("下载内容超过大小上限");
        chunks.push(value);
      }
    } finally {
      await reader.cancel().catch(() => {});
    }
    return new Uint8Array(Buffer.concat(chunks));
  }
  throw new Error("下载重定向次数过多");
}
