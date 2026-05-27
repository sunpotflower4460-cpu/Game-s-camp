# Future Directory Layout

This document defines the intended future structure for Game’s Camp / AI Game Forge.
As of Phase 5, GameRecipe/KitManifest/TemplateManifest schemas plus Kit/Template Registry and recipe compatibility validation exist, runtime-neutral Kit skeletons are available under `src/kits/`, mini-action template placeholders are available under `templates/mini-action/files/`, and safe dry-run generated placeholders exist under `generated/games/puni-sumo/`.

## Target structure

```txt
recipes/
  games/
    puni-sumo.recipe.json
kits/
  controllers/
    puni-push/
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
      GameScene.ts.tpl
      TitleScene.ts.tpl
      ResultScene.ts.tpl
      gameConfig.ts.tpl
generated/
  games/
    puni-sumo/
      GameScene.ts
      TitleScene.ts
      ResultScene.ts
      gameConfig.ts
custom/
  games/
    puni-sumo/
      customRules.ts
      customVisuals.ts
      notes.md
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
  forge/
    recipe/
    kit-registry/
    template-registry/
    compatibility/
    assembler/
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
