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
}

export function createPhaserConfig(options: CreatePhaserConfigOptions): Phaser.Types.Core.GameConfig {
  const { parent, definition, width = 720, height = 1280, headless = false } = options

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
    scene: [
      new MiniActionTitleScene(definition),
      new MiniActionGameScene(definition),
      new MiniActionResultScene(definition),
    ],
  }
}
