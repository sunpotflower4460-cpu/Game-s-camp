# Copilot Instructions for Game’s Camp / AI Game Forge

This project is an AI game forge, not a normal game app.

## Mandatory principles

- GameRecipe must come before implementation.
- Existing Kit concepts must be preferred.
- generated/ and custom/ must be separated.
- custom/ must never be overwritten.

## Phase scope for this PR

- This PR is Phase 5.5.
- GameRecipe, KitManifest, and TemplateManifest schema/validator foundations are available.
- Kit Registry and Template Registry loading/validation are in scope.
- Recipe compatibility checks include template registry existence checks.
- Assembler plan generation plus safe dry-run rendering into `generated/games/puni-sumo/` are in scope.
- Protected custom layer skeleton files under `custom/games/puni-sumo/` are in scope.
- generated/custom safety checks and CI wiring are in scope.
- Do not add Phaser yet.
- Do not implement playable Puni Sumo yet.
- Do not wire generated output into runtime yet.
- Do not wire custom output into runtime yet.
- Do not let renderer/assembler scripts write into `custom/`.
- Do not add actual runtime scene implementation yet.

## Currently available commands

```txt
npm run dev
npm run build
npm run preview
npm run typecheck
npm run validate:recipes
npm run validate:kits
npm run validate:kit-registry
npm run validate:template-registry
npm run validate:compatibility
npm run plan:assembler
npm run render:dry-run
npm run check:generated-custom-safety
npm run generate:schemas
```

## Future commands (not available yet)

The following commands are planned for future phases. They are not runnable yet.

```txt
npm run lint
npm run test
npm run test:e2e
```
