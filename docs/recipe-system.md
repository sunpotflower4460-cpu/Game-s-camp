# Recipe System

- GameRecipe is the game assembly blueprint.
- AI must create or update GameRecipe before implementing.
- Recipe must not contain free-form code.
- In future phases, Recipe should reference Kit IDs from the Kit Registry. During Phase 2, sample Kit IDs are placeholders and missing Kits should be declared as KitProposal candidates.
- Recipe should describe genre, target device, engine, template, input, rules, requiredKits, and tuning.

## Phase 2 note

Phase 2 adds the first executable GameRecipe schema and validator.
The schema source of truth is:
`src/forge/recipe/gameRecipe.zod.ts`
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
- `requiredKits`: placeholder values are allowed in this phase.
- `optionalKits`: optional.
- `tuning`: optional safe parameter area.
- `constraints`: optional design constraints.
- `notesForAssembler`: optional non-code guidance for the future assembler.

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
