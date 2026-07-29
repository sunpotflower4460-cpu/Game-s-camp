import Phaser from "phaser"
import { RUNTIME_STATUS_EVENT, type GeneratedGameDefinition } from "../phaser/runtimeGameDefinition.types"

/**
 * Generic mini-action result scene placeholder. Real WIN/LOSE/DRAW payloads and double-click
 * protection land with actual gameplay in Phase 6.2; this only proves Replay/Title navigation.
 */
export class MiniActionResultScene extends Phaser.Scene {
  private readonly definition: GeneratedGameDefinition

  constructor(definition: GeneratedGameDefinition) {
    super(definition.scenes.result)
    this.definition = definition
  }

  create(): void {
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor("#1c2b1f")

    this.add
      .text(width / 2, height / 2 - 80, "Result runtime placeholder", {
        fontFamily: "sans-serif",
        fontSize: "24px",
        color: "#f4ead1",
        align: "center",
      })
      .setOrigin(0.5)

    const replayButton = this.add
      .text(width / 2, height / 2, "Replay", {
        fontFamily: "sans-serif",
        fontSize: "20px",
        color: "#0d1a10",
        backgroundColor: "#f4ead1",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    const titleButton = this.add
      .text(width / 2, height / 2 + 64, "Back to Title", {
        fontFamily: "sans-serif",
        fontSize: "18px",
        color: "#f4ead1",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    replayButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.scene.start(this.definition.scenes.game)
    })

    titleButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.scene.start(this.definition.scenes.title)
    })

    this.game.events.emit(RUNTIME_STATUS_EVENT, "result")
  }
}
