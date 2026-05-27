import { createSkeletonKitContext } from "../../shared/KitContext"
import type { KitDefinition } from "../../shared/KitDefinition"
import type { KitLifecycleHooks } from "../../shared/KitLifecycle"

const KIT_ID = "controller.puniPush.v1"

export type PuniPushControllerTunables = {
  moveSpeed: number
  pushPower: number
}

export const puniPushControllerDefaults: PuniPushControllerTunables = {
  moveSpeed: 180,
  pushPower: 1.2,
}

export function createPuniPushControllerKitDefinition(): KitDefinition<PuniPushControllerTunables> {
  const context = createSkeletonKitContext(KIT_ID)
  const lifecycle: KitLifecycleHooks = {
    onCreate: () => undefined,
    onMount: () => undefined,
    onUpdate: () => undefined,
    onDispose: () => undefined,
  }

  return {
    kitId: KIT_ID,
    name: "Puni Push Controller",
    context,
    phase: context.phase,
    defaults: puniPushControllerDefaults,
    lifecycle,
  }
}
