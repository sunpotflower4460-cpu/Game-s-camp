import { mkdirSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

import { checkRecipeCompatibility } from "../src/forge/compatibility/checkRecipeCompatibility"
import { loadKitRegistry, LoadKitRegistryError } from "../src/forge/kit-registry/loadKitRegistry"
import { validateKitRegistry } from "../src/forge/kit-registry/validateKitRegistry"
import { gameRecipeSchema } from "../src/forge/recipe/gameRecipe.zod"
import {
  loadTemplateRegistry,
  LoadTemplateRegistryError,
} from "../src/forge/template-registry/loadTemplateRegistry"
import { validateTemplateRegistry } from "../src/forge/template-registry/validateTemplateRegistry"
import { readJsonFile, ReadJsonFileError } from "../src/forge/shared/readJsonFile"
import { createAssemblerPlan } from "../src/forge/assembler/createAssemblerPlan"
import { validateAssemblerPlan } from "../src/forge/assembler/validateAssemblerPlan"
import { explainAssemblerPlan } from "../src/forge/assembler/explainAssemblerPlan"

const RECIPE_PATH = "recipes/games/puni-sumo.recipe.json"
const PLAN_JSON_PATH = "plans/puni-sumo.assembler-plan.json"
const PLAN_MD_PATH = "plans/puni-sumo.assembler-plan.md"

function fail(message: string): never {
  console.error(`[fail] AssemblerPlan: ${message}`)
  process.exit(1)
}

let rawRecipe: unknown
try {
  rawRecipe = readJsonFile(RECIPE_PATH)
} catch (error) {
  if (error instanceof ReadJsonFileError) {
    fail(error.message)
  }
  throw error
}

const parsedRecipe = gameRecipeSchema.safeParse(rawRecipe)
if (!parsedRecipe.success) {
  fail(`Invalid recipe schema: ${RECIPE_PATH}\n${JSON.stringify(parsedRecipe.error.format(), null, 2)}`)
}
const recipe = parsedRecipe.data

let kitRegistry
try {
  kitRegistry = loadKitRegistry("kits")
} catch (error) {
  if (error instanceof LoadKitRegistryError) {
    fail(error.message)
  }
  throw error
}

const kitRegistryValidation = validateKitRegistry(kitRegistry)
if (!kitRegistryValidation.ok) {
  for (const errorMessage of kitRegistryValidation.errors) {
    console.error(`[fail] AssemblerPlan: ${errorMessage}`)
  }
  process.exit(1)
}

let templateRegistry
try {
  templateRegistry = loadTemplateRegistry("templates")
} catch (error) {
  if (error instanceof LoadTemplateRegistryError) {
    fail(error.message)
  }
  throw error
}

const templateRegistryValidation = validateTemplateRegistry(templateRegistry)
if (!templateRegistryValidation.ok) {
  for (const errorMessage of templateRegistryValidation.errors) {
    console.error(`[fail] AssemblerPlan: ${errorMessage}`)
  }
  process.exit(1)
}

if (!templateRegistry.byId.has(recipe.template)) {
  fail(`Template is not registered: ${recipe.template}`)
}

const compatibility = checkRecipeCompatibility(recipe, kitRegistry)
const compatibilityErrors = compatibility.issues.filter((issue) => issue.severity === "error")
const compatibilityWarnings = compatibility.issues.filter((issue) => issue.severity === "warning")

for (const warning of compatibilityWarnings) {
  console.warn(`[warn] AssemblerPlan: ${warning.code}: ${warning.message}`)
}

if (compatibilityErrors.length > 0) {
  for (const issue of compatibilityErrors) {
    console.error(`[fail] AssemblerPlan: ${issue.code}: ${issue.message}`)
  }
  process.exit(1)
}

const plan = createAssemblerPlan({
  recipe,
  templateRegistry,
  kitRegistry,
})
const planIssues = validateAssemblerPlan(plan)

mkdirSync(dirname(PLAN_JSON_PATH), { recursive: true })
writeFileSync(PLAN_JSON_PATH, `${JSON.stringify(plan, null, 2)}\n`, "utf8")
writeFileSync(PLAN_MD_PATH, `${explainAssemblerPlan(plan)}\n`, "utf8")

for (const issue of planIssues) {
  const prefix = issue.severity === "error" ? "[fail]" : "[warn]"
  const output = `${prefix} AssemblerPlan: ${issue.type}: ${issue.message}`
  if (issue.severity === "error") {
    console.error(output)
  } else {
    console.warn(output)
  }
}

if (planIssues.some((issue) => issue.severity === "error")) {
  process.exit(1)
}

console.log(`[ok] AssemblerPlan: wrote ${PLAN_JSON_PATH}`)
console.log(`[ok] AssemblerPlan: wrote ${PLAN_MD_PATH}`)
