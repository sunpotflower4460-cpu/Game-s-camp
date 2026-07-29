import type { GeneratedGameDefinition } from "{{import.runtimeTypes}}"

export const generatedGameDefinition: GeneratedGameDefinition = {
  schemaVersion: "0.1",
  gameId: "{{gameId}}",
  title: "{{title}}",
  engine: "{{engine}}",
  templateId: "{{templateId}}",
  scenes: {
    title: "{{scene.title}}",
    game: "{{scene.game}}",
    result: "{{scene.result}}",
  },
  slots: {
    playerController: "{{slot.playerController}}",
    opponentController: "{{slot.opponentController}}",
    mainStage: "{{slot.mainStage}}",
    winLoseRule: "{{slot.winLoseRule}}",
    resultUi: "{{slot.resultUi}}",
    mainCamera: "{{slot.mainCamera}}",
    timerUi: "{{slot.timerUi}}",
  },
  tuning: {{recipe.tuningJson}},
}
