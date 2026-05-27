# Game’s Camp / AI Game Forge

Game’s Camp / AI Game Forge is an AI-oriented game creation forge (workshop OS), not a normal game repository.

## What this repository is

- Humans describe the game idea they want.
- AI creates or updates a GameRecipe first.
- AI selects existing Kits before writing new code.
- A future Assembler connects Templates and Kits to generate game output.
- GitHub-based validation gates verify playability and quality.

## Current implementation phase

Phase 3 adds runtime-neutral Puni Sumo Kit skeletons on top of the Kit Registry and recipe compatibility validation from Phase 2.5.

This is not a game implementation yet.
Phaser, playable Puni Sumo gameplay, and Assembler work are intentionally not included in this phase.

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

Phase 3 validates GameRecipe, KitManifest, Kit Registry integrity (including entry/testFixture path existence), and recipe-to-kit compatibility.

```bash
npm run validate:recipes
npm run validate:kits
npm run validate:kit-registry
npm run validate:recipe-compatibility
npm run generate:schemas
```

Current limits:

- Kit Registry now checks duplicate Kit IDs, loadability, and entry/testFixture path existence.
- Recipe compatibility checks enforce required Kit existence and Kit/recipe engine-template-input consistency.
- Optional missing Kits are reported as warnings.
- Kit implementations in `src/kits/` are runtime-neutral skeletons only.

## Generated JSON Schemas

The files under `schemas/` are generated from the Zod sources in `src/forge/`.
They are committed to the repository so that external tools (LLM prompts,
editor integrations) can consume them without running the build.

If you modify the Zod schemas, regenerate the JSON Schemas with:

```bash
npm run generate:schemas
```

CI will fail if `schemas/` is out of sync with the source.

## Phase 3 verification checklist

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
