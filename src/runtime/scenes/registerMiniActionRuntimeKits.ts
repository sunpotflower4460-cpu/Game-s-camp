import { createCircularArenaForestRuntimeAdapter } from "../../kits/stages/circularArenaForest/CircularArenaForest"
import { createRingOutRuleRuntimeAdapter } from "../../kits/rules/ringOut/RingOutRule"
import { createIsometricSoftCameraRuntimeAdapter } from "../../kits/cameras/isometricSoft/IsometricSoftCamera"
import { createRoundTimerRuntimeAdapter } from "../../kits/ui/roundTimer/RoundTimer"
import { createResultScreenRuntimeAdapter } from "../../kits/ui/resultScreen/ResultScreen"
import { createPuniPushControllerRuntimeAdapter } from "../../kits/controllers/puniPush/PuniPushController"
import { createPuniOpponentAIControllerRuntimeAdapter } from "../../kits/controllers/puniOpponentAI/PuniOpponentAIController"
import type { RuntimeKitRegistry } from "../phaser/RuntimeKitRegistry"
import type { GeneratedGameDefinitionSlots } from "../phaser/runtimeGameDefinition.types"
import type { MiniActionGameKitContext, MiniActionResultKitContext } from "./miniActionKitContext.types"

/**
 * Flat kitId -> factory tables, not a per-Kit-ID switch in a Scene: each Scene just iterates its
 * own slot list and calls `registry.resolve(kitId, context)`, so adding a new Kit here is the
 * only change needed to make it resolvable — no Scene code branches on which Kit ID it is.
 */
export function registerMiniActionGameKits(registry: RuntimeKitRegistry<MiniActionGameKitContext>): void {
  registry.register("stage.circularArenaForest.v1", createCircularArenaForestRuntimeAdapter)
  registry.register("rule.ringOut.v1", createRingOutRuleRuntimeAdapter)
  registry.register("camera.isometricSoft.v1", createIsometricSoftCameraRuntimeAdapter)
  registry.register("ui.roundTimer.v1", createRoundTimerRuntimeAdapter)
  registry.register("controller.puniPush.v1", createPuniPushControllerRuntimeAdapter)
  registry.register("controller.puniOpponentAI.v1", createPuniOpponentAIControllerRuntimeAdapter)
}

export function registerMiniActionResultKits(registry: RuntimeKitRegistry<MiniActionResultKitContext>): void {
  registry.register("ui.resultScreen.v1", createResultScreenRuntimeAdapter)
}

/**
 * Slot processing order for the Game scene: `mainStage` must run before anything that reads
 * arena bounds (`mainCamera`, `winLoseRule`), and controllers/timer can run in any order after
 * that. This is plain ordering data, not per-Kit-ID branching logic.
 */
export const MINI_ACTION_GAME_SLOT_ORDER: (keyof GeneratedGameDefinitionSlots)[] = [
  "mainStage",
  "mainCamera",
  "playerController",
  "opponentController",
  "winLoseRule",
  "timerUi",
]
