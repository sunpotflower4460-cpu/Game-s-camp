import Phaser from "phaser"
import { describe, expect, it } from "vitest"
import { createPhaserConfig } from "../createPhaserConfig"
import type { GeneratedGameDefinition } from "../runtimeGameDefinition.types"

const definition: GeneratedGameDefinition = {
  schemaVersion: "0.1",
  gameId: "test-game",
  title: "Test Game",
  engine: "phaser",
  templateId: "template.miniAction.v1",
  scenes: {
    title: "test-title",
    game: "test-game-scene",
    result: "test-result",
  },
  slots: {
    playerController: "controller.puniPush.v1",
    opponentController: "controller.puniOpponentAI.v1",
    mainStage: "stage.circularArenaForest.v1",
    winLoseRule: "rule.ringOut.v1",
    resultUi: "ui.resultScreen.v1",
    mainCamera: "camera.isometricSoft.v1",
  },
  tuning: {},
}

describe("createPhaserConfig", () => {
  it("targets the given parent element and dimensions", () => {
    const parent = document.createElement("div")
    const config = createPhaserConfig({ parent, definition, width: 480, height: 800 })

    expect(config.parent).toBe(parent)
    expect(config.width).toBe(480)
    expect(config.height).toBe(800)
  })

  it("defaults to a 720x1280 canvas when no size is given", () => {
    const parent = document.createElement("div")
    const config = createPhaserConfig({ parent, definition })

    expect(config.width).toBe(720)
    expect(config.height).toBe(1280)
  })

  it("uses Phaser.HEADLESS only when explicitly requested, AUTO otherwise", () => {
    const parent = document.createElement("div")

    expect(createPhaserConfig({ parent, definition }).type).toBe(Phaser.AUTO)
    expect(createPhaserConfig({ parent, definition, headless: true }).type).toBe(Phaser.HEADLESS)
  })

  it("registers exactly one scene per Title/Game/Result slot, in order", () => {
    const parent = document.createElement("div")
    const config = createPhaserConfig({ parent, definition })

    expect(Array.isArray(config.scene)).toBe(true)
    const scenes = config.scene as Phaser.Scene[]
    expect(scenes).toHaveLength(3)
    expect(scenes.map((scene) => scene.sys.settings.key)).toEqual([
      definition.scenes.title,
      definition.scenes.game,
      definition.scenes.result,
    ])
  })

  it("configures arcade physics with zero gravity so Kits control motion explicitly", () => {
    const parent = document.createElement("div")
    const config = createPhaserConfig({ parent, definition })

    expect(config.physics?.default).toBe("arcade")
  })
})
