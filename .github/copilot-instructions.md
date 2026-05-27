# Copilot Instructions for Game’s Camp / AI Game Forge

This project is an AI game forge, not a normal game app.

## Mandatory principles

- GameRecipe must come before implementation.
- Existing Kit concepts must be preferred.
- generated/ and custom/ must be separated.
- custom/ must never be overwritten.

## Phase scope for this PR

- This PR is Phase 3.
- GameRecipe and KitManifest schema/validator foundations are available.
- Kit Registry loading/validation (including entry/testFixture path checks) and recipe compatibility checks are in scope.
- Runtime-neutral Kit skeleton files under `src/kits/` are in scope.
- Do not add Phaser yet.
- Do not implement playable Puni Sumo yet.
- Do not add actual Kit runtime implementation or Assembler logic yet.

## Currently available commands

```txt
npm run dev
npm run build
npm run preview
npm run typecheck
npm run validate:recipes
npm run validate:kits
npm run validate:kit-registry
npm run validate:recipe-compatibility
npm run generate:schemas
```

## Future commands (not available yet)

The following commands are planned for future phases. They are not runnable yet.

```txt
npm run lint
npm run test
npm run test:e2e
```
