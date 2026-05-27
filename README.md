# Game’s Camp / AI Game Forge

Game’s Camp / AI Game Forge is an AI-oriented game creation forge (workshop OS), not a normal game repository.

## What this repository is

- Humans describe the game idea they want.
- AI creates or updates a GameRecipe first.
- AI selects existing Kits before writing new code.
- A future Assembler connects Templates and Kits to generate game output.
- GitHub-based validation gates verify playability and quality.

## Current implementation phase

Phase 2.5 adds Kit Registry and recipe compatibility validation on top of the schema foundations.

This is not a game implementation yet.
Phaser, Puni Sumo gameplay, actual Kit implementations, and Assembler work are intentionally not included in this phase.

## Local development

```bash
npm install
npm run dev
```

Other available commands:

```bash
npm run build       # type-check and build for production
npm run preview     # preview the production build locally
npm run typecheck   # type-check without emitting files
```

## Recipe and Kit validation

Phase 2.5 validates GameRecipe, KitManifest, Kit Registry integrity, and recipe-to-kit compatibility.

```bash
npm run validate:recipes
npm run validate:kits
npm run validate:kit-registry
npm run validate:recipe-compatibility
npm run generate:schemas
```

Current limits:

- Kit Registry now checks duplicate Kit IDs and loadability.
- Recipe compatibility checks enforce required Kit existence and Kit/recipe engine-template-input consistency.
- Optional missing Kits are reported as warnings.
- Entry file existence checks are still deferred to later phases.

## Generated JSON Schemas

The files under `schemas/` are generated from the Zod sources in `src/forge/`.
They are committed to the repository so that external tools (LLM prompts,
editor integrations) can consume them without running the build.

If you modify the Zod schemas, regenerate the JSON Schemas with:

```bash
npm run generate:schemas
```

CI will fail if `schemas/` is out of sync with the source.

## Phase 2.5 verification checklist

Run the following commands and confirm all succeed:

```bash
npm ci
npm run typecheck
npm run validate:recipes
npm run validate:kits
npm run validate:kit-registry
npm run validate:recipe-compatibility
npm run generate:schemas
npm run build
```
