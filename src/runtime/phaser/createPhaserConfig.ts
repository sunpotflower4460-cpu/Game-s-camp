import Phaser from "phaser"
import { MiniActionGameScene } from "../scenes/MiniActionGameScene"
import { MiniActionResultScene } from "../scenes/MiniActionResultScene"
import { MiniActionTitleScene } from "../scenes/MiniActionTitleScene"
import type { GeneratedGameDefinition } from "./runtimeGameDefinition.types"

export type CreatePhaserConfigOptions = {
  parent: HTMLElement
  definition: GeneratedGameDefinition
  width?: number
  height?: number
  /** Used by unit tests to boot Phaser without a real WebGL/Canvas context. */
  headless?: boolean
  /**
   * Scene *classes* (not instances) to register, in Title/Game/Result order — Phaser
   * instantiates each one fresh per `Phaser.Game`, which a shared instance could not survive
   * across (e.g. React StrictMode's mount -> cleanup -> mount). Defaults to the generic
   * placeholder scene classes bound to `definition` — a real game passes its own generated
   * `generated/games/<gameId>/{Title,Game,Result}Scene` classes here instead, so the
   * generator's Scene wrappers are what the runtime actually boots.
   */
  scenes?: Phaser.Types.Scenes.SceneType[]
}

export function createPhaserConfig(options: CreatePhaserConfigOptions): Phaser.Types.Core.GameConfig {
  const { parent, definition, width = 720, height = 1280, headless = false, scenes } = options

  return {
    type: headless ? Phaser.HEADLESS : Phaser.AUTO,
    parent,
    width,
    height,
    backgroundColor: "#1c2b1f",
    transparent: false,
    banner: false,
    disableContextMenu: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: scenes ?? [
      new MiniActionTitleScene(definition),
      new MiniActionGameScene(definition),
      new MiniActionResultScene(definition),
    ],
  }
}
