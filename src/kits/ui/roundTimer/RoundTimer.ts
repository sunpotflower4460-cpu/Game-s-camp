import { createKitContext } from "../../shared/KitContext"
import type { KitDefinition } from "../../shared/KitDefinition"
import type { KitLifecycleHooks } from "../../shared/KitLifecycle"
import type Phaser from "phaser"
import type { RuntimeKitAdapter } from "../../../runtime/phaser/runtimeKit.types"
import type { MiniActionGameKitContext } from "../../../runtime/scenes/miniActionKitContext.types"
import { getTuningNumber } from "../../../runtime/scenes/miniActionTuning"

const KIT_ID = "ui.roundTimer.v1"

export type RoundTimerTunables = {
  roundTimeSec: number
}

export const roundTimerDefaults: RoundTimerTunables = {
  roundTimeSec: 60,
}

export function createRoundTimerKitDefinition(): KitDefinition<RoundTimerTunables> {
  const context = createKitContext(KIT_ID, "runtime-ready")
  const lifecycle: KitLifecycleHooks = {
    onCreate: () => undefined,
    onMount: () => undefined,
    onUpdate: () => undefined,
    onDispose: () => undefined,
  }

  return {
    kitId: KIT_ID,
    name: "Round Timer UI",
    context,
    phase: context.phase,
    defaults: roundTimerDefaults,
    lifecycle,
  }
}

function formatSeconds(remainingSec: number): string {
  return Math.ceil(remainingSec).toString().padStart(2, "0")
}

/**
 * Displays the remaining round time. Reads `context.getElapsedMs()`, which the Scene itself
 * freezes during countdown, pause, and once an outcome settles, so this Kit never needs to
 * duplicate that pause logic to stop ticking.
 */
export function createRoundTimerRuntimeAdapter(context: MiniActionGameKitContext): RuntimeKitAdapter {
  let text: Phaser.GameObjects.Text | undefined

  return {
    kitId: KIT_ID,
    onCreate: () => {
      const roundTimeSec = getTuningNumber(context.tuning, "roundTimeSec", roundTimerDefaults.roundTimeSec)
      text = context.scene.add
        .text(context.scene.scale.width / 2, 48, formatSeconds(roundTimeSec), {
          fontFamily: "sans-serif",
          fontSize: "28px",
          color: "#f4ead1",
        })
        .setOrigin(0.5)
        .setDepth(50)
        .setScrollFactor(0)
    },
    onUpdate: () => {
      if (!text) {
        return
      }
      const roundTimeSec = getTuningNumber(context.tuning, "roundTimeSec", roundTimerDefaults.roundTimeSec)
      const timerOverrideSec = context.getDebugOverride()?.timerOverrideSec
      const effectiveRoundTimeSec = timerOverrideSec ?? roundTimeSec
      const remainingSec = Math.max(effectiveRoundTimeSec - context.getElapsedMs() / 1000, 0)
      text.setText(formatSeconds(remainingSec))
    },
    onDispose: () => {
      text?.destroy()
      text = undefined
    },
  }
}
