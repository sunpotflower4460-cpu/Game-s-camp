export const gameSceneTemplate = {
  sceneKey: "GameScene",
  requiredSlots: {
    playerController: "controller.puniPush.v1",
    mainStage: "stage.circularArenaForest.v1",
    winLoseRule: "rule.ringOut.v1",
    resultUi: "ui.resultScreen.v1",
  },
  optionalSlots: {
    mainCamera: "camera.isometricSoft.v1",
    timerUi: "ui.roundTimer.v1",
    visualFlavor: "unassigned",
    impactAudio: "unassigned",
  },
}
