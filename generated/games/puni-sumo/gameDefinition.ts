import type { GeneratedGameDefinition } from "../../../src/runtime/phaser/runtimeGameDefinition.types"

export const generatedGameDefinition: GeneratedGameDefinition = {
  schemaVersion: "0.1",
  gameId: "puni-sumo",
  title: "森のぷに相撲",
  engine: "phaser",
  templateId: "template.miniAction.v1",
  scenes: {
    title: "TitleScene",
    game: "GameScene",
    result: "ResultScene",
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
    "moveSpeed": 180,
    "pushPower": 1.2,
    "arenaRadius": 260,
    "roundTimeSec": 60
  },
}
