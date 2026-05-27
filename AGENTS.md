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

Phase 4: Mini Action Template skeleton plus Template Registry validation on top of Phase 3.
Allowed in this phase:
- schema files
- validation scripts
- sample GameRecipe JSON
- Kit manifest JSON inventory under kits/
- Template manifest JSON inventory under templates/
- Kit Registry loading and duplicate-id checks
- Kit Registry entry/testFixture existence checks
- Template Registry loading and duplicate-id checks
- Template Registry template-file existence checks
- Recipe compatibility checks against registry metadata
- Runtime-neutral Kit skeleton files under src/kits/
- Template placeholder files under templates/mini-action/files/
- generated JSON Schema files

Not allowed in this phase:
- Phaser
- Puni Sumo gameplay implementation
- playable Kit runtime implementation
- Assembler
- generated game output
- custom game output
