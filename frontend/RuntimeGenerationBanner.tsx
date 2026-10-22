import type { GenerationPhase } from "../packages/runtime/src/generation-progress";

const labels: Record<GenerationPhase, string> = {
  catalog: "正在检查应用市场…",
  download: "正在获取应用安装包…",
  extract: "正在解包并校验应用…",
  copy: "正在准备应用版本…",
  dependencies: "正在准备应用依赖…",
  verify: "正在校验共享依赖…",
  preflight: "正在检查应用能否启动…",
};

export default function RuntimeGenerationBanner({ generation, retry }: {
  generation?: { pending: boolean; installing: boolean; phase: GenerationPhase | null; error: string | null };
  retry: () => void;
}) {
  if (!generation || (!generation.pending && !generation.installing && !generation.error)) return null;
  return <div className="runtime-banner" role="status" aria-live="polite">
    {generation.error || (generation.installing
      ? labels[generation.phase ?? "copy"]
      : "更新已准备好，等待后台任务空闲后重启。")}
    {generation.error && <button onClick={retry}>重试切换</button>}
  </div>;
}
