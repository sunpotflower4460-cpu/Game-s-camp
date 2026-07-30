# Game’s Camp / AI Game Forge Agent Rules

## Core Identity

This repository is not a normal game repository.
It is an AI-oriented game creation forge.

## Non-negotiable Rules

1. Do not implement a game before creating or updating a GameRecipe.
2. Prefer existing Kits before creating new code.
3. New reusable parts must be added as Kits.
4. Game-specific logic should follow the future target structure defined in `docs/future-directory-layout.md`.
5. Until runtime directories exist, do not create new implementation paths casually. Treat paths such as `src/`, `recipes/`, `kits/`, `templates/`, `generated/`, and `custom/` as future target structure unless the current phase explicitly creates them.
6. Generated files must live under `generated/`.
7. Human/custom adjustments must live under `custom/`.
8. Never overwrite `custom/` from an assembler or generator.
9. Do not treat `generated/` as the source of truth.
10. Do not change architecture casually.
11. Playability comes before visual decoration.
12. Mobile usability must not be broken.
13. Every meaningful change must include validation instructions.
14. Do not mark work as complete without explaining what was verified.

## Working Order

1. Read README.md.
2. Read docs/concept.md.
3. Read docs/ai-workflow.md.
4. Read docs/recipe-system.md.
5. Read docs/kit-contracts.md.
6. Read docs/validation-gates.md.
7. Read docs/future-directory-layout.md.
8. Read docs/missing-kit-flow.md.
9. Only then make changes.

## Current Phase

Phase 6.2: Playable Puni Sumo.

Allowed in this phase:
- promoting all 7 `template.miniAction.v1` Kits from `phase: "skeleton"` to
  `phase: "runtime-ready"` (`KitDefinition`/`KitContext`/`KitFixtureMetadata.phase` is now
  `"skeleton" | "runtime-ready"`, not a fixed literal): `controller.puniPush.v1`,
  `controller.puniOpponentAI.v1`, `stage.circularArenaForest.v1`, `rule.ringOut.v1`,
  `camera.isometricSoft.v1`, `ui.roundTimer.v1`, `ui.resultScreen.v1`
- a genre-specific runtime Kit context (`MiniActionGameKitContext`/`MiniActionResultKitContext`
  in `src/runtime/scenes/miniActionKitContext.types.ts`) that `RuntimeKitRegistry<TContext>`
  (now generic over a context type) resolves each Kit against, so `MiniActionGameScene`/
  `MiniActionResultScene` iterate `definition.slots` and never branch on a specific Kit ID
- real gameplay in `MiniActionGameScene`: countdown, two Arcade-physics actors inside the
  stage Kit's arena, pointer/touch/mouse drag + keyboard-fallback player movement, opponent AI
  steering, push-on-collision physics, ring-out/timeout win-lose-draw judging (latched once),
  a round timer, and pause/tab-visibility handling that freezes elapsed time fairly
- real navigation/content in `MiniActionResultScene` (WIN/LOSE/DRAW + reason from the
  `resultUi` Kit, Replay/Back-to-Title with a double-click guard) and `MiniActionTitleScene`
  (mute toggle, start-gesture audio-context resume)
- pure, unit-tested physics/steering math extracted into
  `src/kits/shared/miniActionPhysics.ts` (drag-to-vector, decay, push impulse, ring-out check,
  timeout judging, chase-with-edge-avoidance steering)
- a `VITE_E2E`-gated debug hook (`src/runtime/scenes/miniActionDebugHook.ts`) exposing a
  deterministic AI seed, a shortened round timer, a forced result, and actor position
  overrides for Phase 6.4 Playwright runs — inert and absent from `window` otherwise

Not allowed in this phase:
- hand-editing `generated/`
- writing to `custom/` from runtime or generator code
- visual polish, procedural art, or audio — that is Phase 6.3
- reading `custom/` overrides at runtime — that is also Phase 6.3
- Playwright e2e automation itself (the debug hook is added now; using it in an automated
  suite is Phase 6.4)
- complex progression, monetization, or online features
- App Store / Capacitor packaging
- unrelated dependency upgrades

See `Game-s-camp_Claude_Code_Completion_Master.md` for the full Phase 6.0–6.5 plan.
