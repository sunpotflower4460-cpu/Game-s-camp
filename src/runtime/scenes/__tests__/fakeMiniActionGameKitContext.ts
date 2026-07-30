import type {
  MiniActionActorHandle,
  MiniActionActorId,
  MiniActionArenaBounds,
  MiniActionDebugOverride,
  MiniActionGameKitContext,
  MiniActionOutcome,
} from "../miniActionKitContext.types"
import type { Vector2 } from "../../../kits/shared/miniActionPhysics"

/**
 * A lightweight, scene-free stand-in for `MiniActionGameKitContext`, for unit-testing Kits that
 * only touch actors/arena/tuning/elapsed time/outcome — not `context.scene` directly (that subset
 * of Kits — `controller.puniPush.v1`, `stage.circularArenaForest.v1`, `camera.isometricSoft.v1`,
 * `ui.roundTimer.v1`, `ui.resultScreen.v1` — needs a real, booted Phaser Scene to test
 * meaningfully, which this project defers to manual browser verification and Phase 6.4
 * Playwright automation, matching how Phase 6.0/6.1 treated other Phaser-boot-dependent checks).
 */
export type FakeMiniActionGameKitContext = {
  context: MiniActionGameKitContext
  setActorPosition: (id: MiniActionActorId, position: Vector2) => void
  getActorVelocity: (id: MiniActionActorId) => Vector2
  setArenaBounds: (bounds: MiniActionArenaBounds) => void
  setElapsedMs: (ms: number) => void
  setPaused: (paused: boolean) => void
  setDebugOverride: (override: MiniActionDebugOverride | undefined) => void
  getDebugOverride: () => MiniActionDebugOverride | undefined
  getOutcome: () => MiniActionOutcome | undefined
}

export function createFakeMiniActionGameKitContext(
  tuning: Record<string, string | number | boolean> = {},
): FakeMiniActionGameKitContext {
  const positions: Record<MiniActionActorId, Vector2> = {
    player: { x: 0, y: 0 },
    opponent: { x: 0, y: 0 },
  }
  const velocities: Record<MiniActionActorId, Vector2> = {
    player: { x: 0, y: 0 },
    opponent: { x: 0, y: 0 },
  }
  let arenaBounds: MiniActionArenaBounds | undefined
  let elapsedMs = 0
  let paused = false
  let debugOverride: MiniActionDebugOverride | undefined
  let outcome: MiniActionOutcome | undefined

  function makeActorHandle(id: MiniActionActorId): MiniActionActorHandle {
    return {
      id,
      gameObject: {} as never,
      body: {} as never,
      getPosition: () => ({ ...positions[id] }),
      getVelocity: () => ({ ...velocities[id] }),
      setVelocity: (x, y) => {
        velocities[id] = { x, y }
      },
    }
  }

  const context: MiniActionGameKitContext = {
    scene: {} as never,
    tuning,
    isTestMode: true,
    getActor: (id) => makeActorHandle(id),
    setArenaBounds: (bounds) => {
      arenaBounds = bounds
    },
    getArenaBounds: () => arenaBounds,
    getElapsedMs: () => elapsedMs,
    isPaused: () => paused,
    reportOutcome: (nextOutcome) => {
      if (!outcome) {
        outcome = nextOutcome
      }
    },
    getOutcome: () => outcome,
    getDebugOverride: () => debugOverride,
    clearDebugForcedResult: () => {
      if (debugOverride) {
        debugOverride = { ...debugOverride, forceResult: undefined }
      }
    },
  }

  return {
    context,
    setActorPosition: (id, position) => {
      positions[id] = position
    },
    getActorVelocity: (id) => velocities[id],
    setArenaBounds: (bounds) => {
      arenaBounds = bounds
    },
    setElapsedMs: (ms) => {
      elapsedMs = ms
    },
    setPaused: (value) => {
      paused = value
    },
    setDebugOverride: (value) => {
      debugOverride = value
    },
    getDebugOverride: () => debugOverride,
    getOutcome: () => outcome,
  }
}
