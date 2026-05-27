export const gameSceneTemplate = {
  sceneKey: "{{scene.game}}",
  requiredSlots: {
    playerController: "{{slot.playerController}}",
    mainStage: "{{slot.mainStage}}",
    winLoseRule: "{{slot.winLoseRule}}",
    resultUi: "{{slot.resultUi}}",
  },
  optionalSlots: {
    mainCamera: "{{slot.mainCamera}}",
    timerUi: "{{slot.timerUi}}",
    visualFlavor: "{{slot.visualFlavor}}",
    impactAudio: "{{slot.impactAudio}}",
  },
}
