import { describe, expect, it } from "vitest"
import { createRuntimeKitRegistry } from "../../phaser/RuntimeKitRegistry"
import {
  MINI_ACTION_GAME_SLOT_ORDER,
  registerMiniActionGameKits,
  registerMiniActionResultKits,
} from "../registerMiniActionRuntimeKits"
import type { MiniActionGameKitContext, MiniActionResultKitContext } from "../miniActionKitContext.types"

// Mirrors plans/puni-sumo.assembler-plan.json's actual slot -> Kit ID assignments, so this test
// fails loudly (a missing runtime adapter) if a newly-assigned Kit is never wired into the
// registration tables — the completion criteria calls for this to fail before boot, not silently.
const ASSIGNED_GAME_KIT_IDS = [
  "controller.puniPush.v1",
  "controller.puniOpponentAI.v1",
  "stage.circularArenaForest.v1",
  "rule.ringOut.v1",
  "camera.isometricSoft.v1",
  "ui.roundTimer.v1",
]
const ASSIGNED_RESULT_KIT_IDS = ["ui.resultScreen.v1"]

describe("registerMiniActionGameKits", () => {
  it("registers a runtime adapter for every Kit ID the puni-sumo Assembler Plan assigns", () => {
    const registry = createRuntimeKitRegistry<MiniActionGameKitContext>()
    registerMiniActionGameKits(registry)

    for (const kitId of ASSIGNED_GAME_KIT_IDS) {
      expect(registry.has(kitId)).toBe(true)
    }
  })

  it("lists mainStage and mainCamera before the controllers, and winLoseRule after both", () => {
    expect(MINI_ACTION_GAME_SLOT_ORDER.indexOf("mainStage")).toBeLessThan(
      MINI_ACTION_GAME_SLOT_ORDER.indexOf("playerController"),
    )
    expect(MINI_ACTION_GAME_SLOT_ORDER.indexOf("mainCamera")).toBeLessThan(
      MINI_ACTION_GAME_SLOT_ORDER.indexOf("playerController"),
    )
    expect(MINI_ACTION_GAME_SLOT_ORDER.indexOf("mainStage")).toBeLessThan(
      MINI_ACTION_GAME_SLOT_ORDER.indexOf("winLoseRule"),
    )
  })
})

describe("registerMiniActionResultKits", () => {
  it("registers a runtime adapter for every Kit ID the puni-sumo Assembler Plan assigns to resultUi", () => {
    const registry = createRuntimeKitRegistry<MiniActionResultKitContext>()
    registerMiniActionResultKits(registry)

    for (const kitId of ASSIGNED_RESULT_KIT_IDS) {
      expect(registry.has(kitId)).toBe(true)
    }
  })
})
