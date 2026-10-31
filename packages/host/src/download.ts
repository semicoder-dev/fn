/** Public market downloads may redirect to a CDN; every hop obeys the URL policy. */
export async function download(
  value: string,
  validate: (url: string) => void,
  limit: number,
  timeout: number,
) {
  const signal = AbortSignal.timeout(timeout);
  let url = value;
  for (let redirects = 0; redirects <= 5; redirects++) {
    validate(url);
    const response = await fetch(url, { signal, redirect: "manual" });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel();
      const location = response.headers.get("location");
      if (!location) throw new Error("Download redirect has no location");
      url = new URL(location, url).href;
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error("HTTP " + response.status);
    }
    if (Number(response.headers.get("content-length")) > limit) {
      await response.body?.cancel();
      throw new Error("Download exceeds size limit");
    }
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (response.body)
      for await (const chunk of response.body) {
        size += chunk.length;
        if (size > limit) throw new Error("Download exceeds size limit");
        chunks.push(chunk);
      }
    return new Uint8Array(await new Blob(chunks as BlobPart[]).arrayBuffer());
  }
  throw new Error("Too many download redirects");
}
