# Game’s Camp / AI Game Forge Agent Rules

## Core Identity

This repository is not a normal game repository.
It is an AI-oriented game creation forge.

## Non-negotiable Rules

1. Do not implement a game before creating or updating a GameRecipe.
2. Prefer existing Kits before creating new code.
3. New reusable parts must be added as Kits.
4. Game-specific logic belongs under src/games/.
5. Generated files must live under generated/.
6. Human/custom adjustments must live under custom/.
7. Never overwrite custom/ from an assembler or generator.
8. Do not treat generated/ as the source of truth.
9. Do not change architecture casually.
10. Playability comes before visual decoration.
11. Mobile usability must not be broken.
12. Every meaningful change must include validation instructions.
13. Do not mark work as complete without explaining what was verified.

## Working Order

1. Read README.md.
2. Read docs/concept.md.
3. Read docs/ai-workflow.md.
4. Read docs/recipe-system.md.
5. Read docs/kit-contracts.md.
6. Read docs/validation-gates.md.
7. Only then make changes.

## Current Phase

Phase 0 only.
Do not add Vite, React, Phaser, runtime code, package.json, or game implementation in this PR.
