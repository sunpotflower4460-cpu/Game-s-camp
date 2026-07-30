# Game’s Camp / AI Game Forge

Game’s Camp / AI Game Forge is an AI-oriented game creation forge (workshop OS), not a normal game repository.

## What this repository is

- Humans describe the game idea they want.
- AI creates or updates a GameRecipe first.
- AI selects existing Kits before writing new code.
- A future Assembler connects Templates and Kits to generate game output.
- GitHub-based validation gates verify playability and quality.

## Current implementation phase

Phase 6.2 makes 森のぷに相撲 (Puni Sumo) actually playable.

Drag your Puni to push the opponent out of the circular ring within 60 seconds; if time runs
out, whoever is closer to the center wins (a near-tie is a draw). All 7 `template.miniAction.v1`
Kits (`controller.puniPush.v1`, `controller.puniOpponentAI.v1`, `stage.circularArenaForest.v1`,
`rule.ringOut.v1`, `camera.isometricSoft.v1`, `ui.roundTimer.v1`, `ui.resultScreen.v1`) are
promoted from `phase: "skeleton"` to `phase: "runtime-ready"`, with real movement/AI-steering/
push-physics/ring-out-and-timeout-judging/camera-follow/timer/result-presentation logic —
resolved generically through `RuntimeKitRegistry` (now parameterized over a genre-specific
context type), never hardcoded by Kit ID in a Scene. Visual/audio polish and reading `custom/`
overrides at runtime are still not included — that is Phase 6.3.

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
npm run generate:game
npm run generate:schemas
```

Current limits:

- Kit Registry checks duplicate Kit IDs, loadability, and entry/testFixture path existence.
- Template Registry checks duplicate Template IDs and template file placeholder references.
- Recipe compatibility checks enforce required Kit existence, Kit/recipe engine-template-input consistency, and recipe template existence in Template Registry.
- Assembler planning maps Recipe + Template slots + Kit manifests into a pre-generation plan under `plans/`.
- The generator maps template placeholders into a real, runtime-consumable `generated/games/puni-sumo/` output and emits a render report.
- Optional missing Kits are reported as warnings.
- All 7 `template.miniAction.v1` Kit implementations in `src/kits/` are `phase: "runtime-ready"`
  as of Phase 6.2, each exporting a runtime adapter factory registered by
  `src/runtime/scenes/registerMiniActionRuntimeKits.ts`.
- Generated files are consumed by the Phase 6.0 runtime, and every required Kit now implements
  real gameplay behind it (Phase 6.2).

## Assembler Plan + Generation

Phase 4.5 introduced the Assembler planning step; Phase 6.1 replaced the former placeholder-only
`render:dry-run` with a real generator.

```bash
npm run plan:assembler
npm run generate:game
```

This creates:

- `plans/puni-sumo.assembler-plan.json`
- `plans/puni-sumo.assembler-plan.md`
- `generated/games/puni-sumo/gameDefinition.ts` — a real, typed `GeneratedGameDefinition`
- `generated/games/puni-sumo/TitleScene.ts` / `GameScene.ts` / `ResultScene.ts` — thin wrappers
  extending `src/runtime/scenes/MiniAction*Scene`, constructed with the generated definition
- `generated/games/puni-sumo/gameConfig.ts` — a human-readable resolved-slot summary (not
  consumed by the runtime)
- `generated/games/puni-sumo/render-report.md`

Current limits:

- The generated Scenes (`TitleScene`/`GameScene`/`ResultScene`) are still thin wrappers around
  the shared `src/runtime/scenes/MiniAction*Scene` runtime classes, which is where the actual
  Puni Sumo gameplay lives (Phase 6.2) — kept generic to the `mini_action` genre rather than
  hand-authored per game, per the Kit-first/Recipe-first architecture.
- `custom/` output generation is still deferred (Phase 6.3); `custom/` may only be read, never
  written, by generator or runtime code.

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
  MiniActionTitleScene.ts             mute toggle, start-gesture audio-context resume
  MiniActionGameScene.ts              countdown, physics actors, timer, ring-out/timeout judging
  MiniActionResultScene.ts            navigation chrome around the resultUi Kit's WIN/LOSE/DRAW
  miniActionKitContext.types.ts       MiniActionGameKitContext / MiniActionResultKitContext
  miniActionTuning.ts                 getTuningNumber() helper
  miniActionDebugHook.ts              VITE_E2E-gated window.__miniActionE2E debug API
  registerMiniActionRuntimeKits.ts    kitId -> runtime adapter factory tables (no per-Kit switch)
src/kits/shared/
  miniActionPhysics.ts   pure, unit-tested physics/steering math (drag vector, decay, push
                          impulse, ring-out check, timeout judging, chase-with-edge-avoidance)
```

`RuntimeKitRegistry` is generic over a genre-specific context type
(`RuntimeKitRegistry<TContext>`); `MiniActionGameScene`/`MiniActionResultScene` resolve each Kit
ID from `definition.slots` against it and call the resulting adapter's `onCreate`/`onMount`/
`onUpdate`/`onDispose` — no Scene branches on which Kit ID a slot holds. `RuntimeKitRegistry`
resolution, `mergeGameOverrides`, `destroyPhaserGame`, `createPhaserConfig`, the pure physics
functions, and the pure-logic Kits (`rule.ringOut.v1`, `controller.puniOpponentAI.v1`, via a fake
context) are covered by Vitest unit tests. The scene-touching Kits
(`controller.puniPush.v1`, `stage.circularArenaForest.v1`, `camera.isometricSoft.v1`,
`ui.roundTimer.v1`, `ui.resultScreen.v1`) and the Scenes themselves need a real, booted Phaser
instance to test meaningfully — this project defers that to manual browser verification now and
Phase 6.4 Playwright automation, the same split Phase 6.0/6.1 used for other Phaser-boot-dependent
checks. The `canvas` devDependency is required so that importing `phaser` itself (which
feature-detects a 2D canvas context at module load time) does not throw under Vitest's `jsdom`
environment; it is test-only and is not part of the production bundle.

Full end-to-end play (Title → Start → Countdown → real drag/AI/physics/timer/ring-out or
timeout → Result → Replay/Back to Title, on a 390×844 mobile viewport, with exactly one
`<canvas>` at all times and no console/page errors) was confirmed manually against the Vite dev
server, including natural (non-forced) round resolution; automating it with Playwright is Phase
6.4 scope. The `VITE_E2E`-gated debug hook (`window.__miniActionE2E`) exists now so that
automation has a deterministic seed/shortened-timer/forced-result/actor-position surface to
drive, without any always-on debug API in a production build.

## Current Phase
Phase 6.2: Playable Puni Sumo.
Allowed in this phase:
- promoting all 7 `template.miniAction.v1` Kits to `phase: "runtime-ready"` with real gameplay
- a genre-specific runtime Kit context + a generic `RuntimeKitRegistry<TContext>`
- real countdown/physics/movement/AI/push/ring-out/timeout/timer/result gameplay in the Scenes
- pure, unit-tested physics/steering math extracted into `src/kits/shared/miniActionPhysics.ts`
- a `VITE_E2E`-gated debug hook for future Playwright determinism
Not allowed in this phase:
- hand-editing `generated/`
- writing to `custom/` from runtime or generator code
- visual polish, procedural art, or audio (Phase 6.3)
- reading `custom/` overrides at runtime (also Phase 6.3)
- Playwright e2e automation itself (Phase 6.4)
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

## Phase 6.2 verification checklist

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
npm run generate:game
npm run check:generated-custom-safety
npm run generate:schemas
npm run test
npm run build
```

A baseline audit recorded before Phase 6.0 and Phase 6.1 work started is available at
`reports/baseline-audit.md`.
