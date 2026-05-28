import { dirname } from "node:path"
import { writeFileSync } from "node:fs"

import type { AssemblerPlan } from "../src/forge/assembler/assemblerPlan.types"
import { validateAssemblerPlan } from "../src/forge/assembler/validateAssemblerPlan"
import { gameRecipeSchema } from "../src/forge/recipe/gameRecipe.zod"
import { renderTemplateSet } from "../src/forge/renderer/renderTemplateSet"
import type { RenderContextValue } from "../src/forge/renderer/renderContext.types"
import { validateRenderedOutput } from "../src/forge/renderer/validateRenderedOutput"
import { readJsonFile, ReadJsonFileError } from "../src/forge/shared/readJsonFile"
import {
  loadTemplateRegistry,
  LoadTemplateRegistryError,
} from "../src/forge/template-registry/loadTemplateRegistry"
import { validateTemplateRegistry } from "../src/forge/template-registry/validateTemplateRegistry"

const GAME_ID = "puni-sumo"
const RECIPE_PATH = "recipes/games/puni-sumo.recipe.json"
const PLAN_PATH = "plans/puni-sumo.assembler-plan.json"
const OUTPUT_DIR = "generated/games/puni-sumo"
const REPORT_PATH = `${OUTPUT_DIR}/render-report.md`
const SCENE_KEYS = {
  title: "TitleScene",
  game: "GameScene",
  result: "ResultScene",
} as const

function fail(message: string): never {
  console.error(`[fail] RenderDryRun: ${message}`)
  process.exit(1)
}

function readRequiredJson<T>(path: string): T {
  try {
    return readJsonFile(path) as T
  } catch (error) {
    if (error instanceof ReadJsonFileError) {
      fail(error.message)
    }
    throw error
  }
}

const rawRecipe = readRequiredJson<unknown>(RECIPE_PATH)
const parsedRecipe = gameRecipeSchema.safeParse(rawRecipe)
if (!parsedRecipe.success) {
  fail(`Invalid recipe schema: ${RECIPE_PATH}\n${JSON.stringify(parsedRecipe.error.format(), null, 2)}`)
}
const recipe = parsedRecipe.data

const plan = readRequiredJson<AssemblerPlan>(PLAN_PATH)
const planIssues = validateAssemblerPlan(plan)
for (const issue of planIssues) {
  const output = `${issue.type}: ${issue.message}`
  if (issue.severity === "error") {
    console.error(`[fail] RenderDryRun: ${output}`)
  } else {
    console.warn(`[warn] RenderDryRun: ${output}`)
  }
}
if (planIssues.some((issue) => issue.severity === "error")) {
  process.exit(1)
}
if (plan.recipeId !== recipe.id) {
  fail(`Recipe and plan mismatch: recipe.id=${recipe.id}, plan.recipeId=${plan.recipeId}`)
}
if (plan.templateId !== recipe.template) {
  fail(
    `Recipe and plan template mismatch: recipe.template=${recipe.template}, plan.templateId=${plan.templateId}`,
  )
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
    console.error(`[fail] RenderDryRun: ${errorMessage}`)
  }
  process.exit(1)
}

const templateEntry = templateRegistry.byId.get(recipe.template)
if (!templateEntry) {
  fail(`Template is not registered: ${recipe.template}`)
}

const slotAssignments = new Map<string, string>()
for (const assignment of [...plan.requiredAssignments, ...plan.optionalAssignments]) {
  slotAssignments.set(assignment.slotName, assignment.kitId)
}

const tokenReplacements: Record<string, RenderContextValue> = {
  "scene.title": SCENE_KEYS.title,
  "scene.game": SCENE_KEYS.game,
  "scene.result": SCENE_KEYS.result,
  "recipe.title": recipe.title,
  "recipe.engine": recipe.engine,
  "recipe.template": recipe.template,
}

for (const slot of [...templateEntry.manifest.requiredSlots, ...templateEntry.manifest.optionalSlots]) {
  tokenReplacements[`slot.${slot.name}`] = slotAssignments.get(slot.name) ?? "unassigned"
}

const renderContext = {
  gameId: GAME_ID,
  title: recipe.title,
  templateId: recipe.template,
  engine: recipe.engine,
  input: recipe.input,
  durationSec: recipe.durationSec ?? 0,
  requiredKitsJson: JSON.stringify(recipe.requiredKits, null, 2),
}

const renderResult = renderTemplateSet({
  templateEntry,
  context: renderContext,
  outputDir: OUTPUT_DIR,
  tokenReplacements,
})

const expectedFiles = Object.values(templateEntry.manifest.files).map((value) =>
  value.split("/").at(-1)?.replace(/\.tpl$/, ""),
)
if (expectedFiles.some((value) => !value)) {
  fail(`Template file mapping is invalid: ${templateEntry.manifestPath}`)
}

const outputValidation = validateRenderedOutput({
  outputDir: OUTPUT_DIR,
  expectedFiles: expectedFiles as string[],
})

for (const issue of outputValidation.issues) {
  const prefix = issue.severity === "error" ? "[fail]" : "[warn]"
  const printer = issue.severity === "error" ? console.error : console.warn
  printer(`${prefix} RenderDryRun: ${issue.message}`)
}

if (renderResult.unresolvedTokens.length > 0) {
  fail(`Unresolved tokens after rendering: ${renderResult.unresolvedTokens.join(", ")}`)
}
if (!outputValidation.ok) {
  process.exit(1)
}

const report = [
  "# Render Dry Run Report: puni-sumo",
  "",
  `- recipe: \`${RECIPE_PATH}\``,
  `- plan: \`${PLAN_PATH}\``,
  `- template: \`${templateEntry.manifest.id}\``,
  `- outputDir: \`${OUTPUT_DIR}\``,
  "",
  "## Rendered files",
  ...renderResult.files.map((file) => `- \`${file.outputPath}\` (from \`${file.sourcePath}\`)`),
  "",
  "## Safety checks",
  "- required output files: ok",
  "- unresolved placeholders: none",
  "",
  "## Scope notes",
  "- Phaser runtime integration: not included",
  "- Playable game wiring: not included",
  "- custom output generation: not included",
  "",
]

writeFileSync(REPORT_PATH, `${report.join("\n")}\n`, "utf8")
console.log(`[ok] RenderDryRun: wrote ${REPORT_PATH}`)
for (const file of renderResult.files) {
  console.log(`[ok] RenderDryRun: wrote ${file.outputPath}`)
}
console.log(`[ok] RenderDryRun: template directory ${dirname(templateEntry.manifestPath)}`)
