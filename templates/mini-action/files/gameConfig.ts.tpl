// Resolved configuration summary for {{recipe.titleJson}}. The runtime reads gameDefinition.ts, not this
// file; this exists only as a human-readable record of what the Assembler resolved.
export const resolvedGameConfig = {
  gameId: {{recipe.gameIdJson}},
  title: {{recipe.titleJson}},
  engine: {{recipe.engineJson}},
  templateId: {{recipe.templateIdJson}},
  slots: {{plan.slotsJson}},
} as const
