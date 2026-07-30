import type { MiniActionActorId, MiniActionDebugOverride, MiniActionOutcome } from "./miniActionKitContext.types"
import type { Vector2 } from "../../kits/shared/miniActionPhysics"

/**
 * A `VITE_E2E`-gated debug surface for deterministic Playwright runs (Phase 6.4): a seed for the
 * opponent AI's wobble, a shortened round length, forcing a specific outcome, and pinning an
 * actor's position. Installed on `window` only when `import.meta.env.VITE_E2E === "true"`, so a
 * production build never exposes it — there is no always-on debug API shipped to real players.
 */
export type MiniActionE2EApi = {
  setSeed(seed: number): void
  setTimerOverrideSec(seconds: number): void
  forceResult(outcome: MiniActionOutcome): void
  setActorPosition(actorId: MiniActionActorId, position: Vector2): void
  clearActorPosition(actorId: MiniActionActorId): void
  reset(): void
}

declare global {
  interface Window {
    __miniActionE2E?: MiniActionE2EApi
  }
}

export function isMiniActionE2EEnabled(): boolean {
  return import.meta.env.VITE_E2E === "true"
}

let currentOverride: MiniActionDebugOverride = {}

function installMiniActionE2EApi(): void {
  const api: MiniActionE2EApi = {
    setSeed(seed) {
      currentOverride = { ...currentOverride, seed }
    },
    setTimerOverrideSec(seconds) {
      currentOverride = { ...currentOverride, timerOverrideSec: seconds }
    },
    forceResult(outcome) {
      currentOverride = { ...currentOverride, forceResult: outcome }
    },
    setActorPosition(actorId, position) {
      currentOverride = {
        ...currentOverride,
        actorPositionOverride: { ...currentOverride.actorPositionOverride, [actorId]: position },
      }
    },
    clearActorPosition(actorId) {
      const nextPositions = { ...currentOverride.actorPositionOverride }
      delete nextPositions[actorId]
      currentOverride = { ...currentOverride, actorPositionOverride: nextPositions }
    },
    reset() {
      currentOverride = {}
    },
  }
  window.__miniActionE2E = api
}

if (isMiniActionE2EEnabled() && typeof window !== "undefined") {
  installMiniActionE2EApi()
}

/** Returns `undefined` outside `VITE_E2E=true` mode, so gameplay Kits never branch on test state in production. */
export function getMiniActionDebugOverride(): MiniActionDebugOverride | undefined {
  return isMiniActionE2EEnabled() ? currentOverride : undefined
}

/**
 * Clears a forced result once `rule.ringOut.v1` has reported it, so `forceResult` applies to
 * exactly one round instead of silently re-forcing the same outcome on every Replay — unlike
 * `seed`/`timerOverrideSec`/`actorPositionOverride`, which a test author would reasonably expect
 * to persist across rounds in the same run.
 */
export function clearMiniActionForcedResult(): void {
  currentOverride = { ...currentOverride, forceResult: undefined }
}
