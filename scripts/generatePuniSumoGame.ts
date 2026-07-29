import { relative, sep } from "node:path"

import { createAssemblerPlan } from "../src/forge/assembler/createAssemblerPlan"
import type { AssemblerPlan } from "../src/forge/assembler/assemblerPlan.types"
import { validateAssemblerPlan } from "../src/forge/assembler/validateAssemblerPlan"
import { checkRecipeCompatibility } from "../src/forge/compatibility/checkRecipeCompatibility"
import { loadKitRegistry, LoadKitRegistryError } from "../src/forge/kit-registry/loadKitRegistry"
import { validateKitRegistry } from "../src/forge/kit-registry/validateKitRegistry"
import { gameRecipeSchema } from "../src/forge/recipe/gameRecipe.zod"
import { renderTemplateSet } from "../src/forge/renderer/renderTemplateSet"
import type { RenderContextValue } from "../src/forge/renderer/renderContext.types"
import { validateRenderedOutput } from "../src/forge/renderer/validateRenderedOutput"
import { pruneStaleGeneratedFiles } from "../src/forge/safety/pruneStaleGeneratedFiles"
import { writeGeneratedFile } from "../src/forge/safety/writeGeneratedFile"
import { readJsonFile, ReadJsonFileError } from "../src/forge/shared/readJsonFile"
import {
  loadTemplateRegistry,
  LoadTemplateRegistryError,
} from "../src/forge/template-registry/loadTemplateRegistry"
import { validateTemplateRegistry } from "../src/forge/template-registry/validateTemplateRegistry"

const GAME_DIR_SLUG = "puni-sumo"
const RECIPE_PATH = "recipes/games/puni-sumo.recipe.json"
const PLAN_PATH = "plans/puni-sumo.assembler-plan.json"
const GENERATED_ROOT = "generated"
const CUSTOM_ROOT = "custom"
const OUTPUT_DIR = `${GENERATED_ROOT}/games/${GAME_DIR_SLUG}`
const REPORT_FILENAME = "render-report.md"
const REPORT_PATH = `${OUTPUT_DIR}/${REPORT_FILENAME}`
const RUNTIME_TYPES_PATH = "src/runtime/phaser/runtimeGameDefinition.types"
const RUNTIME_SCENES_DIR = "src/runtime/scenes"
const SCENE_KEYS = {
  title: "TitleScene",
  game: "GameScene",
  result: "ResultScene",
} as const

function fail(message: string): never {
  console.error(`[fail] GeneratePuniSumoGame: ${message}`)
  process.exit(1)
}

// `JSON.stringify` does not escape U+2028 (LINE SEPARATOR) or U+2029 (PARAGRAPH SEPARATOR): they're
// valid unescaped inside a JS string literal, but they still terminate a `//` single-line comment
// (gameConfig.ts.tpl embeds `{{recipe.titleJson}}` in one). A free-text Recipe field containing
// either character would otherwise truncate that comment and splice the remainder of the title into
// the file as code. `\uXXXX` escapes are valid and equivalent inside a string literal, so escaping
// them here is safe everywhere this helper is used, not just inside comments.
function jsonStringifyEscaped(
  value: unknown,
  replacer?: (number | string)[] | null,
  space?: string | number,
): string {
  return JSON.stringify(value, replacer, space).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029")
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

function toRelativeImportPath(fromDir: string, toPath: string): string {
  const rel = relative(fromDir, toPath).split(sep).join("/")
  return rel.startsWith(".") ? rel : `./${rel}`
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
    console.error(`[fail] GeneratePuniSumoGame: ${output}`)
  } else {
    console.warn(`[warn] GeneratePuniSumoGame: ${output}`)
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
    console.error(`[fail] GeneratePuniSumoGame: ${errorMessage}`)
  }
  process.exit(1)
}

const templateEntry = templateRegistry.byId.get(recipe.template)
if (!templateEntry) {
  fail(`Template is not registered: ${recipe.template}`)
}
if (recipe.genre !== templateEntry.manifest.genre) {
  fail(
    `Recipe genre (${recipe.genre}) does not match Template genre (${templateEntry.manifest.genre}): ${templateEntry.manifest.id}`,
  )
}

const expectedFiles = Object.values(templateEntry.manifest.files).map((value) =>
  value.split("/").at(-1)?.replace(/\.tpl$/, ""),
)
if (expectedFiles.some((value) => !value)) {
  fail(`Template file mapping is invalid: ${templateEntry.manifestPath}`)
}
const expectedFileNames = expectedFiles as string[]
const duplicateOutputNames = [
  ...new Set(expectedFileNames.filter((name, index) => expectedFileNames.indexOf(name) !== index)),
]
if (duplicateOutputNames.length > 0) {
  fail(
    `Template file mapping produces colliding output filenames, so one logical output would silently overwrite another: ${duplicateOutputNames.join(", ")} (${templateEntry.manifestPath})`,
  )
}
if (expectedFileNames.includes(REPORT_FILENAME)) {
  fail(
    `Template file mapping produces an output named "${REPORT_FILENAME}", which is reserved for the generation report and would be silently overwritten by it: ${templateEntry.manifestPath}`,
  )
}

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
    console.error(`[fail] GeneratePuniSumoGame: ${errorMessage}`)
  }
  process.exit(1)
}

const compatibility = checkRecipeCompatibility(recipe, kitRegistry)
const compatibilityErrors = compatibility.issues.filter((issue) => issue.severity === "error")
for (const issue of compatibility.issues) {
  const prefix = issue.severity === "error" ? "[fail]" : "[warn]"
  const printer = issue.severity === "error" ? console.error : console.warn
  printer(`${prefix} GeneratePuniSumoGame: ${issue.code}: ${issue.message}`)
}
if (compatibilityErrors.length > 0) {
  process.exit(1)
}

function assignmentMap(assignments: AssemblerPlan["requiredAssignments"]): Map<string, string> {
  const map = new Map<string, string>()
  for (const assignment of assignments) {
    map.set(assignment.slotName, assignment.kitId)
  }
  return map
}

const freshPlan = createAssemblerPlan({ recipe, templateRegistry, kitRegistry })
const persistedAssignments = assignmentMap([...plan.requiredAssignments, ...plan.optionalAssignments])
const freshAssignments = assignmentMap([...freshPlan.requiredAssignments, ...freshPlan.optionalAssignments])
const allAssignedSlotNames = new Set([...persistedAssignments.keys(), ...freshAssignments.keys()])
const staleSlotMismatches: string[] = []
for (const slotName of allAssignedSlotNames) {
  const persistedKitId = persistedAssignments.get(slotName)
  const freshKitId = freshAssignments.get(slotName)
  if (persistedKitId !== freshKitId) {
    staleSlotMismatches.push(
      `slot "${slotName}": persisted plan has ${persistedKitId ?? "(unassigned)"}, current Recipe/Kit Registry/Template Registry resolve to ${
        freshKitId ?? "(unassigned)"
      }`,
    )
  }
}
if (staleSlotMismatches.length > 0) {
  fail(
    `Assembler Plan at ${PLAN_PATH} is stale relative to the current Recipe/Kit Registry/Template Registry. Re-run "npm run plan:assembler" to regenerate it.\n${staleSlotMismatches.join(
      "\n",
    )}`,
  )
}

const slotAssignments = persistedAssignments

for (const requiredSlot of templateEntry.manifest.requiredSlots) {
  if (!slotAssignments.has(requiredSlot.name)) {
    fail(`Required slot "${requiredSlot.name}" has no resolved Kit assignment in the Assembler Plan.`)
  }
}

const slotsForOutput: Record<string, string> = {}
for (const slot of [...templateEntry.manifest.requiredSlots, ...templateEntry.manifest.optionalSlots]) {
  const assignedKitId = slotAssignments.get(slot.name)
  if (assignedKitId) {
    slotsForOutput[slot.name] = assignedKitId
  }
}

const tokenReplacements: Record<string, RenderContextValue> = {
  "scene.title": SCENE_KEYS.title,
  "scene.game": SCENE_KEYS.game,
  "scene.result": SCENE_KEYS.result,
  "recipe.tuningJson": jsonStringifyEscaped(recipe.tuning ?? {}, null, 2).split("\n").join("\n  "),
  "plan.slotsJson": jsonStringifyEscaped(slotsForOutput, null, 2).split("\n").join("\n  "),
  "recipe.gameIdJson": jsonStringifyEscaped(recipe.id),
  "recipe.titleJson": jsonStringifyEscaped(recipe.title),
  "recipe.engineJson": jsonStringifyEscaped(recipe.engine),
  "recipe.templateIdJson": jsonStringifyEscaped(recipe.template),
  "import.runtimeTypes": toRelativeImportPath(OUTPUT_DIR, RUNTIME_TYPES_PATH),
  "import.scenes": toRelativeImportPath(OUTPUT_DIR, RUNTIME_SCENES_DIR),
}

const renderContext = {
  gameId: recipe.id,
  title: recipe.title,
  templateId: recipe.template,
  engine: recipe.engine,
  input: recipe.input,
  durationSec: recipe.durationSec ?? 0,
  requiredKitsJson: jsonStringifyEscaped(recipe.requiredKits, null, 2),
}

const renderResult = renderTemplateSet({
  templateEntry,
  context: renderContext,
  outputDir: OUTPUT_DIR,
  generatedRoot: GENERATED_ROOT,
  customRoot: CUSTOM_ROOT,
  tokenReplacements,
})

const outputValidation = validateRenderedOutput({
  outputDir: OUTPUT_DIR,
  expectedFiles: expectedFileNames,
})

for (const issue of outputValidation.issues) {
  const prefix = issue.severity === "error" ? "[fail]" : "[warn]"
  const printer = issue.severity === "error" ? console.error : console.warn
  printer(`${prefix} GeneratePuniSumoGame: ${issue.message}`)
}

if (renderResult.unresolvedTokens.length > 0) {
  fail(`Unresolved tokens after rendering: ${renderResult.unresolvedTokens.join(", ")}`)
}
if (!outputValidation.ok) {
  process.exit(1)
}

const prunedFiles = pruneStaleGeneratedFiles({
  generatedRoot: GENERATED_ROOT,
  customRoot: CUSTOM_ROOT,
  outputDir: OUTPUT_DIR,
  expectedFileNames: [...expectedFileNames, REPORT_FILENAME],
})
for (const prunedPath of prunedFiles) {
  console.log(`[ok] GeneratePuniSumoGame: removed stale ${prunedPath}`)
}

const report = [
  "# Generation Report: puni-sumo",
  "",
  `- recipe: \`${RECIPE_PATH}\``,
  `- plan: \`${PLAN_PATH}\``,
  `- template: \`${templateEntry.manifest.id}\``,
  `- outputDir: \`${OUTPUT_DIR}\``,
  "",
  "## Generated files",
  ...renderResult.files.map((file) => `- \`${file.outputPath}\` (from \`${file.sourcePath}\`)`),
  "",
  "## Safety checks",
  "- required output files: ok",
  "- unresolved placeholders: none",
  "- all writes went through the generated/custom safe writer",
  "",
  "## Scope notes",
  "- `gameDefinition.ts` is a real, typed GeneratedGameDefinition consumed by the Phase 6.0 Phaser runtime.",
  "- Scene wrappers are thin subclasses of src/runtime/scenes/MiniAction*Scene; no gameplay logic is generated.",
  "- No Kit is promoted out of phase: \"skeleton\" by this generation step.",
  "- custom/ output generation: not included.",
  "",
]

writeGeneratedFile({
  generatedRoot: GENERATED_ROOT,
  customRoot: CUSTOM_ROOT,
  outputPath: REPORT_PATH,
  contents: `${report.join("\n")}\n`,
})
console.log(`[ok] GeneratePuniSumoGame: wrote ${REPORT_PATH}`)
for (const file of renderResult.files) {
  console.log(`[ok] GeneratePuniSumoGame: wrote ${file.outputPath}`)
}
console.log(`[ok] GeneratePuniSumoGame: template directory ${templateEntry.manifestPath.split(sep).slice(0, -1).join("/")}`)
