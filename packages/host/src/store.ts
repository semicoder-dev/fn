import { mkdir, rename, rm, realpath, open } from "node:fs/promises";
import { resolve, dirname, relative, sep } from "node:path";
import {
  manifestSchema,
  relativePath,
  type BuiltApplication,
} from "@semicoder/fn-sdk/manifest";
import {
  parseSummary,
  type ApplicationSummary,
  type SummaryState,
} from "@semicoder/fn-sdk/summary";
import type { Preferences } from "@semicoder/fn-sdk/types";
export async function atomicJSON(
  path: string,
  value: unknown,
  beforeCommit?: () => void,
) {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = path + "." + crypto.randomUUID() + ".tmp";
  try {
    const file = await open(temporary, "wx", 0o600);
    try {
      await file.writeFile(JSON.stringify(value));
      await file.sync();
    } finally {
      await file.close();
    }
    beforeCommit?.();
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
}
export async function inside(root: string, path: string) {
  relativePath.parse(path);
  const target = await realpath(resolve(root, path));
  const rel = relative(await realpath(root), target);
  if (rel === ".." || rel.startsWith(".." + sep))
    throw new Error("Path outside application package");
  return target;
}
export interface Installation {
  instanceId: string;
  directory: string;
  build: BuiltApplication;
  source?: { url: string; sha256: string; marketId?: string };
  development?: boolean;
}
interface Document {
  preferences: Preferences;
  installations: Installation[];
  hostId: string;
  markets: { id: string; name: string; url: string }[];
  notifications?: {
    id: string;
    instanceId?: string;
    text: string;
    createdAt: number;
  }[];
}
export class PlatformStore {
  document: Document;
  #writes = Promise.resolve();
  #summaryWrites = new Map<string, Promise<void>>();
  constructor(
    readonly root: string,
    document?: Document,
  ) {
    this.document = document ?? {
      hostId: crypto.randomUUID(),
      preferences: { locale: "zh-CN", theme: "system", desktop: [], menu: [] },
      installations: [],
      markets: [
        {
          id: "official",
          name: "Fn",
          url: "https://semicoder-dev.github.io/fn-plugins/applications.json",
        },
      ],
    };
  }
  static async open(root: string) {
    await mkdir(root, { recursive: true, mode: 0o700 });
    const file = Bun.file(resolve(root, "platform.json"));
    return new PlatformStore(
      root,
      (await file.exists()) ? await file.json() : undefined,
    );
  }
  save() {
    const value = structuredClone(this.document);
    const write = this.#writes
      .catch(() => {})
      .then(() => atomicJSON(resolve(this.root, "platform.json"), value));
    this.#writes = write;
    return write;
  }
  async inspect(directory: string): Promise<BuiltApplication> {
    const raw = await Bun.file(await inside(directory, "fn-build.json")).json();
    if (raw.format !== 1) throw new Error("Unsupported application package");
    const manifest = manifestSchema.parse(raw.manifest);
    const source = manifestSchema.parse(
      await Bun.file(await inside(directory, "fn.app.json")).json(),
    );
    if (JSON.stringify(source) !== JSON.stringify(manifest))
      throw new Error("Manifest does not match build");
    if (
      Boolean(raw.backend) !== Boolean(manifest.entries.backend) ||
      Boolean(raw.page) !== Boolean(manifest.entries.page)
    )
      throw new Error("Missing application entry");
    if (raw.backend) await inside(directory, raw.backend);
    if (raw.page) await inside(directory, raw.page);
    if (manifest.icon) await inside(directory, manifest.icon);
    for (const path of Object.values(manifest.locales.messages)) {
      const messages = await Bun.file(await inside(directory, path)).json();
      if (
        !messages ||
        typeof messages !== "object" ||
        Object.values(messages).some((v) => typeof v !== "string")
      )
        throw new Error("Invalid application locale");
    }
    if (manifest.contributes.summary?.initial)
      parseSummary(
        await Bun.file(
          await inside(directory, manifest.contributes.summary.initial),
        ).json(),
      );
    return { format: 1, manifest, backend: raw.backend, page: raw.page };
  }
  async install(
    bytes: Uint8Array,
    expected?: {
      id?: string;
      version?: string;
      sha256?: string;
      url?: string;
      marketId?: string;
    },
    beforeRegister?: (installation: Installation) => void | Promise<void>,
  ): Promise<Installation> {
    if (bytes.byteLength > 64 * 1024 * 1024)
      throw new Error("Application archive too large");
    const hash = new Bun.CryptoHasher("sha256").update(bytes).digest("hex");
    if (expected?.sha256 && hash !== expected.sha256)
      throw new Error("Application archive digest mismatch");
    let tar = bytes;
    if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
      const stream = new Blob([bytes as Uint8Array<ArrayBuffer>])
        .stream()
        .pipeThrough(new DecompressionStream("gzip"));
      const parts: Uint8Array[] = [];
      let size = 0;
      for await (const chunk of stream) {
        size += chunk.length;
        if (size > 128 * 1024 * 1024)
          throw new Error("Expanded application archive too large");
        parts.push(chunk);
      }
      tar = new Uint8Array(await new Blob(parts as BlobPart[]).arrayBuffer());
    }
    const files = await new Bun.Archive(tar).files();
    if (files.size > 10000) throw new Error("Too many application files");
    const staging = resolve(this.root, "staging", crypto.randomUUID());
    await mkdir(staging, { recursive: true });
    try {
      for (const [name, file] of files) {
        relativePath.parse(name);
        await Bun.write(resolve(staging, name), file, { mode: 0o600 });
      }
      const build = await this.inspect(staging);
      if (expected?.id && build.manifest.id !== expected.id)
        throw new Error("Application identity mismatch");
      if (expected?.version && build.manifest.version !== expected.version)
        throw new Error("Application version mismatch");
      const directory = resolve(
        this.root,
        "applications",
        build.manifest.id,
        build.manifest.version + "-" + hash.slice(0, 16),
      );
      await mkdir(dirname(directory), { recursive: true });
      if (!(await Bun.file(resolve(directory, "fn-build.json")).exists()))
        await rename(staging, directory);
      const installation: Installation = {
        instanceId: build.manifest.id,
        directory,
        build,
        ...(expected?.url
          ? {
              source: {
                url: expected.url,
                sha256: hash,
                marketId: expected.marketId,
              },
            }
          : {}),
      };
      await beforeRegister?.(installation);
      await this.register(installation);
      return installation;
    } finally {
      await rm(staging, { recursive: true, force: true });
    }
  }
  desktopOrder(order = this.document.preferences.desktop) {
    const ids = this.document.installations.map((i) => i.instanceId);
    return [...new Set([...order.filter((id) => ids.includes(id)), ...ids])];
  }
  private summaryPath(id: string) {
    const key = new Bun.CryptoHasher("sha256").update(id).digest("hex");
    return resolve(this.root, "summaries", key + ".json");
  }
  private queueSummary(id: string, action: () => Promise<void>) {
    const pending = (this.#summaryWrites.get(id) ?? Promise.resolve())
      .catch(() => {})
      .then(action);
    this.#summaryWrites.set(id, pending);
    void pending
      .finally(() => {
        if (this.#summaryWrites.get(id) === pending)
          this.#summaryWrites.delete(id);
      })
      .catch(() => {});
    return pending;
  }
  async summary(installation: Installation): Promise<SummaryState | undefined> {
    if (
      installation.build.manifest.hostApi !== 2 ||
      !installation.build.manifest.contributes.summary
    )
      return;
    try {
      const cached = await Bun.file(
        this.summaryPath(installation.instanceId),
      ).json();
      if (
        cached.installation === installation.directory &&
        cached.snapshot !== null &&
        Number.isFinite(cached.updatedAt)
      )
        return {
          snapshot: parseSummary(cached.snapshot),
          updatedAt: cached.updatedAt,
        };
    } catch {
      /* Missing or corrupt derived cache falls back to the installed initial summary. */
    }
    const initial = installation.build.manifest.contributes.summary.initial;
    if (initial) {
      try {
        return {
          snapshot: parseSummary(
            await Bun.file(
              await inside(installation.directory, initial),
            ).json(),
          ),
        };
      } catch {
        /* A broken initial summary must not prevent opening or managing the app. */
      }
    }
  }
  setSummary(
    installation: Installation,
    input: ApplicationSummary | null,
    assertCurrent: () => void,
  ) {
    const snapshot = input === null ? null : parseSummary(input);
    return this.queueSummary(installation.instanceId, async () => {
      assertCurrent();
      await atomicJSON(
        this.summaryPath(installation.instanceId),
        {
          installation: installation.directory,
          snapshot,
          updatedAt: Date.now(),
        },
        assertCurrent,
      );
    });
  }
  clearSummary(id: string) {
    return this.queueSummary(id, () =>
      rm(this.summaryPath(id), { force: true }),
    );
  }
  async register(value: Installation) {
    const index = this.document.installations.findIndex(
      (i) => i.instanceId === value.instanceId,
    );
    await this.clearSummary(value.instanceId);
    if (index < 0) {
      this.document.installations.push(value);
      this.document.preferences.menu.push(value.instanceId);
    } else this.document.installations[index] = value;
    this.document.preferences.desktop = this.desktopOrder();
    await this.save();
  }
  async locales(installation: Installation) {
    return Object.fromEntries(
      await Promise.all(
        Object.entries(installation.build.manifest.locales.messages).map(
          async ([locale, path]) => [
            locale,
            await Bun.file(await inside(installation.directory, path)).json(),
          ],
        ),
      ),
    );
  }
  async paths(instanceId: string) {
    const base = resolve(this.root, "data", instanceId);
    const paths = {
      data: base,
      cache: resolve(base, "cache"),
      logs: resolve(base, "logs"),
    };
    for (const path of Object.values(paths))
      await mkdir(path, { recursive: true, mode: 0o700 });
    return paths;
  }
}
