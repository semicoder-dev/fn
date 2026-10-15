/** Network contracts owned by fn. No backend or agent-webtool runtime imports. */
export type WebEngine = "baidu" | "wechat" | "toutiao" | "duckduckgo";
export interface WebSearchInput {
  query: string;
  engines?: WebEngine[];
  limit?: number;
  timeRange?: "day" | "week" | "month" | "year";
  site?: string;
  timeoutMs?: number;
}
export interface WebFetchInput {
  url: string;
  format?: "markdown" | "text" | "html";
  maxBytes?: number;
  timeoutMs?: number;
}
export interface WebSource {
  id: number;
  title: string;
  url: string;
  snippet: string;
  score: number;
  engines: WebEngine[];
  meta: Record<string, string>;
  fetched: boolean;
}
export interface WebSearchResult {
  text: string;
  results: WebSource[];
  engines: {
    engine: WebEngine;
    status: "success" | "no_results" | "invalid_results" | "error";
    ok: boolean;
    count: number;
    rawCount: number;
    error?: string;
  }[];
}
export interface WebFetchResult {
  url: string;
  finalUrl: string;
  status: number;
  contentType: string;
  title: string;
  format: "markdown" | "text" | "html";
  text: string;
  truncated: boolean;
  redirect?: { from: string; to: string; status: number };
}
export interface WebOptions {
  signal?: AbortSignal;
}
export interface WebClient {
  search(input: WebSearchInput, options?: WebOptions): Promise<WebSearchResult>;
  fetch(input: WebFetchInput, options?: WebOptions): Promise<WebFetchResult>;
}
export interface WebTask {
  id: string;
  pluginId: string;
  kind: "search" | "fetch";
  status: "running" | "completed" | "failed" | "cancelled";
  result: WebSearchResult | WebFetchResult | null;
  error: { code: string; message: string } | null;
  createdAt: number;
  updatedAt: number;
}
