import { createRequire } from "node:module";
import { readFile, realpath } from "node:fs/promises";
import { dirname, isAbsolute, join, relative } from "node:path";
import { createHash } from "node:crypto";
import { profileEntries } from "./profile.ts";
import type { Profile } from "./index.ts";
import type { WebBootGraph } from "@deepseek-ai/dsh-client-modules/client";
export interface ClientBoot {
  namespaces?: string[];
  epoch: string;
  generationId: string;
  profile: Profile["client"];
  boot: WebBootGraph;
  bootstrap: string;
}
/** Transports original module factories over FIA; it does not implement a module or slot engine. */
export async function clientAssets(
  directory: string,
  generationId: string,
  epoch: string,
  profile: Profile,
) {
  const require = createRequire(join(directory, "package.json"));
  const modulesId = "@deepseek-ai/dsh-client-modules";
  const names = [
    ...new Set([
      modulesId,
      ...[...profileEntries(profile.client)]
        .filter((entry) => !entry.disabled && !entry.name.startsWith("cordis:"))
        .map((entry) => entry.name.replace(/\/client$/, "")),
    ]),
  ];
  const files = new Map<string, string>();
  const entries = await Promise.all(
    names.map(async (id) => {
      const filename = await realpath(
        require.resolve(id.endsWith("/client") ? id : `${id}/client`),
      );
      const rev = createHash("sha256")
        .update(await readFile(filename))
        .digest("hex");
      const key = createHash("sha256").update(id).digest("hex").slice(0, 24);
      const url = `/api/plugin-assets/${generationId}/${key}/client.js?rev=${rev}`;
      files.set(key, filename);
      return { id, url, rev, immediately: true };
    }),
  );
  const boot: WebBootGraph = {
    rev: generationId,
    entries,
    batches: entries.map((entry) => ({
      phase: entry.id === modulesId ? "bootstrap" : "application",
      url: entry.url,
      rev: entry.rev,
      entries: [entry.id],
    })),
  };
  return {
    payload: {
      epoch,
      generationId,
      profile: profile.client,
      boot,
      bootstrap: entries.find((entry) => entry.id === modulesId)!.url,
    } satisfies ClientBoot,
    async fetch(request: Request) {
      const match = new URL(request.url).pathname.match(
        /^\/plugin-assets\/([^/]+)\/([^/]+)\/(.+)$/,
      );
      if (!match || match[1] !== generationId) return new Response("Not found", { status: 404 });
      const entry = files.get(match[2]!);
      if (!entry) return new Response("Not found", { status: 404 });
      try {
        const root = await realpath(dirname(entry));
        const filename =
          match[3] === "client.js"
            ? entry
            : await realpath(join(root, decodeURIComponent(match[3]!)));
        const rel = relative(root, filename);
        if (isAbsolute(rel) || rel === ".." || rel.startsWith("../"))
          return new Response("Forbidden", { status: 403 });
        return new Response(Bun.file(filename), {
          headers: {
            "Cache-Control": "private, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
          },
        });
      } catch {
        return new Response("Not found", { status: 404 });
      }
    },
  };
}
