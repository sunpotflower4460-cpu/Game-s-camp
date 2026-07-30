# Missing Kit Flow

This document defines what AI should do when a required Kit does not exist.

## Principle

AI must not immediately write one-off implementation code when a Kit is missing.
The correct flow is:

```txt
Need a feature
↓
Check future/current Kit Registry
↓
Existing Kit found?
  ↓ yes
Use existing Kit in GameRecipe
  ↓ no
Create a KitProposal
↓
Can this be reusable? (see criteria below)
  ↓ yes
Plan a new reusable Kit
  ↓ no
Route to custom/game-specific layer
```

## KitProposal

A KitProposal should include:

- proposed id
- category
- purpose
- reusable or game-specific?
- expected compatible templates
- required inputs
- outputs / provides
- invariants
- risk
- why existing Kits are insufficient

## Reusable vs game-specific

Create a new Kit if:

- the behavior can be reused by multiple games
- it has clear inputs and outputs
- it does not depend on one specific scene
- it can have a manifest

Use custom/game-specific layer if:

- the behavior only belongs to one game
- it is a one-off scripted moment
- it is a temporary experiment
- it should not become part of the forge library yet

## Important

Missing Kit does not mean “write random code”.

Missing Kit means:

1. declare the gap,
2. propose a Kit or custom route,
3. keep architecture clean.

## Worked example: controller.puniOpponentAI.v1 (Phase 6.1)

Puni Sumo needs a rival actor. The Kit Registry had no controller providing `opponentAI`, so a
KitProposal was made (see `docs/kit-contracts.md`) and a new reusable Kit was added — manifest,
registry entry, and skeleton only, not the runtime behavior itself. The behavior is reusable
(any mini-action game with a rival actor can use it), has clear inputs/outputs (`provides:
["opponentAI"]`), and does not depend on one specific scene, so it qualified as a Kit rather than
a one-off `custom/` addition. Its actual runtime logic followed in Phase 6.2, once its
`playerController` counterpart and the other five Template slots had real behavior too — the
same "skeleton first, promote to runtime-ready later" pattern as every other Kit in this repo.
