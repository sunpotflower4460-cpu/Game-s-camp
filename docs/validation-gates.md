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
