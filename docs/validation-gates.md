# Validation Gates

This document defines validation policy for future implementation phases.
Phase 2 introduces schema-level validators for GameRecipe and KitManifest.
Full Gate A (compatibility) and Gate B (playability) automation is planned
for later phases.

## Gate A: Playable Gate

- build succeeds
- recipe validation succeeds
- kit validation succeeds
- compatibility check succeeds
- app boots
- no critical console errors
- mobile layout is not critically broken
- player can start
- win/lose/result can be reached

## Gate B: Quality Gate

- controls feel responsive
- UI is readable
- load is not too heavy
- visual density is comfortable
- play time matches target
- tutorial or guidance is sufficient

## Validation categories

### Machine-check

Checks that should eventually run through scripts or CI.

- build succeeds
- typecheck succeeds
- lint succeeds
- recipe validation succeeds
- kit validation succeeds
- compatibility check succeeds
- assembler plan generation succeeds
- dry-run render generation succeeds
- no critical console errors

### Automated e2e-check

Checks that should eventually run through Playwright or browser automation.

- app boots
- game canvas/root appears
- mobile viewport smoke test passes
- player can start
- timer can progress
- result screen can be reached

### Human-check

Checks that require human playtest or creative judgment.

- controls feel responsive
- UI is readable
- visual density is comfortable
- play time feels right
- tutorial or guidance is sufficient
- the game feels fun enough for MVP

## Semantic assignment validation

Assembler Plan validation must fail when a Kit does not satisfy the slot's required capabilities.
Example:
- `resultUi` requires `resultScreen`
- `ui.roundTimer.v1` provides `roundTimerHud`
- This assignment must fail.

## Generated/custom safety

Phase 5.5 adds a generated/custom safety check.
The check verifies:
- `generated/` exists,
- `custom/` exists,
- neither directory is nested inside the other,
- renderer/assembler scripts do not write into `custom/`.

## Phase 6.0 runtime foundation gate

Phase 6.0 adds a machine-check layer for the Phaser runtime contract itself, ahead of any
actual gameplay. Two different kinds of evidence back this gate — they are listed separately so
neither is overstated as the other:

**Covered by Vitest unit tests** under `src/runtime/phaser/__tests__/` (`npm run test`), run in
CI on every PR:

- `createPhaserConfig` targets the given parent/dimensions, defaults to 720×1280, selects
  `Phaser.HEADLESS` only when explicitly requested, and registers exactly the Title/Game/Result
  scenes in order.
- `RuntimeKitRegistry` resolution fails with a clear, typed error for an unregistered Kit ID or
  for an adapter whose `kitId` doesn't match the ID it was registered under, instead of silently
  doing the wrong thing.
- `mergeGameOverrides` applies Kit defaults, then Recipe tuning, then custom overrides, in that
  order.
- `destroyPhaserGame` is null-safe and calls `game.destroy(true, false)` exactly once.

**Verified manually in a real browser** (not yet automated — this is exactly what Playwright
in Phase 6.4 is for): `phaser` boots inside React without throwing; exactly one Phaser `Game`
instance and one `<canvas>` exist through mount, React StrictMode's dev double-invoke, the full
Title → Start → Playing → Finish → Result → Replay flow, and unmount, with no dangling console
errors; the `RuntimeStatus` (`idle | loading | ready | playing | result | error`) tracked in
React state matched the scene transitions at every step, on both a desktop and a 390×844 mobile
viewport.

Full browser-level boot/mount/unmount verification is not yet an automated CI gate; that is
Phase 6.4 scope. Until then, treat the manually-verified items above as re-checked by a human
before each Phase 6.x release, not as continuously enforced.
