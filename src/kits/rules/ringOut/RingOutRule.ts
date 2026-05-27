import { createSkeletonKitContext } from "../../shared/KitContext"
import type { KitDefinition } from "../../shared/KitDefinition"
import type { KitLifecycleHooks } from "../../shared/KitLifecycle"

const KIT_ID = "rule.ringOut.v1"

export type RingOutRuleTunables = {
  ringMargin: number
}

export const ringOutRuleDefaults: RingOutRuleTunables = {
  ringMargin: 0,
}

export function createRingOutRuleKitDefinition(): KitDefinition<RingOutRuleTunables> {
  const context = createSkeletonKitContext(KIT_ID)
  const lifecycle: KitLifecycleHooks = {
    onCreate: () => undefined,
    onMount: () => undefined,
    onUpdate: () => undefined,
    onDispose: () => undefined,
  }

  return {
    kitId: KIT_ID,
    name: "Ring Out Rule",
    context,
    phase: context.phase,
    defaults: ringOutRuleDefaults,
    lifecycle,
  }
}
