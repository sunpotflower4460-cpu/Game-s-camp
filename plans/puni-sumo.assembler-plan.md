# Assembler Plan: puni-sumo-forest-v1

Template: template.miniAction.v1
Engine: phaser
Genre: mini_action

## Required assignments
- playerController (controller, requires: playerMovement, pushForce) -> controller.puniPush.v1
- opponentController (controller, requires: opponentAI) -> controller.puniOpponentAI.v1
- mainStage (stage) -> stage.circularArenaForest.v1
- winLoseRule (rule) -> rule.ringOut.v1
- resultUi (ui, requires: resultScreen) -> ui.resultScreen.v1
- mainCamera (camera, requires: isometricCamera) -> camera.isometricSoft.v1

## Optional assignments
- timerUi (ui, requires: roundTimerHud) -> ui.roundTimer.v1

## Notes
- Assignment strategy: first available kit per slot using recipe order (requiredKits first, then optionalKits), matching both slot category and required provides.
- Slot "playerController" assigned controller.puniPush.v1 by category "controller" and requires provides [playerMovement, pushForce].
- Slot "opponentController" assigned controller.puniOpponentAI.v1 by category "controller" and requires provides [opponentAI].
- Slot "mainStage" assigned stage.circularArenaForest.v1 by category "stage".
- Slot "winLoseRule" assigned rule.ringOut.v1 by category "rule".
- Slot "resultUi" assigned ui.resultScreen.v1 by category "ui" and requires provides [resultScreen].
- Slot "mainCamera" assigned camera.isometricSoft.v1 by category "camera" and requires provides [isometricCamera].
- Slot "timerUi" assigned ui.roundTimer.v1 by category "ui" and requires provides [roundTimerHud].
