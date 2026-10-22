import { constants, type Dirent } from "node:fs";
import { chmod, copyFile, lstat, mkdir, readdir, readlink, rm, symlink } from "node:fs/promises";
import { join } from "node:path";

/** Independent inodes, bounded I/O, and literal symlinks. Never hard-link generations. */
export async function copyGenerationDirectory(source: string, target: string): Promise<void> {
  const root = await lstat(source);
  if (!root.isDirectory()) throw new Error("Generation source must be a directory");
  // Refuse an existing destination; only clean up a directory we created.
  await mkdir(target, { mode: (root.mode & 0o777) | 0o700 });
  try {
    const modes = [{ path: target, mode: root.mode & 0o777 }];
    const jobs: { source: string; target: string; entry: Dirent }[] = [];
    const enqueue = async (from: string, to: string) => {
      for (const entry of await readdir(from, { withFileTypes: true }))
        jobs.push({ source: join(from, entry.name), target: join(to, entry.name), entry });
    };
    await enqueue(source, target);
    for (let offset = 0; offset < jobs.length;) {
      const batch = jobs.slice(offset, offset + 32);
      offset += batch.length;
      const results = await Promise.allSettled(batch.map(async job => {
        if (job.entry.isSymbolicLink()) {
          await symlink(await readlink(job.source), job.target);
        } else if (job.entry.isDirectory()) {
          const info = await lstat(job.source);
          await mkdir(job.target, { mode: (info.mode & 0o777) | 0o700 });
          modes.push({ path: job.target, mode: info.mode & 0o777 });
          await enqueue(job.source, job.target);
        } else if (job.entry.isFile()) {
          // FICLONE is best effort: unsupported filesystems use a regular copy.
          // EXCL prevents overwriting an unexpected destination or symlink.
          await copyFile(job.source, job.target, constants.COPYFILE_FICLONE | constants.COPYFILE_EXCL);
        } else throw new Error(`Unsupported generation file: ${job.source}`);
      }));
      // Drain every in-flight write before callers remove failed staging trees.
      const failed = results.find(result => result.status === "rejected");
      if (failed?.status === "rejected") throw failed.reason;
    }
    // Populate read-only source directories before restoring their permissions.
    for (const item of modes.reverse())
      if ((item.mode & 0o700) !== 0o700 || (item.mode & process.umask()) !== 0) await chmod(item.path, item.mode);
  } catch (error) {
    await rm(target, { recursive: true, force: true });
    throw error;
  }
}
