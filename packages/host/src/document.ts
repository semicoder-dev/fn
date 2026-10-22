import { mkdir, open, rename, unlink, readFile } from "node:fs/promises";
import { dirname } from "node:path";

/** Internal atomic file utility. Each plugin owns its schema and file; no public KV API. */
export class Document<T> {
  private queue: Promise<unknown> = Promise.resolve();
  private pending = 0;
  private closed = false;
  private constructor(
    readonly path: string,
    public value: T,
    private parse: (input: unknown) => T,
  ) {}
  static async open<T>(path: string, initial: T, parse: (input: unknown) => T) {
    let value = initial;
    try {
      value = parse(JSON.parse(await readFile(path, "utf8")));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    return new Document(path, value, parse);
  }
  busy() {
    return this.pending > 0;
  }
  update(change: (draft: T) => void | Promise<void>): Promise<void> {
    if (this.closed) throw new Error("Document is closed");
    this.pending++;
    const operation = this.queue
      .then(async () => {
        const draft = structuredClone(this.value);
        await change(draft);
        const next = this.parse(draft);
        await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
        const temporary = `${this.path}.${crypto.randomUUID()}.tmp`;
        try {
          const file = await open(temporary, "wx", 0o600);
          try {
            await file.writeFile(JSON.stringify(next));
            await file.sync();
          } finally {
            await file.close();
          }
          await rename(temporary, this.path);
          const directory = await open(dirname(this.path), "r");
          try {
            await directory.sync();
          } finally {
            await directory.close();
          }
          this.value = next;
        } finally {
          await unlink(temporary).catch((error) => {
            if (error.code !== "ENOENT") throw error;
          });
        }
      })
      .finally(() => {
        this.pending--;
      });
    this.queue = operation.catch(() => {});
    return operation;
  }
  async close() {
    this.closed = true;
    await this.queue;
  }
}
