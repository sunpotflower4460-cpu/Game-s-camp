# Recipe System

- GameRecipe is the game assembly blueprint.
- AI must create or update GameRecipe before implementing.
- Recipe must not contain free-form code.
- Recipes are checked against Kit and Template registries for reference integrity and compatibility.
- Recipe should describe genre, target device, engine, template, input, rules, requiredKits, and tuning.

## Phase 4 note

Phase 4 keeps the GameRecipe schema validator, compatibility checks against registered Kit manifests, and adds template registry existence checks for `recipe.template`.
The schema source of truth is:
`src/forge/recipe/gameRecipe.zod.ts`
Compatibility checks live in:
`src/forge/compatibility/checkRecipeKitReferences.ts` and `src/forge/compatibility/checkRecipeCompatibility.ts`
Registry loading/validation used by compatibility scripts lives in:
`src/forge/template-registry/loadTemplateRegistry.ts` and `src/forge/template-registry/validateTemplateRegistry.ts`
The generated JSON Schema is:
`schemas/gameRecipe.schema.json`

## Core fields

- `schemaVersion`: required. Example: `"0.1"`.
- `id`: required. Use kebab-case, e.g. `puni-sumo-forest-v1`.
- Version suffixes such as `-v1` should change only when the recipe contract meaningfully changes; tuning-only adjustments can stay within the same version until schema policy is formalized.
- `title`: required.
- `genre`: required. Initial allowed values: `mini_action`, `puzzle`, `exploration`, `srpg`, `mystery_sandbox`.
- `targetDevice`: required. Allowed values: `mobile`, `pc`, `both`.
- `engine`: required in current schema. Initial value: `phaser`.
- `template`: required. A GameRecipe should select one main template.
- `input`: required.
- `durationSec`: optional but recommended for short games.
- `durationSec`: optional top-level whole-game duration limit in seconds.
- `requiredKits`: every referenced ID should exist in the Kit Registry.
- `optionalKits`: optional; missing IDs are reported as compatibility warnings.
- `tuning`: optional safe parameter area for per-Kit configuration values (`tuning.*`), distinct from top-level game-wide values such as `durationSec`.
- `constraints`: optional design constraints.
- `notesForAssembler`: optional non-code guidance for the future assembler.

## Validation note

- A Kit ID must not appear in both `requiredKits` and `optionalKits`.
- Duplicate kit IDs across recipe references are rejected.
- Required kits must exist in the Kit Registry.
- Recipe `template` / `engine` / `input` must be compatible with each referenced Kit manifest.
- Recipe `template` must exist in the Template Registry.

## Free-form code policy

GameRecipe must not contain executable code.

Allowed:
- numbers
- strings
- arrays
- enum-like values
- tuning parameters
- constraints
- non-executable notes

Forbidden:
- JavaScript / TypeScript snippets
- inline functions
- CSS blocks
- arbitrary source code
- hidden implementation logic
