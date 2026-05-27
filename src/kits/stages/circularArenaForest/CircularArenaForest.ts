import { createSkeletonKitContext } from "../../shared/KitContext"
import type { KitDefinition } from "../../shared/KitDefinition"
import type { KitLifecycleHooks } from "../../shared/KitLifecycle"

const KIT_ID = "stage.circularArenaForest.v1"

export type CircularArenaForestTunables = {
  arenaRadius: number
}

export const circularArenaForestDefaults: CircularArenaForestTunables = {
  arenaRadius: 260,
}

export function createCircularArenaForestKitDefinition(): KitDefinition<CircularArenaForestTunables> {
  const context = createSkeletonKitContext(KIT_ID)
  const lifecycle: KitLifecycleHooks = {
    onCreate: () => undefined,
    onMount: () => undefined,
    onUpdate: () => undefined,
    onDispose: () => undefined,
  }

  return {
    kitId: KIT_ID,
    name: "Circular Arena Forest Stage",
    context,
    phase: context.phase,
    defaults: circularArenaForestDefaults,
    lifecycle,
  }
}
