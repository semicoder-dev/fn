export const generationPhases = ["catalog", "download", "extract", "copy", "dependencies", "verify", "preflight"] as const;
export type GenerationPhase = typeof generationPhases[number];
