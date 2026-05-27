# Game’s Camp / AI Game Forge

Game’s Camp / AI Game Forge is an AI-oriented game creation forge (workshop OS), not a normal game repository.

## What this repository is

- Humans describe the game idea they want.
- AI creates or updates a GameRecipe first.
- AI selects existing Kits before writing new code.
- A future Assembler connects Templates and Kits to generate game output.
- GitHub-based validation gates verify playability and quality.

## Current implementation phase

Phase 4 adds the first Template skeleton (`mini-action`) on top of Phase 3 Kit Registry and compatibility foundations.

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

Phase 4 validates GameRecipe, KitManifest, TemplateManifest, Kit/Template Registry integrity, and recipe compatibility against both Kit and Template registries.

```bash
npm run validate:recipes
npm run validate:kits
npm run validate:kit-registry
npm run validate:template-registry
npm run validate:recipe-compatibility
npm run generate:schemas
```

Current limits:

- Kit Registry checks duplicate Kit IDs, loadability, and entry/testFixture path existence.
- Template Registry checks duplicate Template IDs and template file placeholder references.
- Recipe compatibility checks enforce required Kit existence, Kit/recipe engine-template-input consistency, and recipe template existence in Template Registry.
- Optional missing Kits are reported as warnings.
- Kit implementations in `src/kits/` are runtime-neutral skeletons only.
- Template files in `templates/mini-action/files/` are placeholders only (no generated output yet).

## Generated JSON Schemas

The files under `schemas/` are generated from the Zod sources in `src/forge/`.
They are committed to the repository so that external tools (LLM prompts,
editor integrations) can consume them without running the build.

If you modify the Zod schemas, regenerate the JSON Schemas with:

```bash
npm run generate:schemas
```

CI will fail if `schemas/` is out of sync with the source.

## Phase 4 verification checklist

Run the following commands and confirm all succeed:

```bash
npm ci
npm run typecheck
npm run validate:recipes
npm run validate:kits
npm run validate:kit-registry
npm run validate:template-registry
npm run validate:recipe-compatibility
npm run generate:schemas
npm run build
```
