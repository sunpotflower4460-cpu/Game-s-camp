# Copilot Instructions for Game’s Camp / AI Game Forge

This project is an AI game forge, not a normal game app.

## Mandatory principles

- GameRecipe must come before implementation.
- Existing Kit concepts must be preferred.
- generated/ and custom/ must be separated.
- custom/ must never be overwritten.

## Phase scope for this PR

- This PR is Phase 6.0: Runtime Foundation.
- GameRecipe, KitManifest, and TemplateManifest schema/validator foundations remain unchanged.
- Kit Registry, Template Registry, compatibility checks, Assembler plan, and dry-run renderer remain unchanged from Phase 5.5.
- `phaser` (exact `4.2.1`) is added as a runtime dependency.
- A runtime contract is introduced under `src/runtime/phaser/` and `src/runtime/scenes/`: Phaser Game creation/destruction is centralized, React mounts exactly one Phaser instance per `PhaserGameHost` lifetime (StrictMode-safe), and a `RuntimeKitRegistry` resolves Kit IDs to runtime adapters, failing clearly when a Kit is unregistered.
- Only generic placeholder scenes are in scope (Title → Game → Result flow, runtime status transitions). No Puni Sumo-specific gameplay (movement, AI, push, ring-out, timer, win/lose) is in scope.
- `Vitest` is introduced for runtime smoke tests.
- Do not implement playable Puni Sumo yet.
- Do not wire `generated/games/puni-sumo/` output into the runtime yet (Phase 6.1).
- Do not wire `custom/` output into the runtime yet (Phase 6.3).
- Do not let renderer/assembler scripts write into `custom/`.
- Do not add visual polish, procedural art, or audio yet (Phase 6.3).

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
npm run test
npm run test:watch
```

## Future commands (not available yet)

The following commands are planned for future phases. They are not runnable yet.

```txt
npm run lint
npm run generate:game
npm run verify:forge
npm run test:e2e
```
