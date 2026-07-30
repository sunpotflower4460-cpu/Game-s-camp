import Phaser from "phaser"
import { MiniActionGameScene } from "../scenes/MiniActionGameScene"
import { MiniActionResultScene } from "../scenes/MiniActionResultScene"
import { MiniActionTitleScene } from "../scenes/MiniActionTitleScene"
import type { GeneratedGameDefinition } from "./runtimeGameDefinition.types"

/**
 * A zero-argument-constructible Scene class — deliberately narrower than
 * `Phaser.Types.Scenes.SceneType`, which also accepts a Scene *instance*. Accepting instances
 * would let a caller pass an already-constructed Scene that's reused across boots (e.g. after
 * React StrictMode's mount -> cleanup -> mount, or a Retry), which crashes because a Scene
 * instance carries internal state tied to the one `Phaser.Game` it was first added to. Every
 * generated Scene wrapper (`generated/games/<gameId>/{Title,Game,Result}Scene`) has its own
 * zero-arg constructor that supplies its baked-in `GeneratedGameDefinition` to `super(...)`, so
 * this type is exactly what callers are expected to provide.
 */
export type SceneClass = new () => Phaser.Scene

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
  scenes?: SceneClass[]
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
