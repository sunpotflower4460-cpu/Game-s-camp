import type { GeneratedGameDefinition } from "{{import.runtimeTypes}}"

export const generatedGameDefinition: GeneratedGameDefinition = {
  schemaVersion: "0.1",
  gameId: {{recipe.gameIdJson}},
  title: {{recipe.titleJson}},
  engine: {{recipe.engineJson}},
  templateId: {{recipe.templateIdJson}},
  scenes: {
    title: "{{scene.title}}",
    game: "{{scene.game}}",
    result: "{{scene.result}}",
  },
  slots: {{plan.slotsJson}},
  tuning: {{recipe.tuningJson}},
}
