# Copilot Instructions for Game’s Camp / AI Game Forge

This project is an AI game forge, not a normal game app.

## Mandatory principles

- GameRecipe must come before implementation.
- Existing Kit concepts must be preferred.
- generated/ and custom/ must be separated.
- custom/ must never be overwritten.

## Phase scope for this PR

- This PR is Phase 5.1.
- GameRecipe, KitManifest, and TemplateManifest schema/validator foundations are available.
- Kit Registry and Template Registry loading/validation are in scope.
- Recipe compatibility checks include template registry existence checks.
- Assembler semantic slot assignment (`requiresProvides` / `provides`) and plan creation/validation/explanation are in scope.
- Runtime-neutral Kit skeleton files under `src/kits/` and template placeholders under `templates/mini-action/files/` are in scope.
- Safe template dry-run rendering into `generated/games/puni-sumo/` is in scope.
- Do not add Phaser yet.
- Do not implement playable Puni Sumo yet.
- Do not wire generated output into runtime yet.
- Do not generate `custom/` output yet.
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
npm run generate:schemas
```

## Future commands (not available yet)

The following commands are planned for future phases. They are not runnable yet.

```txt
npm run lint
npm run test
npm run test:e2e
```
