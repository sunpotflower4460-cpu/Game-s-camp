import { gameRecipeSchema } from "../src/forge/recipe/gameRecipe.zod"
import { validateAll } from "./lib/validateAll"

validateAll({
  label: "GameRecipe",
  rootDir: "recipes",
  suffix: ".recipe.json",
  schema: gameRecipeSchema,
})
