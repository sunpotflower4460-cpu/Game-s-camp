# Future Directory Layout

This document defines the intended future structure for Game’s Camp / AI Game Forge.
Phase 0.1 is documentation-only. These directories are not required to exist yet.

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
templates/
  mini-action/
    template.manifest.json
    rules.md
    files/
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
  runtime/
  forge/
    recipe/
    kit-registry/
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
