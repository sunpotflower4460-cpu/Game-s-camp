# Game’s Camp / AI Game Forge

Game’s Camp / AI Game Forge is an AI-oriented game creation forge (workshop OS), not a normal game repository.

## What this repository is

- Humans describe the game idea they want.
- AI creates or updates a GameRecipe first.
- AI selects existing Kits before writing new code.
- A future Assembler connects Templates and Kits to generate game output.
- GitHub-based validation gates verify playability and quality.

## Current implementation phase

Phase 2 adds schema foundations for GameRecipe and KitManifest.

This is not a game implementation yet.
Phaser, Puni Sumo gameplay, actual Kit implementations, Kit Registry compatibility checks, and Assembler work are intentionally not included in this phase.

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

Phase 2 introduces schema-based validation for GameRecipe and KitManifest examples.

```bash
npm run validate:recipes
npm run validate:kits
npm run generate:schemas
```

Current limits:

- Kit IDs in the sample recipe are placeholders until the Kit Registry exists.
- Kit manifest examples validate shape only.
- Entry file existence and compatibility checks are intentionally deferred to later phases.
