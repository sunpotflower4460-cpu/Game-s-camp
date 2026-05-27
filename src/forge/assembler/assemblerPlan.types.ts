export type AssemblerSlotAssignment = {
  slotName: string
  category: string
  required: boolean
  kitId: string
  manifestPath: string
}

export type AssemblerPlan = {
  schemaVersion: "0.1"
  recipeId: string
  gameTitle: string
  templateId: string
  templateManifestPath: string
  engine: string
  genre: string
  input: string
  requiredAssignments: AssemblerSlotAssignment[]
  optionalAssignments: AssemblerSlotAssignment[]
  unresolvedRequiredSlots: Array<{
    slotName: string
    category: string
    reason: string
  }>
  notes: string[]
}
