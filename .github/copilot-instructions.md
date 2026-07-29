# Copilot Instructions for Game’s Camp / AI Game Forge

This project is an AI game forge, not a normal game app.

## Mandatory principles

- GameRecipe must come before implementation.
- Existing Kit concepts must be preferred.
- generated/ and custom/ must be separated.
- custom/ must never be overwritten.

## Phase scope for this PR

- This PR is Phase 6.1: Forge-to-Runtime Generation.
- The generator now produces a real, typed `GeneratedGameDefinition`
  (`generated/games/puni-sumo/gameDefinition.ts`) from the actual Recipe + Assembler Plan +
  Template — not a hand-authored placeholder — and the Phase 6.0 `PhaserGameHost` runtime now
  boots from that generated output.
- Generated Scene files (`TitleScene.ts`, `GameScene.ts`, `ResultScene.ts`) are thin wrappers
  extending the Phase 6.0 `MiniAction*Scene` classes; `gameConfig.ts` is a human-readable
  resolved-slot summary, not consumed by the runtime.
- The Template contract gains a required `opponentController` slot
  (`requiresProvides: ["opponentAI"]`) and a tightened `playerController` slot
  (`requiresProvides: ["playerMovement", "pushForce"]`).
- A new reusable Kit, `controller.puniOpponentAI.v1`, is added — manifest + registry entry +
  runtime-neutral skeleton only. It is not promoted to runtime-ready and no gameplay uses it yet.
- All generated-file writes go through a common safe writer that rejects path traversal,
  absolute-path escape, symlink escape, and any write under `custom/`.
- `generated/` and `custom/` are added to the TypeScript project graph.
- `render:dry-run` is replaced by `generate:game` (`scripts/generatePuniSumoGame.ts`), since the
  output is no longer a non-functional dry run.
- Do not implement playable Puni Sumo yet — no Kit is promoted out of `phase: "skeleton"`, and no
  gameplay (movement, AI, push, ring-out, timer, win/lose) is in scope (Phase 6.2).
- Do not add visual polish, procedural art, or audio yet (Phase 6.3).
- Do not let generator scripts write into `custom/`.

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
npm run generate:game
npm run check:generated-custom-safety
npm run generate:schemas
npm run test
npm run test:watch
```

## Future commands (not available yet)

The following commands are planned for future phases. They are not runnable yet.

```txt
npm run lint
npm run verify:forge
npm run test:e2e
```
