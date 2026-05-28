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

## Phase 4.5 Assembler Plan

Phase 4.5 adds an Assembler Plan step.
A GameRecipe is not rendered directly into game files yet.
Instead, the forge creates an Assembler Plan that maps:
- Recipe
- Template
- required Kit slots
- optional Kit slots
into a human/AI-readable plan.

## Phase 5 Safe Renderer Dry Run

Phase 5 reads the Assembler Plan and template placeholder files, then writes safe dry-run output under `generated/games/puni-sumo/`.
The renderer performs minimal token replacement only and validates that no unresolved placeholders remain.
This phase still does not wire output into runtime and does not create playable gameplay.

## Phase 5.1 semantic assignment

Phase 5.1 strengthens Assembler planning by matching Template slots to Kit capabilities.
The Assembler now considers:
- slot category,
- slot `requiresProvides`,
- Kit manifest `provides`,
- Recipe required/optional Kit order.

## Phase 5.5 custom layer

The custom layer is not part of GameRecipe yet.
For now, it is a protected filesystem area for future custom adjustments.
Recipe remains the source of generative intent.  
Custom files are persistent local adjustments that must not be overwritten by generation.

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
