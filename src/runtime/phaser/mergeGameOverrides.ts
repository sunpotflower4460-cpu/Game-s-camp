export type OverrideLayer = Record<string, unknown> | undefined

/**
 * Applies the Forge override order: Kit defaults, then Recipe tuning, then allowed custom
 * overrides. Later layers win on key conflicts. Neither Recipe tuning nor custom overrides are
 * wired to a real source yet (Phase 6.1 and Phase 6.3 respectively) — this is the pure merge
 * function they will both call into.
 */
export function mergeGameOverrides(
  kitDefaults: Record<string, unknown>,
  recipeTuning?: OverrideLayer,
  customOverrides?: OverrideLayer,
): Record<string, unknown> {
  return {
    ...kitDefaults,
    ...(recipeTuning ?? {}),
    ...(customOverrides ?? {}),
  }
}
