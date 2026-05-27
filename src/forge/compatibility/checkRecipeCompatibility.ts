import type { GameRecipe } from "../recipe/gameRecipe.zod"
import type { KitRegistry, KitRegistryEntry } from "../kit-registry/kitRegistry.types"

import {
  createCompatibilityResult,
  type CompatibilityResult,
} from "./compatibilityResult"
import { checkRecipeKitReferences } from "./checkRecipeKitReferences"

function checkRule(
  recipe: GameRecipe,
  entry: KitRegistryEntry,
  field: string,
  value: string,
): CompatibilityResult["issues"] {
  const allowed = entry.manifest.compatibleWith[field]
  if (!allowed || allowed.length === 0 || allowed.includes(value)) {
    return []
  }

  return [
    {
      severity: "error",
      code: "RECIPE_KIT_INCOMPATIBLE_FIELD",
      message: `Kit ${entry.manifest.id} is not compatible with ${field}=${value}`,
      recipeId: recipe.id,
      kitId: entry.manifest.id,
    },
  ]
}

function collectExistingEntries(
  recipe: GameRecipe,
  registry: KitRegistry,
): KitRegistryEntry[] {
  const uniqueIds = new Set([...recipe.requiredKits, ...recipe.optionalKits])
  const entries: KitRegistryEntry[] = []

  for (const kitId of uniqueIds) {
    const entry = registry.byId.get(kitId)
    if (entry) {
      entries.push(entry)
    }
  }

  return entries
}

export function checkRecipeCompatibility(
  recipe: GameRecipe,
  registry: KitRegistry,
): CompatibilityResult {
  const issues = [...checkRecipeKitReferences(recipe, registry).issues]

  for (const entry of collectExistingEntries(recipe, registry)) {
    if (entry.manifest.engine !== recipe.engine) {
      issues.push({
        severity: "error",
        code: "RECIPE_KIT_ENGINE_MISMATCH",
        message: `Kit ${entry.manifest.id} engine (${entry.manifest.engine}) does not match recipe engine (${recipe.engine})`,
        recipeId: recipe.id,
        kitId: entry.manifest.id,
      })
    }

    issues.push(...checkRule(recipe, entry, "templates", recipe.template))
    issues.push(...checkRule(recipe, entry, "inputs", recipe.input))
  }

  return createCompatibilityResult(issues)
}
