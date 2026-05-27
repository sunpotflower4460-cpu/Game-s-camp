import { gameRecipeSchema } from "./gameRecipe.zod"
import { readJsonFile } from "../shared/readJsonFile"
import {
  formatValidationFailure,
  formatValidationSuccess,
} from "../shared/validationResult"

const recipePath = process.argv[2]

if (!recipePath) {
  console.error("Usage: tsx src/forge/recipe/validateRecipe.ts <path-to-recipe.json>")
  process.exit(1)
}

const parsed = gameRecipeSchema.safeParse(readJsonFile(recipePath))

if (parsed.success) {
  console.log(formatValidationSuccess("GameRecipe", recipePath))
} else {
  console.error(formatValidationFailure("GameRecipe", recipePath))
  console.error(JSON.stringify(parsed.error.format(), null, 2))
  process.exit(1)
}
