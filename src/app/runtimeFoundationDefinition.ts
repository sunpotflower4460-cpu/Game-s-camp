import type { GeneratedGameDefinition } from "../runtime/phaser/runtimeGameDefinition.types"

/**
 * Phase 6.0 placeholder `GeneratedGameDefinition`, authored by hand so the runtime foundation
 * has something concrete to boot. It intentionally mirrors `recipes/games/puni-sumo.recipe.json`
 * and `templates/mini-action/template.manifest.json` field values, but it is NOT produced by a
 * generator. Phase 6.1 wires `generated/games/puni-sumo/` into a real instance of this shape and
 * this placeholder is removed.
 *
 * `slots.opponentController` references `controller.puniOpponentAI.v1`, a Kit that does not
 * exist in the Kit Registry yet — the `opponentController` slot itself is added to the template
 * contract in Phase 6.1. It is unused by the Phase 6.0 placeholder scenes.
 */
export const runtimeFoundationDefinition: GeneratedGameDefinition = {
  schemaVersion: "0.1",
  gameId: "puni-sumo-forest-v1",
  title: "森のぷに相撲",
  engine: "phaser",
  templateId: "template.miniAction.v1",
  scenes: {
    title: "runtime-foundation-title",
    game: "runtime-foundation-game",
    result: "runtime-foundation-result",
  },
  slots: {
    playerController: "controller.puniPush.v1",
    opponentController: "controller.puniOpponentAI.v1",
    mainStage: "stage.circularArenaForest.v1",
    winLoseRule: "rule.ringOut.v1",
    resultUi: "ui.resultScreen.v1",
    mainCamera: "camera.isometricSoft.v1",
    timerUi: "ui.roundTimer.v1",
  },
  tuning: {
    moveSpeed: 180,
    pushPower: 1.2,
    arenaRadius: 260,
    roundTimeSec: 60,
  },
}
