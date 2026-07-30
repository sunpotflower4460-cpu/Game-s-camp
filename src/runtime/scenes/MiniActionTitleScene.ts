import Phaser from "phaser"
import { RUNTIME_STATUS_EVENT, type GeneratedGameDefinition } from "../phaser/runtimeGameDefinition.types"
import { MiniActionBaseScene } from "./MiniActionBaseScene"

function muteLabel(muted: boolean): string {
  return muted ? "Unmute" : "Mute"
}

/**
 * Generic mini-action title scene: title, short instruction, Start, and a mute toggle. Reads
 * and writes `this.sound.mute` (the shared Phaser SoundManager flag, not per-scene state) so the
 * preference persists across a Replay or a return to Title even before any audio Kit is wired
 * (Phase 6.3) — the toggle exists now so that Kit only ever needs to respect one flag.
 */
export class MiniActionTitleScene extends MiniActionBaseScene {
  constructor(definition: GeneratedGameDefinition) {
    super(definition.scenes.title, definition)
  }

  protected onCreate(): void {
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor("#1c2b1f")

    this.add
      .text(width / 2, height / 2 - 150, this.definition.title, {
        fontFamily: "sans-serif",
        fontSize: "32px",
        color: "#f4ead1",
        align: "center",
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 - 96, "Drag your Puni to push the opponent out of the ring.", {
        fontFamily: "sans-serif",
        fontSize: "14px",
        color: "#c9d8c0",
        align: "center",
        wordWrap: { width: width * 0.8 },
      })
      .setOrigin(0.5)

    const startButton = this.add
      .text(width / 2, height / 2 + 40, "Start", {
        fontFamily: "sans-serif",
        fontSize: "24px",
        color: "#0d1a10",
        backgroundColor: "#f4ead1",
        padding: { x: 24, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    const muteButton = this.add
      .text(width / 2, height / 2 + 108, muteLabel(this.sound.mute), {
        fontFamily: "sans-serif",
        fontSize: "16px",
        color: "#c9d8c0",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    startButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      // Resuming here (inside a real user gesture handler) unlocks the AudioContext for browsers
      // that require one, ahead of any audio Kit actually playing a sound in Phase 6.3.
      const soundManager = this.sound as Partial<Phaser.Sound.WebAudioSoundManager>
      soundManager.context?.resume?.()
      this.scene.start(this.definition.scenes.game)
    })

    muteButton.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.sound.mute = !this.sound.mute
      muteButton.setText(muteLabel(this.sound.mute))
    })

    this.game.events.emit(RUNTIME_STATUS_EVENT, "ready")
  }
}
