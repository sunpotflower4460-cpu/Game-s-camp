import { readdirSync } from "node:fs"
import { join } from "node:path"

import {
  LoadKitRegistryError,
  loadKitRegistry,
} from "../src/forge/kit-registry/loadKitRegistry"
import { validateKitRegistry } from "../src/forge/kit-registry/validateKitRegistry"
import {
  LoadTemplateRegistryError,
  loadTemplateRegistry,
} from "../src/forge/template-registry/loadTemplateRegistry"
import { validateTemplateRegistry } from "../src/forge/template-registry/validateTemplateRegistry"
import { gameRecipeSchema } from "../src/forge/recipe/gameRecipe.zod"
import { ReadJsonFileError, readJsonFile } from "../src/forge/shared/readJsonFile"
import { checkRecipeCompatibility } from "../src/forge/compatibility/checkRecipeCompatibility"

function findRecipeFiles(rootDir: string): string[] {
  const entries = readdirSync(rootDir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const path = join(rootDir, entry.name)
    if (entry.isDirectory()) {
      files.push(...findRecipeFiles(path))
      continue
    }
    if (entry.isFile() && entry.name.endsWith(".recipe.json")) {
      files.push(path)
    }
  }

  return files.sort()
}

let registry
try {
  registry = loadKitRegistry("kits")
} catch (error) {
  if (error instanceof LoadKitRegistryError) {
    console.error(`[fail] RecipeCompatibility: ${error.message}`)
    process.exit(1)
  }
  throw error
}

const registryValidation = validateKitRegistry(registry)
if (!registryValidation.ok) {
  for (const errorMessage of registryValidation.errors) {
    console.error(`[fail] RecipeCompatibility: ${errorMessage}`)
  }
  process.exit(1)
}

let templateRegistry
try {
  templateRegistry = loadTemplateRegistry("templates")
} catch (error) {
  if (error instanceof LoadTemplateRegistryError) {
    console.error(`[fail] RecipeCompatibility: ${error.message}`)
    process.exit(1)
  }
  throw error
}

const templateRegistryValidation = validateTemplateRegistry(templateRegistry)
if (!templateRegistryValidation.ok) {
  for (const errorMessage of templateRegistryValidation.errors) {
    console.error(`[fail] RecipeCompatibility: ${errorMessage}`)
  }
  process.exit(1)
}

const recipeFiles = findRecipeFiles("recipes")
let hasError = false

for (const recipePath of recipeFiles) {
  let rawRecipe: unknown

  try {
    rawRecipe = readJsonFile(recipePath)
  } catch (error) {
    hasError = true
    if (error instanceof ReadJsonFileError) {
      console.error(`[fail] RecipeCompatibility: ${error.message}`)
    } else {
      const reason = error instanceof Error ? error.message : String(error)
      console.error(`[fail] RecipeCompatibility: ${recipePath} (${reason})`)
    }
    continue
  }

  const parsedRecipe = gameRecipeSchema.safeParse(rawRecipe)
  if (!parsedRecipe.success) {
    hasError = true
    console.error(`[fail] RecipeCompatibility: ${recipePath} (invalid recipe schema)`)
    console.error(JSON.stringify(parsedRecipe.error.format(), null, 2))
    continue
  }

  if (!templateRegistry.byId.has(parsedRecipe.data.template)) {
    hasError = true
    console.error(`[fail] RecipeCompatibility: ${recipePath}`)
    console.error(
      `  - RECIPE_TEMPLATE_NOT_FOUND: Template is not registered: ${parsedRecipe.data.template}`,
    )
    continue
  }

  const compatibility = checkRecipeCompatibility(parsedRecipe.data, registry)
  const errors = compatibility.issues.filter((issue) => issue.severity === "error")
  const warnings = compatibility.issues.filter((issue) => issue.severity === "warning")

  if (errors.length === 0) {
    console.log(`[ok] RecipeCompatibility: ${recipePath}`)
  } else {
    hasError = true
    console.error(`[fail] RecipeCompatibility: ${recipePath}`)
    for (const issue of errors) {
      console.error(`  - ${issue.code}: ${issue.message}`)
    }
  }

  for (const issue of warnings) {
    console.warn(`[warn] RecipeCompatibility: ${recipePath} - ${issue.code}: ${issue.message}`)
  }
}

if (hasError) {
  process.exit(1)
}
