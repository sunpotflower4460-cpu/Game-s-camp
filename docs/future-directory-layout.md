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

## Phase 5 generated dry-run

`generated/games/puni-sumo/` now contains dry-run placeholder outputs rendered from `.tpl` files.
These are still non-playable and not wired into runtime.

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

This runtime did not yet read from `generated/games/puni-sumo/` in Phase 6.0; Phase 6.1 wires
that up. It does not yet run Puni Sumo gameplay (Phase 6.2).

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
`phase: "skeleton"`, not runtime-ready) backing the Template's new `opponentController` slot.
