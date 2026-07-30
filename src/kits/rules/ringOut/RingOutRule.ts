import { createKitContext } from "../../shared/KitContext"
import type { KitDefinition } from "../../shared/KitDefinition"
import type { KitLifecycleHooks } from "../../shared/KitLifecycle"
import type { RuntimeKitAdapter } from "../../../runtime/phaser/runtimeKit.types"
import type { MiniActionGameKitContext } from "../../../runtime/scenes/miniActionKitContext.types"
import { getTuningNumber } from "../../../runtime/scenes/miniActionTuning"
import { distanceFromCenter, isBeyondRingBounds, judgeTimeoutWinner } from "../../shared/miniActionPhysics"

const KIT_ID = "rule.ringOut.v1"

export type RingOutRuleTunables = {
  ringMargin: number
}

export const ringOutRuleDefaults: RingOutRuleTunables = {
  ringMargin: 0,
}

const DEFAULT_ROUND_TIME_SEC = 60
const DRAW_DISTANCE_THRESHOLD_PX = 12

export function createRingOutRuleKitDefinition(): KitDefinition<RingOutRuleTunables> {
  const context = createKitContext(KIT_ID, "runtime-ready")
  const lifecycle: KitLifecycleHooks = {
    onCreate: () => undefined,
    onMount: () => undefined,
    onUpdate: () => undefined,
    onDispose: () => undefined,
  }

  return {
    kitId: KIT_ID,
    name: "Ring Out Rule",
    context,
    phase: context.phase,
    defaults: ringOutRuleDefaults,
    lifecycle,
  }
}

/**
 * Owns the win/lose/draw decision for the round: immediate ring-out (either actor crosses the
 * ring boundary) and, failing that, timeout resolution (whoever is closer to the center wins,
 * or a draw if the gap is negligible). Reported through `context.reportOutcome`, which only
 * latches the first call, so ring-out settles exactly once.
 */
export function createRingOutRuleRuntimeAdapter(context: MiniActionGameKitContext): RuntimeKitAdapter {
  return {
    kitId: KIT_ID,
    onUpdate: () => {
      if (context.getOutcome()) {
        return
      }

      const forcedResult = context.getDebugOverride()?.forceResult
      if (forcedResult) {
        context.reportOutcome(forcedResult)
        context.clearDebugForcedResult()
        return
      }

      const arena = context.getArenaBounds()
      if (!arena) {
        return
      }

      const ringMargin = getTuningNumber(context.tuning, "ringMargin", ringOutRuleDefaults.ringMargin)
      const player = context.getActor("player")
      const opponent = context.getActor("opponent")
      const playerPosition = player.getPosition()
      const opponentPosition = opponent.getPosition()
      const playerOut = isBeyondRingBounds(playerPosition, arena, ringMargin)
      const opponentOut = isBeyondRingBounds(opponentPosition, arena, ringMargin)

      if (playerOut && opponentOut) {
        context.reportOutcome({ result: "draw", reason: "Both Punis fell out of the ring at once." })
        return
      }
      if (playerOut) {
        context.reportOutcome({ result: "lose", reason: "You were pushed out of the ring." })
        return
      }
      if (opponentOut) {
        context.reportOutcome({ result: "win", reason: "You pushed the opponent out of the ring." })
        return
      }

      const roundTimeSec = getTuningNumber(context.tuning, "roundTimeSec", DEFAULT_ROUND_TIME_SEC)
      const timerOverrideSec = context.getDebugOverride()?.timerOverrideSec
      const effectiveRoundTimeSec = timerOverrideSec ?? roundTimeSec
      if (context.getElapsedMs() < effectiveRoundTimeSec * 1000) {
        return
      }

      const playerDistance = distanceFromCenter(playerPosition, arena.center)
      const opponentDistance = distanceFromCenter(opponentPosition, arena.center)
      const winner = judgeTimeoutWinner(
        { player: playerDistance, opponent: opponentDistance },
        DRAW_DISTANCE_THRESHOLD_PX,
      )

      if (winner === "draw") {
        context.reportOutcome({ result: "draw", reason: "Time's up — both Punis were equally close to the center." })
      } else if (winner === "player") {
        context.reportOutcome({ result: "win", reason: "Time's up — you stayed closer to the center." })
      } else {
        context.reportOutcome({ result: "lose", reason: "Time's up — the opponent stayed closer to the center." })
      }
    },
  }
}
