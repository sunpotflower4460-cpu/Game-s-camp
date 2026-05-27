# Assembler Plan: puni-sumo-forest-v1

Template: template.miniAction.v1
Engine: phaser
Genre: mini_action

## Required assignments
- playerController (controller) -> controller.puniPush.v1
- mainStage (stage) -> stage.circularArenaForest.v1
- winLoseRule (rule) -> rule.ringOut.v1
- resultUi (ui) -> ui.roundTimer.v1

## Optional assignments
- mainCamera (camera) -> camera.isometricSoft.v1
- timerUi (ui) -> ui.resultScreen.v1

## Notes
- Assignment strategy: first available kit per slot using recipe order (requiredKits first, then optionalKits).
- Slot "resultUi" (ui) selected ui.roundTimer.v1; other candidates: ui.resultScreen.v1
- Slot "timerUi" (ui) selected ui.resultScreen.v1; other candidates: ui.roundTimer.v1
