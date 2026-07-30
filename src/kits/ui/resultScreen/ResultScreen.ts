import { createKitContext } from "../../shared/KitContext"
import type { KitDefinition } from "../../shared/KitDefinition"
import type { KitLifecycleHooks } from "../../shared/KitLifecycle"
import type { RuntimeKitAdapter } from "../../../runtime/phaser/runtimeKit.types"
import type { MiniActionResultKitContext } from "../../../runtime/scenes/miniActionKitContext.types"
import { getTuningNumber } from "../../../runtime/scenes/miniActionTuning"

const KIT_ID = "ui.resultScreen.v1"

export type ResultScreenTunables = {
  showDurationMs: number
}

export const resultScreenDefaults: ResultScreenTunables = {
  showDurationMs: 1500,
}

export function createResultScreenKitDefinition(): KitDefinition<ResultScreenTunables> {
  const context = createKitContext(KIT_ID, "runtime-ready")
  const lifecycle: KitLifecycleHooks = {
    onCreate: () => undefined,
    onMount: () => undefined,
    onUpdate: () => undefined,
    onDispose: () => undefined,
  }

  return {
    kitId: KIT_ID,
    name: "Result Screen UI",
    context,
    phase: context.phase,
    defaults: resultScreenDefaults,
    lifecycle,
  }
}

const HEADLINE_BY_RESULT: Record<MiniActionResultKitContext["outcome"]["result"], string> = {
  win: "WIN",
  lose: "LOSE",
  draw: "DRAW",
}

const COLOR_BY_RESULT: Record<MiniActionResultKitContext["outcome"]["result"], string> = {
  win: "#8fd694",
  lose: "#e08a8a",
  draw: "#e0d68a",
}

/**
 * Renders the WIN/LOSE/DRAW headline and outcome reason. `MiniActionResultScene` owns the
 * navigation chrome (Replay/Back to Title, double-click guard) — this Kit only owns presenting
 * the outcome it's handed, matching its `resultScreen` capability.
 */
export function createResultScreenRuntimeAdapter(context: MiniActionResultKitContext): RuntimeKitAdapter {
  return {
    kitId: KIT_ID,
    onCreate: () => {
      const { width, height } = context.scene.scale
      const headline = HEADLINE_BY_RESULT[context.outcome.result]
      const color = COLOR_BY_RESULT[context.outcome.result]

      const headlineText = context.scene.add
        .text(width / 2, height / 2 - 150, headline, {
          fontFamily: "sans-serif",
          fontSize: "56px",
          color,
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setAlpha(0)

      const reasonText = context.scene.add
        .text(width / 2, height / 2 - 90, context.outcome.reason, {
          fontFamily: "sans-serif",
          fontSize: "16px",
          color: "#f4ead1",
          align: "center",
          wordWrap: { width: width * 0.8 },
        })
        .setOrigin(0.5)
        .setAlpha(0)

      const showDurationMs = getTuningNumber(context.tuning, "showDurationMs", resultScreenDefaults.showDurationMs)
      context.scene.tweens.add({
        targets: [headlineText, reasonText],
        alpha: 1,
        duration: showDurationMs,
      })
    },
  }
}
