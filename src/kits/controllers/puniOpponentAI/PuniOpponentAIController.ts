import { createKitContext } from "../../shared/KitContext"
import type { KitDefinition } from "../../shared/KitDefinition"
import type { KitLifecycleHooks } from "../../shared/KitLifecycle"
import type { RuntimeKitAdapter } from "../../../runtime/phaser/runtimeKit.types"
import type { MiniActionGameKitContext } from "../../../runtime/scenes/miniActionKitContext.types"
import { getTuningNumber } from "../../../runtime/scenes/miniActionTuning"
import { computeChaseSteering, type Vector2 } from "../../shared/miniActionPhysics"

const KIT_ID = "controller.puniOpponentAI.v1"

export type PuniOpponentAIControllerTunables = {
  reactionDelayMs: number
  aggression: number
  edgeAvoidance: number
  maxSpeed: number
}

export const puniOpponentAIControllerDefaults: PuniOpponentAIControllerTunables = {
  reactionDelayMs: 220,
  aggression: 0.6,
  edgeAvoidance: 0.7,
  maxSpeed: 170,
}

export function createPuniOpponentAIControllerKitDefinition(): KitDefinition<PuniOpponentAIControllerTunables> {
  const context = createKitContext(KIT_ID, "runtime-ready")
  const lifecycle: KitLifecycleHooks = {
    onCreate: () => undefined,
    onMount: () => undefined,
    onUpdate: () => undefined,
    onDispose: () => undefined,
  }

  return {
    kitId: KIT_ID,
    name: "Puni Opponent AI Controller",
    context,
    phase: context.phase,
    defaults: puniOpponentAIControllerDefaults,
    lifecycle,
  }
}

const WOBBLE_INTERVAL_MS = 900
const WOBBLE_STRENGTH = 0.18

/** Deterministic, seedable PRNG (mulberry32) so `VITE_E2E` runs can fix the AI's wobble pattern. */
function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Simple chase-with-edge-avoidance AI: not a learning agent, just steering toward a periodically
 * resampled ("reaction delay") snapshot of the player's position, biased toward the arena center
 * near the ring edge, with a small periodic wobble so it neither tracks perfectly nor freezes.
 */
export function createPuniOpponentAIControllerRuntimeAdapter(context: MiniActionGameKitContext): RuntimeKitAdapter {
  let perceivedPlayerPosition: Vector2 | undefined
  let lastPerceivedAt = 0
  let wobbleAngle = 0
  let lastWobbleAt = 0
  let random: () => number = Math.random

  return {
    kitId: KIT_ID,
    onCreate: () => {
      const seed = context.getDebugOverride()?.seed
      if (seed !== undefined) {
        random = createSeededRandom(seed)
      }
    },
    onUpdate: () => {
      const opponent = context.getActor("opponent")
      if (context.isPaused()) {
        opponent.setVelocity(0, 0)
        return
      }

      const arena = context.getArenaBounds()
      if (!arena) {
        return
      }

      const nowMs = context.getElapsedMs()
      const reactionDelayMs = getTuningNumber(
        context.tuning,
        "reactionDelayMs",
        puniOpponentAIControllerDefaults.reactionDelayMs,
      )
      if (!perceivedPlayerPosition || nowMs - lastPerceivedAt >= Math.max(reactionDelayMs, 16)) {
        perceivedPlayerPosition = context.getActor("player").getPosition()
        lastPerceivedAt = nowMs
      }

      if (nowMs - lastWobbleAt >= WOBBLE_INTERVAL_MS) {
        wobbleAngle += (random() - 0.5) * Math.PI
        lastWobbleAt = nowMs
      }

      const aggression = getTuningNumber(context.tuning, "aggression", puniOpponentAIControllerDefaults.aggression)
      const edgeAvoidance = getTuningNumber(
        context.tuning,
        "edgeAvoidance",
        puniOpponentAIControllerDefaults.edgeAvoidance,
      )
      const maxSpeed = getTuningNumber(context.tuning, "maxSpeed", puniOpponentAIControllerDefaults.maxSpeed)

      const steering = computeChaseSteering({
        self: opponent.getPosition(),
        target: perceivedPlayerPosition,
        arena,
        aggression,
        edgeAvoidance,
        wobbleAngle,
        wobbleStrength: WOBBLE_STRENGTH,
      })

      opponent.setVelocity(steering.x * maxSpeed, steering.y * maxSpeed)
    },
  }
}
