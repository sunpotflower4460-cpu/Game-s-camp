import { createSkeletonKitContext } from "../../shared/KitContext"
import type { KitDefinition } from "../../shared/KitDefinition"
import type { KitLifecycleHooks } from "../../shared/KitLifecycle"

const KIT_ID = "controller.puniOpponentAI.v1"

export type PuniOpponentAIControllerTunables = {
  reactionDelayMs: number
  aggression: number
  edgeAvoidance: number
  maxSpeed: number
}

export const puniOpponentAIControllerDefaults: PuniOpponentAIControllerTunables = {
  reactionDelayMs: 220,
  aggression: 0.6,
  edgeAvoidance: 0.7,
  maxSpeed: 170,
}

export function createPuniOpponentAIControllerKitDefinition(): KitDefinition<PuniOpponentAIControllerTunables> {
  const context = createSkeletonKitContext(KIT_ID)
  const lifecycle: KitLifecycleHooks = {
    onCreate: () => undefined,
    onMount: () => undefined,
    onUpdate: () => undefined,
    onDispose: () => undefined,
  }

  return {
    kitId: KIT_ID,
    name: "Puni Opponent AI Controller",
    context,
    phase: context.phase,
    defaults: puniOpponentAIControllerDefaults,
    lifecycle,
  }
}
