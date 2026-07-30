import { createKitContext } from "../../shared/KitContext"
import type { KitDefinition } from "../../shared/KitDefinition"
import type { KitLifecycleHooks } from "../../shared/KitLifecycle"
import type { RuntimeKitAdapter } from "../../../runtime/phaser/runtimeKit.types"
import type { MiniActionGameKitContext } from "../../../runtime/scenes/miniActionKitContext.types"
import { getTuningNumber } from "../../../runtime/scenes/miniActionTuning"

const KIT_ID = "stage.circularArenaForest.v1"

export type CircularArenaForestTunables = {
  arenaRadius: number
}

export const circularArenaForestDefaults: CircularArenaForestTunables = {
  arenaRadius: 260,
}

export function createCircularArenaForestKitDefinition(): KitDefinition<CircularArenaForestTunables> {
  const context = createKitContext(KIT_ID, "runtime-ready")
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

/**
 * Draws the circular ring and registers its bounds with the shared context so
 * `rule.ringOut.v1` (ring-out judging) and `camera.isometricSoft.v1` (soft follow) can read the
 * same arena the stage actually rendered, instead of each recomputing it independently.
 */
export function createCircularArenaForestRuntimeAdapter(context: MiniActionGameKitContext): RuntimeKitAdapter {
  return {
    kitId: KIT_ID,
    onCreate: () => {
      const arenaRadius = getTuningNumber(context.tuning, "arenaRadius", circularArenaForestDefaults.arenaRadius)
      const center = { x: context.scene.scale.width / 2, y: context.scene.scale.height / 2 }

      context.setArenaBounds({ center, radius: arenaRadius })

      const ring = context.scene.add.circle(center.x, center.y, arenaRadius, 0x4b3621, 1)
      ring.setStrokeStyle(6, 0x2f5233, 1)
      ring.setDepth(-10)

      const innerRing = context.scene.add.circle(center.x, center.y, arenaRadius - 18, 0x5c4530, 1)
      innerRing.setDepth(-9)
    },
  }
}
