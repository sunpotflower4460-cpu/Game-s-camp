import Phaser from "phaser"
import { RUNTIME_STATUS_EVENT, type GeneratedGameDefinition } from "../phaser/runtimeGameDefinition.types"
import { MiniActionBaseScene } from "./MiniActionBaseScene"
import { createRuntimeKitRegistry } from "../phaser/RuntimeKitRegistry"
import { registerMiniActionResultKits } from "./registerMiniActionRuntimeKits"
import type { MiniActionOutcome, MiniActionResultKitContext } from "./miniActionKitContext.types"

type ResultSceneData = { outcome?: MiniActionOutcome }

const FALLBACK_OUTCOME: MiniActionOutcome = {
  result: "draw",
  reason: "Round ended.",
}

/**
 * Owns generic navigation chrome (Replay / Back to Title, double-click guard) and hands the
 * outcome to the `resultUi` slot Kit, which owns presenting it (WIN/LOSE/DRAW headline + reason)
 * — see `ui.resultScreen.v1`.
 */
export class MiniActionResultScene extends MiniActionBaseScene {
  private outcome: MiniActionOutcome = FALLBACK_OUTCOME
  private navigationHandled = false

  constructor(definition: GeneratedGameDefinition) {
    super(definition.scenes.result, definition)
  }

  init(data: ResultSceneData): void {
    // Reached via `scene.start(resultKey, { outcome })` from the Game scene in normal play, but
    // falls back gracefully if this scene is ever entered directly (e.g. manual navigation).
    this.outcome = data?.outcome ?? FALLBACK_OUTCOME
    this.navigationHandled = false
  }

  protected onCreate(): void {
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor("#1c2b1f")

    const registry = createRuntimeKitRegistry<MiniActionResultKitContext>()
    registerMiniActionResultKits(registry)
    const context: MiniActionResultKitContext = {
      scene: this,
      tuning: this.definition.tuning,
      outcome: this.outcome,
    }
    registry.resolve(this.definition.slots.resultUi, context).onCreate?.()

    const replayButton = this.add
      .text(width / 2, height / 2 + 110, "Replay", {
        fontFamily: "sans-serif",
        fontSize: "22px",
        color: "#0d1a10",
        backgroundColor: "#f4ead1",
        padding: { x: 24, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    const titleButton = this.add
      .text(width / 2, height / 2 + 172, "Back to Title", {
        fontFamily: "sans-serif",
        fontSize: "18px",
        color: "#f4ead1",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    replayButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      if (this.navigationHandled) {
        return
      }
      this.navigationHandled = true
      this.scene.start(this.definition.scenes.game)
    })

    titleButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      if (this.navigationHandled) {
        return
      }
      this.navigationHandled = true
      this.scene.start(this.definition.scenes.title)
    })

    this.game.events.emit(RUNTIME_STATUS_EVENT, "result")
  }
}
