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

Phase 6.0: Runtime Foundation.

Allowed in this phase:
- `phaser` runtime dependency, exact-pinned (`4.2.1`)
- mounting a Phaser Canvas inside React (single instance, StrictMode-safe)
- the runtime contract under `src/runtime/phaser/` and `src/runtime/scenes/`
  (`PhaserGameHost`, `createPhaserGame`, `createPhaserConfig`, `destroyPhaserGame`,
  `RuntimeKitRegistry`, `runtimeKit.types`, `runtimeGameDefinition.types`, `mergeGameOverrides`)
- generic placeholder scenes that prove the Title → Game → Result flow and the
  `idle | loading | ready | playing | result | error` runtime state machine
- preparing (not yet consuming from `generated/`) a typed `GeneratedGameDefinition`
- a minimal Vitest-based runtime smoke test
- consolidating the old `src/runtime/*.ts` dead skeletons into the new runtime contract

Not allowed in this phase:
- hand-editing `generated/`
- writing to `custom/` from runtime or generator code
- actual Puni Sumo gameplay (player control, opponent AI, push/collision, ring-out,
  timer, win/lose) — that is Phase 6.2
- visual polish, procedural art, or audio — that is Phase 6.3
- generator changes that make `generated/games/puni-sumo/` runtime-consumable — that is Phase 6.1
- complex progression, monetization, or online features
- App Store / Capacitor packaging
- unrelated dependency upgrades

See `Game-s-camp_Claude_Code_Completion_Master.md` for the full Phase 6.0–6.5 plan.
