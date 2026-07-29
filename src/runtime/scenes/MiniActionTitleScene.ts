import Phaser from "phaser"
import { RUNTIME_STATUS_EVENT, type GeneratedGameDefinition } from "../phaser/runtimeGameDefinition.types"
import { MiniActionBaseScene } from "./MiniActionBaseScene"

/**
 * Generic mini-action title scene. This is intentionally not Puni Sumo gameplay — it only
 * proves the runtime can boot, render a scene driven by a GeneratedGameDefinition, and hand off
 * to the next scene. Real gameplay lands in Phase 6.2.
 */
export class MiniActionTitleScene extends MiniActionBaseScene {
  constructor(definition: GeneratedGameDefinition) {
    super(definition.scenes.title, definition)
  }

  protected onCreate(): void {
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor("#1c2b1f")

    this.add
      .text(width / 2, height / 2 - 60, this.definition.title, {
        fontFamily: "sans-serif",
        fontSize: "32px",
        color: "#f4ead1",
        align: "center",
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 - 16, "Phase 6.0 runtime foundation placeholder", {
        fontFamily: "sans-serif",
        fontSize: "16px",
        color: "#c9d8c0",
        align: "center",
      })
      .setOrigin(0.5)

    const startButton = this.add
      .text(width / 2, height / 2 + 72, "Start", {
        fontFamily: "sans-serif",
        fontSize: "24px",
        color: "#0d1a10",
        backgroundColor: "#f4ead1",
        padding: { x: 24, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    startButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.scene.start(this.definition.scenes.game)
    })

    this.game.events.emit(RUNTIME_STATUS_EVENT, "ready")
  }
}
