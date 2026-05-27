import { mkdirSync, writeFileSync } from "node:fs"
import { zodToJsonSchema } from "zod-to-json-schema"

import { gameRecipeSchema } from "../src/forge/recipe/gameRecipe.zod"
import { kitManifestSchema } from "../src/forge/kit-registry/kitManifest.zod"
import { templateManifestSchema } from "../src/forge/template-registry/templateManifest.zod"

mkdirSync("schemas", { recursive: true })

const gameRecipeJsonSchema = zodToJsonSchema(gameRecipeSchema, "GameRecipe")
const kitManifestJsonSchema = zodToJsonSchema(kitManifestSchema, "KitManifest")
const templateManifestJsonSchema = zodToJsonSchema(
  templateManifestSchema,
  "TemplateManifest",
)

writeFileSync(
  "schemas/gameRecipe.schema.json",
  `${JSON.stringify(gameRecipeJsonSchema, null, 2)}\n`,
  "utf-8",
)

writeFileSync(
  "schemas/kitManifest.schema.json",
  `${JSON.stringify(kitManifestJsonSchema, null, 2)}\n`,
  "utf-8",
)

writeFileSync(
  "schemas/templateManifest.schema.json",
  `${JSON.stringify(templateManifestJsonSchema, null, 2)}\n`,
  "utf-8",
)

console.log("Generated schemas/gameRecipe.schema.json")
console.log("Generated schemas/kitManifest.schema.json")
console.log("Generated schemas/templateManifest.schema.json")
