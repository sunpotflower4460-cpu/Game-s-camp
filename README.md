# Game’s Camp / AI Game Forge

Game’s Camp / AI Game Forge is an AI-oriented game creation forge (workshop OS), not a normal game repository.

## What this repository is

- Humans describe the game idea they want.
- AI creates or updates a GameRecipe first.
- AI selects existing Kits before writing new code.
- A future Assembler connects Templates and Kits to generate game output.
- GitHub-based validation gates verify playability and quality.

## Current implementation phase

Phase 6.0 adds the Phaser runtime foundation on top of the Phase 5.5 protected custom layer
and generated/custom safety guard.

This is still not a playable game yet. Phase 6.0 wires a Phaser `Game` into React through a
single-responsibility runtime contract (`src/runtime/phaser/`, `src/runtime/scenes/`) and proves
the mount → boot → destroy lifecycle with generic placeholder scenes and a runtime state
machine (`idle | loading | ready | playing | result | error`). Actual Puni Sumo gameplay
(movement, opponent AI, push/collision, ring-out, timer, win/lose) is not included until
Phase 6.2, once Phase 6.1 wires real generated definitions into this runtime.

## Non-negotiable Rules

- Renderer and assembler scripts must never write into `custom/`.
- `generated/` can be regenerated.
- `custom/` is protected and persistent.

## Phase 5.1 semantic assignment cleanup

Phase 5.1 fixes semantic Kit-to-slot assignment.
The Assembler now uses Template slot `requiresProvides` and Kit manifest `provides` to avoid category-only mismatches.

## Local development

```bash
npm install
npm run dev
```

Other available commands:

```bash
npm run build       # type-check and build for production
npm run preview     # preview the production build locally
npm run typecheck   # type-check without emitting files
npm run test        # run Vitest runtime smoke tests once
npm run test:watch  # run Vitest in watch mode
```

## Recipe and Kit validation

Phase 4 validates GameRecipe, KitManifest, TemplateManifest, Kit/Template Registry integrity, and recipe compatibility against both Kit and Template registries.

```bash
npm run validate:recipes
npm run validate:kits
npm run validate:kit-registry
npm run validate:template-registry
npm run validate:compatibility
npm run plan:assembler
npm run render:dry-run
npm run generate:schemas
```

Current limits:

- Kit Registry checks duplicate Kit IDs, loadability, and entry/testFixture path existence.
- Template Registry checks duplicate Template IDs and template file placeholder references.
- Recipe compatibility checks enforce required Kit existence, Kit/recipe engine-template-input consistency, and recipe template existence in Template Registry.
- Assembler planning maps Recipe + Template slots + Kit manifests into a pre-generation plan under `plans/`.
- Safe renderer dry-run maps template placeholders into `generated/games/puni-sumo/` output and emits a render report.
- Optional missing Kits are reported as warnings.
- Kit implementations in `src/kits/` are runtime-neutral skeletons only.
- Generated files are placeholders only and are not wired into runtime execution.

## Assembler Plan + Dry Run Render

Phase 4.5 introduces an Assembler planning step.

```bash
npm run plan:assembler
npm run render:dry-run
```

This creates:

- `plans/puni-sumo.assembler-plan.json`
- `plans/puni-sumo.assembler-plan.md`
- `generated/games/puni-sumo/GameScene.ts`
- `generated/games/puni-sumo/TitleScene.ts`
- `generated/games/puni-sumo/ResultScene.ts`
- `generated/games/puni-sumo/gameConfig.ts`
- `generated/games/puni-sumo/render-report.md`

Current limits:

- The output is placeholder-only dry-run generation.
- Runtime wiring to app/runtime is intentionally deferred.
- Phaser integration is still deferred.
- `custom/` output is intentionally deferred.

## Custom layer and generated/custom safety
Phase 5.5 introduces a protected `custom/` layer and a generated/custom safety check.
`custom/` is still not read by the runtime yet — that is Phase 6.3.

## Phaser runtime foundation

Phase 6.0 adds the `phaser` dependency (exact-pinned `4.2.1`) and a runtime contract:

```txt
src/runtime/phaser/
  PhaserGameHost.tsx        React component: mounts/destroys exactly one Phaser.Game
  createPhaserGame.ts       new Phaser.Game(config) wrapper
  createPhaserConfig.ts     builds a Phaser.Types.Core.GameConfig from a GeneratedGameDefinition
  destroyPhaserGame.ts      null-safe game.destroy(true) wrapper
  RuntimeKitRegistry.ts     resolves Kit IDs to runtime adapters; fails clearly if unregistered
  runtimeKit.types.ts       RuntimeKitAdapter / RuntimeKitModule contracts
  runtimeGameDefinition.types.ts  GeneratedGameDefinition + RuntimeStatus types
  mergeGameOverrides.ts     Kit defaults -> Recipe tuning -> custom overrides merge order
src/runtime/scenes/
  MiniActionTitleScene.ts
  MiniActionGameScene.ts
  MiniActionResultScene.ts
```

These scenes are intentionally generic placeholders (Title → Game → Result) and do not yet
contain Puni Sumo gameplay. `RuntimeKitRegistry` resolution, `mergeGameOverrides`,
`destroyPhaserGame`, and `createPhaserConfig` are covered by Vitest unit tests under
`src/runtime/phaser/__tests__/`. The `canvas` devDependency is required so that importing
`phaser` itself (which feature-detects a 2D canvas context at module load time) does not throw
under Vitest's `jsdom` environment; it is test-only and is not part of the production bundle.

Full end-to-end boot verification (Title → Start → Playing → Finish → Result → Replay, on both
a desktop viewport and a 390×844 mobile viewport, with exactly one `<canvas>` at all times and no
page errors) was confirmed manually against the Vite dev server in this phase; automating it with
Playwright is Phase 6.4 scope.

## Current Phase
Phase 6.0: Runtime Foundation.
Allowed in this phase:
- `phaser` runtime dependency, exact-pinned
- Phaser Canvas mount inside React (StrictMode-safe, single instance, full cleanup on unmount)
- runtime registry / runtime contract under `src/runtime/phaser/` and `src/runtime/scenes/`
- generic placeholder scenes proving the Title/Game/Result flow and runtime state machine
- preparing (not yet consuming) a typed `GeneratedGameDefinition`
- Vitest-based runtime smoke tests
Not allowed in this phase:
- hand-editing `generated/`
- writing to `custom/` from runtime or generator code
- actual Puni Sumo gameplay (movement, AI, push, ring-out, timer, win/lose)
- visual polish, procedural art, or audio
- generator changes that make `generated/games/puni-sumo/` runtime-consumable (Phase 6.1)
- Playwright e2e tests (Phase 6.4)
- unrelated dependency upgrades

## Generated JSON Schemas

The files under `schemas/` are generated from the Zod sources in `src/forge/`.
They are committed to the repository so that external tools (LLM prompts,
editor integrations) can consume them without running the build.

If you modify the Zod schemas, regenerate the JSON Schemas with:

```bash
npm run generate:schemas
```

CI will fail if `schemas/` is out of sync with the source.

## Phase 6.0 verification checklist

Run the following commands and confirm all succeed:

```bash
npm ci
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
npm run build
```

A baseline audit recorded before Phase 6.0 work started is available at
`reports/baseline-audit.md`.
