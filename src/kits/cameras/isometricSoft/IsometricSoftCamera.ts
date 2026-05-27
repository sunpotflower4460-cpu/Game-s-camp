import { createSkeletonKitContext } from "../../shared/KitContext"
import type { KitDefinition } from "../../shared/KitDefinition"
import type { KitLifecycleHooks } from "../../shared/KitLifecycle"

const KIT_ID = "camera.isometricSoft.v1"

export type IsometricSoftCameraTunables = {
  followLerp: number
}

export const isometricSoftCameraDefaults: IsometricSoftCameraTunables = {
  followLerp: 0.14,
}

export function createIsometricSoftCameraKitDefinition(): KitDefinition<IsometricSoftCameraTunables> {
  const context = createSkeletonKitContext(KIT_ID)
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
