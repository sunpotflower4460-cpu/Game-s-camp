# Future Directory Layout

This document defines the intended future structure for Game’s Camp / AI Game Forge.
As of Phase 6.1, GameRecipe/KitManifest/TemplateManifest schemas plus Kit/Template Registry and
recipe compatibility validation exist, runtime-neutral Kit skeletons are available under
`src/kits/` (including the new `controller.puniOpponentAI.v1`), a Phaser runtime foundation
exists under `src/runtime/phaser/` and `src/runtime/scenes/`, and `generated/games/puni-sumo/`
now contains a real, typed `GeneratedGameDefinition` that the runtime consumes directly, produced
by `npm run generate:game` from the Recipe + Assembler Plan + Template.

## Target structure

```txt
recipes/
  games/
    puni-sumo.recipe.json
kits/
  controllers/
    puni-push/
      kit.manifest.json
    puni-opponent-ai/
      kit.manifest.json
  cameras/
    isometric-soft/
      kit.manifest.json
  stages/
    circular-arena-forest/
      kit.manifest.json
  rules/
    ring-out/
      kit.manifest.json
  ui/
    round-timer/
      kit.manifest.json
    result-screen/
      kit.manifest.json
templates/
  mini-action/
    template.manifest.json
    rules.md
    files/
      gameDefinition.ts.tpl
      GameScene.ts.tpl
      TitleScene.ts.tpl
      ResultScene.ts.tpl
      gameConfig.ts.tpl
generated/
  games/
    puni-sumo/
      gameDefinition.ts
      GameScene.ts
      TitleScene.ts
      ResultScene.ts
      gameConfig.ts
custom/
  games/
    puni-sumo/
      customRules.ts
      customVisuals.ts
      customNotes.md
src/
  app/
  kits/
    shared/
      KitContext.ts
      KitDefinition.ts
      KitLifecycle.ts
    controllers/
      puniPush/
        PuniPushController.ts
        PuniPushController.fixture.ts
      puniOpponentAI/
        PuniOpponentAIController.ts
        PuniOpponentAIController.fixture.ts
    cameras/
      isometricSoft/
        IsometricSoftCamera.ts
        IsometricSoftCamera.fixture.ts
    stages/
      circularArenaForest/
        CircularArenaForest.ts
        CircularArenaForest.fixture.ts
    rules/
      ringOut/
        RingOutRule.ts
        RingOutRule.fixture.ts
    ui/
      roundTimer/
        RoundTimer.ts
        RoundTimer.fixture.ts
      resultScreen/
        ResultScreen.ts
        ResultScreen.fixture.ts
  runtime/
    phaser/
      PhaserGameHost.tsx
      createPhaserGame.ts
      createPhaserConfig.ts
      destroyPhaserGame.ts
      RuntimeKitRegistry.ts
      runtimeKit.types.ts
      runtimeGameDefinition.types.ts
      mergeGameOverrides.ts
    scenes/
      MiniActionTitleScene.ts
      MiniActionGameScene.ts
      MiniActionResultScene.ts
  forge/
    recipe/
    kit-registry/
    template-registry/
    compatibility/
    assembler/
    renderer/
    safety/
      writeGeneratedFile.ts
    report/
```

## Ownership rules

- `recipes/` contains GameRecipe files.
- `kits/` contains reusable game parts.
- `templates/` contains genre-level structure.
- `generated/` contains files written by the future Assembler.
- `custom/` contains human or AI custom adjustments that must never be overwritten by generation.
- `src/forge/` contains forge logic such as validators, registry, assembler, and reports.
- `src/runtime/` contains game runtime and preview runtime logic.

## generated vs custom

`generated/` may be overwritten by future assembler runs.

`custom/` must never be overwritten by future assembler runs.

If a change should survive regeneration, it belongs in `custom/`, a Kit, a Template, or a Recipe — not directly inside generated output.

## Phase 4.5 plans/

`plans/` contains pre-generation Assembler Plan artifacts.
These are not playable game outputs.
They are planning artifacts used before runtime-wired `generated/` output exists.

## Phase 5 generated dry-run (superseded by Phase 6.1)

Phase 5 originally rendered `generated/games/puni-sumo/` as dry-run placeholder output, not
wired into any runtime. That is no longer the current state — see "Phase 6.1 Forge-to-Runtime
Generation" below for what `generated/games/puni-sumo/` actually contains and how it's wired
today. This section is kept only for phase history.

## Phase 5.5 custom/

Phase 5.5 introduces the protected custom layer.
`custom/games/puni-sumo/` contains hand-authored or AI-authored files that must survive regeneration.
Renderer and assembler scripts must not write into `custom/`.

## Phase 6.0 src/runtime/

Phase 6.0 promotes `src/runtime/` from a state-type-only skeleton into a real runtime
contract, split into `src/runtime/phaser/` (Phaser Game lifecycle, Kit runtime registry,
typed `GeneratedGameDefinition`, override merge order) and `src/runtime/scenes/` (generic
placeholder Title/Game/Result scenes). The previous flat skeleton files
(`GameRuntime.ts`, `SceneHost.ts`, `InputManager.ts`, `AssetManager.ts`, `RuntimeEvents.ts`)
are consolidated into this contract rather than left as unused dead code.

This runtime did not yet read from `generated/games/puni-sumo/` in Phase 6.0; Phase 6.1 wired
that up. It now runs real Puni Sumo gameplay too (Phase 6.2) — see below.

## Phase 6.1 Forge-to-Runtime Generation

`generated/games/puni-sumo/gameDefinition.ts` is now a real, typed `GeneratedGameDefinition`
produced by `npm run generate:game` (`scripts/generatePuniSumoGame.ts`) from the Recipe +
Assembler Plan + Template — not hand-authored, and not a non-functional dry run. The generated
`TitleScene.ts` / `GameScene.ts` / `ResultScene.ts` are thin wrappers around
`src/runtime/scenes/MiniAction*Scene`; `gameConfig.ts` is a human-readable resolved-slot summary,
not consumed by the runtime. `src/app/PreviewShell.tsx` now mounts `PhaserGameHost` with this
generated definition instead of a hand-authored placeholder.

All generated-file writes go through `src/forge/safety/writeGeneratedFile.ts`, a common safe
writer that rejects path traversal, absolute-path escape, symlink escape, and any write under
`custom/` — replacing ad hoc `writeFileSync` calls in generator scripts. `generated/` and
`custom/` are also now part of the TypeScript project graph, so `tsc -b` catches import errors in
generated output and shape mismatches in custom overrides.

`src/kits/controllers/puniOpponentAI/` is a new reusable Kit skeleton (still
`phase: "skeleton"`, not runtime-ready) backing the Template's new `opponentController` slot;
Phase 6.2 promotes it (and every other `template.miniAction.v1` Kit) to `phase: "runtime-ready"`.

## Phase 6.2 Playable Puni Sumo

All 7 `template.miniAction.v1` Kits (`controller.puniPush.v1`, `controller.puniOpponentAI.v1`,
`stage.circularArenaForest.v1`, `rule.ringOut.v1`, `camera.isometricSoft.v1`, `ui.roundTimer.v1`,
`ui.resultScreen.v1`) are promoted from `phase: "skeleton"` to `phase: "runtime-ready"`, each now
exporting a runtime adapter factory (`createXRuntimeAdapter`) alongside its existing design-time
`createXKitDefinition`. `KitDefinition`/`KitContext`/`KitFixtureMetadata.phase` is now
`"skeleton" | "runtime-ready"` (`src/kits/shared/KitContext.ts`'s `KitPhase` type), not a fixed
`"skeleton"` literal.

`RuntimeKitRegistry` (`src/runtime/phaser/RuntimeKitRegistry.ts`) is now generic over a context
type (`RuntimeKitRegistry<TContext>`), so a Scene can hand its Kits genre-specific access instead
of nothing. `template.miniAction.v1`'s own context contract lives in
`src/runtime/scenes/miniActionKitContext.types.ts`: `MiniActionGameKitContext` (actors, arena
bounds, elapsed time, pause state, outcome reporting, the `VITE_E2E` debug override) for the six
gameplay slots, and a smaller `MiniActionResultKitContext` (just the settled outcome) for
`resultUi` — giving the UI Kit no physics access at all makes "a UI Kit must not alter physics"
true by construction. `src/runtime/scenes/registerMiniActionRuntimeKits.ts` maps each Kit ID to
its factory in a flat table (plus a slot-processing-order list ensuring `mainStage` sets arena
bounds before anything reads them) — Scenes iterate `definition.slots` and resolve, never
branching on a specific Kit ID.

`MiniActionGameScene` now creates two Arcade Physics actors inside the stage Kit's arena, runs a
3-2-1 countdown, combines each frame's controller-driven velocity with a separately-decaying
push-impulse velocity from actor-to-actor collisions (computed via pure functions in
`src/kits/shared/miniActionPhysics.ts`), freezes elapsed round time during countdown/pause/a
hidden tab, and transitions to `MiniActionResultScene` with the outcome once `rule.ringOut.v1`
reports one. `MiniActionResultScene` owns generic navigation chrome (Replay/Back-to-Title, a
double-click guard) around whatever `ui.resultScreen.v1` renders for the outcome it's handed.
`MiniActionTitleScene` adds a mute toggle and resumes the audio context on the Start gesture,
ahead of any audio Kit actually playing sound (Phase 6.3).

A `VITE_E2E`-gated debug hook (`src/runtime/scenes/miniActionDebugHook.ts`,
`window.__miniActionE2E`) exposes a deterministic AI wobble seed, a shortened round timer, a
forced result (consumed once reported, so it doesn't leak into the next Replay round), and actor
position overrides — for Phase 6.4's Playwright suite to drive deterministically, absent and
inert whenever `VITE_E2E` isn't `"true"`.
