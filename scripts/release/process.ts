export async function command(
  args: string[],
  cwd = process.cwd(),
  env = process.env,
) {
  const child = Bun.spawn(args, { cwd, env, stdout: "pipe", stderr: "pipe" });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  if (code !== 0) throw new Error(`${args[0]} failed (${code}): ${stderr}`);
  return stdout.trim();
}
export const github = (...args: string[]) => command(["gh", ...args]);
