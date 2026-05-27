# Recipe System

- GameRecipe is the game assembly blueprint.
- AI must create or update GameRecipe before implementing.
- Recipe must not contain free-form code.
- In future phases, Recipe should reference Kit IDs from the Kit Registry. During Phase 0, sample Kit IDs are placeholders and missing Kits should be declared as KitProposal candidates.
- Recipe should describe genre, target device, engine, template, input, rules, requiredKits, and tuning.

## Phase 0.1 note

In Phase 0.1, Kit IDs in sample recipes are placeholders for the future Kit Registry.
In future phases, a GameRecipe must reference Kit IDs from the Kit Registry.
If a required Kit does not exist, the AI must not invent implementation directly. It must declare a KitProposal or route the need through the missing Kit flow.

## Core fields

- `schemaVersion`: required. Example: `"0.1"`.
- `id`: required. Use kebab-case, e.g. `puni-sumo-forest-v1`.
- `title`: required.
- `genre`: required. Initial allowed values: `mini_action`, `puzzle`, `exploration`, `srpg`, `mystery_sandbox`.
- `targetDevice`: required. Allowed values: `mobile`, `pc`, `both`.
- `engine`: required in future implementation phases. Initial planned value: `phaser`.
- `template`: required. A GameRecipe should select one main template.
- `input`: required.
- `durationSec`: optional but recommended for short games.
- `requiredKits`: required once Kit Registry exists.
- `optionalKits`: optional.
- `tuning`: optional safe parameter area.
- `constraints`: optional design constraints.
- `notesForAssembler`: optional non-code guidance for the future assembler.

## Free-form code policy

GameRecipe must not contain executable code.

Allowed:
- numbers
- strings
- arrays
- enum-like values
- tuning parameters
- constraints
- non-executable notes

Forbidden:
- JavaScript / TypeScript snippets
- inline functions
- CSS blocks
- arbitrary source code
- hidden implementation logic

## Sample GameRecipe JSON

```json
{
  "schemaVersion": "0.1",
  "id": "puni-sumo-forest-v1",
  "title": "森のぷに相撲",
  "genre": "mini_action",
  "targetDevice": "both",
  "engine": "phaser",
  "template": "template.miniAction.v1",
  "input": "mobile_drag",
  "durationSec": 60,
  "requiredKits": [
    "controller.puniPush.v1",
    "camera.isometricSoft.v1",
    "stage.circularArenaForest.v1",
    "rule.ringOut.v1",
    "ui.roundTimer.v1",
    "ui.resultScreen.v1"
  ],
  "optionalKits": [
    "audio.softImpact.v1",
    "visual.miniatureDiorama.v1"
  ],
  "tuning": {
    "moveSpeed": 180,
    "pushPower": 1.2,
    "arenaRadius": 260,
    "roundTimeSec": 60
  },
  "constraints": [
    "mobile friendly",
    "one round within 60 seconds",
    "simple controls",
    "do not add complex progression systems"
  ],
  "notesForAssembler": "Use this as a future sample only. Kit IDs are placeholders until the Kit Registry exists."
}
```
