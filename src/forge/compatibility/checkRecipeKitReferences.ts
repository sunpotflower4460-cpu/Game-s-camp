import type { GameRecipe } from "../recipe/gameRecipe.zod"
import type { KitRegistry } from "../kit-registry/kitRegistry.types"

import {
  createCompatibilityResult,
  type CompatibilityResult,
} from "./compatibilityResult"

function collectKitIds(recipe: GameRecipe): string[] {
  return [...recipe.requiredKits, ...recipe.optionalKits]
}

export function checkRecipeKitReferences(
  recipe: GameRecipe,
  registry: KitRegistry,
): CompatibilityResult {
  const issues = [] as CompatibilityResult["issues"]

  const idCounts = new Map<string, number>()
  for (const kitId of collectKitIds(recipe)) {
    idCounts.set(kitId, (idCounts.get(kitId) ?? 0) + 1)
  }

  for (const [kitId, count] of idCounts) {
    if (count <= 1) {
      continue
    }

    issues.push({
      severity: "error",
      code: "RECIPE_DUPLICATE_KIT_ID",
      message: `Kit ID appears multiple times in recipe references: ${kitId}`,
      recipeId: recipe.id,
      kitId,
    })
  }

  for (const kitId of recipe.requiredKits) {
    if (registry.byId.has(kitId)) {
      continue
    }

    issues.push({
      severity: "error",
      code: "RECIPE_REQUIRED_KIT_NOT_FOUND",
      message: `Required kit is not registered: ${kitId}`,
      recipeId: recipe.id,
      kitId,
    })
  }

  for (const kitId of recipe.optionalKits) {
    if (registry.byId.has(kitId)) {
      continue
    }

    issues.push({
      severity: "warning",
      code: "RECIPE_OPTIONAL_KIT_NOT_FOUND",
      message: `Optional kit is not registered: ${kitId}`,
      recipeId: recipe.id,
      kitId,
    })
  }

  return createCompatibilityResult(issues)
}
