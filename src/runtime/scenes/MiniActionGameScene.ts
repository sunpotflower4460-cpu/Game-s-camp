import Phaser from "phaser"
import { RUNTIME_STATUS_EVENT, type GeneratedGameDefinition } from "../phaser/runtimeGameDefinition.types"
import { MiniActionBaseScene } from "./MiniActionBaseScene"

/**
 * Generic mini-action "game" scene placeholder. Phase 6.0 only proves that the runtime can
 * reach a "playing" state and hand off to the result scene. Actual Puni Sumo mechanics
 * (movement, opponent AI, push/collision, ring-out, 60s timer) are implemented in Phase 6.2 by
 * a real generated Scene built on top of this same runtime.
 */
export class MiniActionGameScene extends MiniActionBaseScene {
  constructor(definition: GeneratedGameDefinition) {
    super(definition.scenes.game, definition)
  }

  protected onCreate(): void {
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor("#26392b")

    this.add
      .text(width / 2, height / 2 - 40, "Game runtime placeholder", {
        fontFamily: "sans-serif",
        fontSize: "24px",
        color: "#f4ead1",
        align: "center",
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2, "Gameplay Kits are wired in Phase 6.2", {
        fontFamily: "sans-serif",
        fontSize: "14px",
        color: "#c9d8c0",
        align: "center",
      })
      .setOrigin(0.5)

    const finishButton = this.add
      .text(width / 2, height / 2 + 72, "Finish", {
        fontFamily: "sans-serif",
        fontSize: "22px",
        color: "#0d1a10",
        backgroundColor: "#f4ead1",
        padding: { x: 24, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    finishButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.scene.start(this.definition.scenes.result)
    })

    this.game.events.emit(RUNTIME_STATUS_EVENT, "playing")
  }
}
