# Recipe System

- GameRecipe is the game assembly blueprint.
- AI must create or update GameRecipe before implementing.
- Recipe must not contain free-form code.
- Recipe must reference existing Kit IDs.
- Recipe should describe genre, target device, engine, template, input, rules, requiredKits, and tuning.

## Sample GameRecipe JSON

```json
{
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
  ]
}
```
