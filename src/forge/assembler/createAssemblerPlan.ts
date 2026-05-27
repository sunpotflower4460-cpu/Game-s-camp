import type { KitRegistryEntry, KitRegistry } from "../kit-registry/kitRegistry.types"
import type { GameRecipe } from "../recipe/gameRecipe.zod"
import type { TemplateRegistry, TemplateRegistryEntry } from "../template-registry/templateRegistry.types"

import type { AssemblerPlan, AssemblerSlotAssignment } from "./assemblerPlan.types"

function collectReferencedKitEntries(recipe: GameRecipe, kitRegistry: KitRegistry): KitRegistryEntry[] {
  const entries: KitRegistryEntry[] = []
  const seen = new Set<string>()

  for (const kitId of [...recipe.requiredKits, ...recipe.optionalKits]) {
    if (seen.has(kitId)) {
      continue
    }
    seen.add(kitId)
    const entry = kitRegistry.byId.get(kitId)
    if (entry) {
      entries.push(entry)
    }
  }

  return entries
}

function createAssignment(
  slot: { name: string; category: string; required: boolean },
  kit: KitRegistryEntry,
): AssemblerSlotAssignment {
  return {
    slotName: slot.name,
    category: slot.category,
    required: slot.required,
    kitId: kit.manifest.id,
    manifestPath: kit.manifestPath,
  }
}

function explainUnresolvedSlot(
  slot: { name: string; category: string },
  hasCategoryCandidates: boolean,
): string {
  if (!hasCategoryCandidates) {
    return `No kit with category "${slot.category}" is listed in the recipe's requiredKits or optionalKits.`
  }

  return `No unassigned kit remains for category "${slot.category}".`
}

function noteMultipleCandidates(
  notes: string[],
  slot: { name: string; category: string },
  selectedKitId: string,
  candidates: KitRegistryEntry[],
): void {
  if (candidates.length <= 1) {
    return
  }

  const alternatives = candidates
    .map((candidate) => candidate.manifest.id)
    .filter((kitId) => kitId !== selectedKitId)

  if (alternatives.length === 0) {
    return
  }

  notes.push(
    `Slot "${slot.name}" (${slot.category}) selected ${selectedKitId}; other candidates: ${alternatives.join(", ")}`,
  )
}

function getTemplateEntry(recipe: GameRecipe, templateRegistry: TemplateRegistry): TemplateRegistryEntry {
  const templateEntry = templateRegistry.byId.get(recipe.template)
  if (!templateEntry) {
    throw new Error(`Template is not registered: ${recipe.template}`)
  }
  return templateEntry
}

export function createAssemblerPlan(args: {
  recipe: GameRecipe
  templateRegistry: TemplateRegistry
  kitRegistry: KitRegistry
}): AssemblerPlan {
  const { recipe, templateRegistry, kitRegistry } = args
  const templateEntry = getTemplateEntry(recipe, templateRegistry)
  const referencedKitEntries = collectReferencedKitEntries(recipe, kitRegistry)
  const notes: string[] = [
    "Assignment strategy: first available kit per slot using recipe order (requiredKits first, then optionalKits).",
  ]
  const assignedKitIds = new Set<string>()
  const requiredAssignments: AssemblerSlotAssignment[] = []
  const optionalAssignments: AssemblerSlotAssignment[] = []
  const unresolvedRequiredSlots: AssemblerPlan["unresolvedRequiredSlots"] = []

  const assignSlot = (
    slot: { name: string; category: string; required: boolean },
    target: AssemblerSlotAssignment[],
    unresolvedTarget?: AssemblerPlan["unresolvedRequiredSlots"],
  ): void => {
    const categoryCandidates = referencedKitEntries.filter(
      (entry) => entry.manifest.category === slot.category,
    )
    const unassignedCandidates = categoryCandidates.filter(
      (entry) => !assignedKitIds.has(entry.manifest.id),
    )
    const firstAvailableCandidate = unassignedCandidates[0]

    if (!firstAvailableCandidate) {
      if (unresolvedTarget) {
        unresolvedTarget.push({
          slotName: slot.name,
          category: slot.category,
          reason: explainUnresolvedSlot(slot, categoryCandidates.length > 0),
        })
      }
      return
    }

    assignedKitIds.add(firstAvailableCandidate.manifest.id)
    target.push(createAssignment(slot, firstAvailableCandidate))
    noteMultipleCandidates(notes, slot, firstAvailableCandidate.manifest.id, categoryCandidates)
  }

  for (const requiredSlot of templateEntry.manifest.requiredSlots) {
    assignSlot(requiredSlot, requiredAssignments, unresolvedRequiredSlots)
  }

  for (const optionalSlot of templateEntry.manifest.optionalSlots) {
    assignSlot(optionalSlot, optionalAssignments)
  }

  return {
    schemaVersion: "0.1",
    recipeId: recipe.id,
    gameTitle: recipe.title,
    templateId: templateEntry.manifest.id,
    templateManifestPath: templateEntry.manifestPath,
    engine: recipe.engine,
    genre: recipe.genre,
    input: recipe.input,
    requiredAssignments,
    optionalAssignments,
    unresolvedRequiredSlots,
    notes,
  }
}
