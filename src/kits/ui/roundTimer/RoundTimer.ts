import { createSkeletonKitContext } from "../../shared/KitContext"
import type { KitDefinition } from "../../shared/KitDefinition"
import type { KitLifecycleHooks } from "../../shared/KitLifecycle"

const KIT_ID = "ui.roundTimer.v1"

export type RoundTimerTunables = {
  roundTimeSec: number
}

export const roundTimerDefaults: RoundTimerTunables = {
  roundTimeSec: 60,
}

export function createRoundTimerKitDefinition(): KitDefinition<RoundTimerTunables> {
  const context = createSkeletonKitContext(KIT_ID)
  const lifecycle: KitLifecycleHooks = {
    onCreate: () => undefined,
    onMount: () => undefined,
    onUpdate: () => undefined,
    onDispose: () => undefined,
  }

  return {
    kitId: KIT_ID,
    name: "Round Timer UI",
    context,
    phase: context.phase,
    defaults: roundTimerDefaults,
    lifecycle,
  }
}
