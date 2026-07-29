// Resolved configuration summary for "森のぷに相撲". The runtime reads gameDefinition.ts, not this
// file; this exists only as a human-readable record of what the Assembler resolved.
export const resolvedGameConfig = {
  gameId: "puni-sumo-forest-v1",
  title: "森のぷに相撲",
  engine: "phaser",
  templateId: "template.miniAction.v1",
  slots: {
    "playerController": "controller.puniPush.v1",
    "opponentController": "controller.puniOpponentAI.v1",
    "mainStage": "stage.circularArenaForest.v1",
    "winLoseRule": "rule.ringOut.v1",
    "resultUi": "ui.resultScreen.v1",
    "mainCamera": "camera.isometricSoft.v1",
    "timerUi": "ui.roundTimer.v1"
  },
} as const
