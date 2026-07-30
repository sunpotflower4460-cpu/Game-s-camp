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

Phase 6.1: Forge-to-Runtime Generation.

Allowed in this phase:
- generator changes that make `generated/games/puni-sumo/` runtime-consumable: a real,
  typed `GeneratedGameDefinition` object (`generated/games/puni-sumo/gameDefinition.ts`)
  produced from the actual Recipe + Assembler Plan + Template, not hand-authored
- thin generated Scene wrapper files that extend the Phase 6.0
  `src/runtime/scenes/MiniAction*Scene` classes with the generated definition
- wiring that generated output into the Phase 6.0 `PhaserGameHost` runtime, replacing the
  Phase 6.0 hand-authored placeholder definition
- evolving the Template contract: a new required `opponentController` slot
  (`requiresProvides: ["opponentAI"]`) and a tightened `playerController` slot
  (`requiresProvides: ["playerMovement", "pushForce"]`)
- adding `controller.puniOpponentAI.v1` as a new reusable Kit — manifest, registry
  registration, and a runtime-neutral **skeleton** implementation only (still
  `phase: "skeleton"`; runtime-ready promotion is Phase 6.2)
- a common safe writer for all generated output (path traversal / absolute-path /
  symlink-escape / `custom/` rejection), with unit tests, replacing ad hoc `writeFileSync`
  calls in generator scripts
- making the generated/custom-safety check discover generator scripts generically instead
  of relying on a hardcoded script list
- adding `generated/` and `custom/` to the TypeScript project graph so `tsc -b` catches
  import errors in generated output and shape mismatches in custom overrides

Not allowed in this phase:
- hand-editing `generated/`
- writing to `custom/` from runtime or generator code
- promoting any Kit (including the new `controller.puniOpponentAI.v1`) out of
  `phase: "skeleton"`, or any actual Puni Sumo gameplay (player control, opponent AI,
  push/collision, ring-out, timer, win/lose) — that is Phase 6.2
- visual polish, procedural art, or audio — that is Phase 6.3
- complex progression, monetization, or online features
- App Store / Capacitor packaging
- unrelated dependency upgrades

See `Game-s-camp_Claude_Code_Completion_Master.md` for the full Phase 6.0–6.5 plan.
