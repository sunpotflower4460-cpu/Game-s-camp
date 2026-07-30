# Copilot Instructions for Game’s Camp / AI Game Forge

This project is an AI game forge, not a normal game app.

## Mandatory principles

- GameRecipe must come before implementation.
- Existing Kit concepts must be preferred.
- generated/ and custom/ must be separated.
- custom/ must never be overwritten.

## Phase scope for this PR

- This PR is Phase 6.2: Playable Puni Sumo.
- All 7 `template.miniAction.v1` Kits (`controller.puniPush.v1`, `controller.puniOpponentAI.v1`,
  `stage.circularArenaForest.v1`, `rule.ringOut.v1`, `camera.isometricSoft.v1`,
  `ui.roundTimer.v1`, `ui.resultScreen.v1`) are promoted from `phase: "skeleton"` to
  `phase: "runtime-ready"`, each exporting a runtime adapter alongside its existing design-time
  `KitDefinition`. `KitDefinition`/`KitContext`/`KitFixtureMetadata.phase` is now
  `"skeleton" | "runtime-ready"`, not a fixed literal.
- `RuntimeKitRegistry` is now generic over a context type; `MiniActionGameScene`/
  `MiniActionResultScene` resolve each Kit ID from `definition.slots` against a genre-specific
  context (`MiniActionGameKitContext`/`MiniActionResultKitContext`) — never a per-Kit-ID switch.
- Real gameplay: countdown, drag/keyboard-driven player movement, chase-with-edge-avoidance
  opponent AI, Arcade-physics push-on-collision, ring-out/timeout win-lose-draw judging (latched
  once), a round timer, pause/tab-visibility handling, and a WIN/LOSE/DRAW result screen with
  Replay/Back-to-Title.
- Pure physics/steering math is extracted into `src/kits/shared/miniActionPhysics.ts` and unit
  tested in isolation from Phaser/Scene state.
- A `VITE_E2E`-gated debug hook exists for Phase 6.4's future Playwright determinism (seed,
  shortened timer, forced result, actor position overrides) — absent from `window` and inert
  otherwise.
- Do not add visual polish, procedural art, or audio yet (Phase 6.3).
- Do not read `custom/` overrides at runtime yet (also Phase 6.3).
- Do not add Playwright e2e automation itself yet (Phase 6.4) — the debug hook is groundwork for
  it, not automation.
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
