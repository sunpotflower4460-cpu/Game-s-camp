import { createSkeletonKitContext } from "../../shared/KitContext"
import type { KitDefinition } from "../../shared/KitDefinition"
import type { KitLifecycleHooks } from "../../shared/KitLifecycle"

const KIT_ID = "ui.resultScreen.v1"

export type ResultScreenTunables = {
  showDurationMs: number
}

export const resultScreenDefaults: ResultScreenTunables = {
  showDurationMs: 1500,
}

export function createResultScreenKitDefinition(): KitDefinition<ResultScreenTunables> {
  const context = createSkeletonKitContext(KIT_ID)
  const lifecycle: KitLifecycleHooks = {
    onCreate: () => undefined,
    onMount: () => undefined,
    onUpdate: () => undefined,
    onDispose: () => undefined,
  }

  return {
    kitId: KIT_ID,
    name: "Result Screen UI",
    context,
    phase: context.phase,
    defaults: resultScreenDefaults,
    lifecycle,
  }
}
