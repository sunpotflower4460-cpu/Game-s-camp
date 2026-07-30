import { createKitContext } from "../../shared/KitContext"
import type { KitDefinition } from "../../shared/KitDefinition"
import type { KitLifecycleHooks } from "../../shared/KitLifecycle"
import type { RuntimeKitAdapter } from "../../../runtime/phaser/runtimeKit.types"
import type { MiniActionGameKitContext } from "../../../runtime/scenes/miniActionKitContext.types"
import { getTuningNumber } from "../../../runtime/scenes/miniActionTuning"
import type { Vector2 } from "../../shared/miniActionPhysics"

const KIT_ID = "camera.isometricSoft.v1"

export type IsometricSoftCameraTunables = {
  followLerp: number
}

export const isometricSoftCameraDefaults: IsometricSoftCameraTunables = {
  followLerp: 0.14,
}

export function createIsometricSoftCameraKitDefinition(): KitDefinition<IsometricSoftCameraTunables> {
  const context = createKitContext(KIT_ID, "runtime-ready")
  const lifecycle: KitLifecycleHooks = {
    onCreate: () => undefined,
    onMount: () => undefined,
    onUpdate: () => undefined,
    onDispose: () => undefined,
  }

  return {
    kitId: KIT_ID,
    name: "Isometric Soft Camera",
    context,
    phase: context.phase,
    defaults: isometricSoftCameraDefaults,
    lifecycle,
  }
}

/**
 * Softly follows the midpoint between the two actors — a manual lerp toward the target each
 * frame (rather than `Camera.startFollow`, which tracks a single GameObject) so the view stays
 * centered on the action without owning any win-condition logic.
 */
export function createIsometricSoftCameraRuntimeAdapter(context: MiniActionGameKitContext): RuntimeKitAdapter {
  let current: Vector2 | undefined

  return {
    kitId: KIT_ID,
    onCreate: () => {
      const arena = context.getArenaBounds()
      current = arena ? { ...arena.center } : { x: context.scene.scale.width / 2, y: context.scene.scale.height / 2 }
      context.scene.cameras.main.centerOn(current.x, current.y)
    },
    onUpdate: () => {
      if (!current) {
        return
      }
      const player = context.getActor("player").getPosition()
      const opponent = context.getActor("opponent").getPosition()
      const target = { x: (player.x + opponent.x) / 2, y: (player.y + opponent.y) / 2 }
      const lerp = getTuningNumber(context.tuning, "followLerp", isometricSoftCameraDefaults.followLerp)

      current = {
        x: current.x + (target.x - current.x) * lerp,
        y: current.y + (target.y - current.y) * lerp,
      }
      context.scene.cameras.main.centerOn(current.x, current.y)
    },
  }
}
