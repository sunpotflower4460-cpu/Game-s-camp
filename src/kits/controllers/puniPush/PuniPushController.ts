import { createKitContext } from "../../shared/KitContext"
import type { KitDefinition } from "../../shared/KitDefinition"
import type { KitLifecycleHooks } from "../../shared/KitLifecycle"
import Phaser from "phaser"
import type { RuntimeKitAdapter } from "../../../runtime/phaser/runtimeKit.types"
import type { MiniActionGameKitContext } from "../../../runtime/scenes/miniActionKitContext.types"
import { getTuningNumber } from "../../../runtime/scenes/miniActionTuning"
import { clampVectorLength, computeDecayedVelocity, computeDragMovementVector, type Vector2 } from "../../shared/miniActionPhysics"

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
  const context = createKitContext(KIT_ID, "runtime-ready")
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

const DRAG_DEAD_ZONE_PX = 10
const DRAG_MAX_DISTANCE_PX = 90
const RELEASE_DECAY_PER_MS = 0.006

/**
 * Reads pointer/touch drag (mouse follows the same path), with arrow keys/WASD as a fallback,
 * and drives the player actor's velocity from it. Owns its own input listeners (attached in
 * `onCreate`, detached in `onDispose`) rather than the Scene reading input generically, since a
 * different playerController Kit could reasonably want a different input scheme entirely.
 */
export function createPuniPushControllerRuntimeAdapter(context: MiniActionGameKitContext): RuntimeKitAdapter {
  const scene = context.scene
  let activePointerId: number | undefined
  let dragStart: Vector2 | undefined
  let currentInputVector: Vector2 = { x: 0, y: 0 }
  let keys: Record<"W" | "A" | "S" | "D" | "UP" | "DOWN" | "LEFT" | "RIGHT", Phaser.Input.Keyboard.Key> | undefined

  const handlePointerDown = (pointer: Phaser.Input.Pointer) => {
    if (context.isPaused() || activePointerId !== undefined) {
      return
    }
    activePointerId = pointer.id
    dragStart = { x: pointer.x, y: pointer.y }
  }

  const handlePointerMove = (pointer: Phaser.Input.Pointer) => {
    if (pointer.id !== activePointerId || !dragStart) {
      return
    }
    const offset = { x: pointer.x - dragStart.x, y: pointer.y - dragStart.y }
    currentInputVector = computeDragMovementVector(offset, {
      deadZone: DRAG_DEAD_ZONE_PX,
      maxDistance: DRAG_MAX_DISTANCE_PX,
    })
  }

  const handlePointerUp = (pointer: Phaser.Input.Pointer) => {
    if (pointer.id !== activePointerId) {
      return
    }
    activePointerId = undefined
    dragStart = undefined
    // currentInputVector is left as-is; onUpdate decays it toward zero on its own.
  }

  const readKeyboardVector = (): Vector2 => {
    if (!keys) {
      return { x: 0, y: 0 }
    }
    const left = keys.A.isDown || keys.LEFT.isDown
    const right = keys.D.isDown || keys.RIGHT.isDown
    const up = keys.W.isDown || keys.UP.isDown
    const down = keys.S.isDown || keys.DOWN.isDown
    const x = (right ? 1 : 0) - (left ? 1 : 0)
    const y = (down ? 1 : 0) - (up ? 1 : 0)
    return x === 0 && y === 0 ? { x: 0, y: 0 } : clampVectorLength({ x, y }, 1)
  }

  return {
    kitId: KIT_ID,
    onCreate: () => {
      scene.input.on(Phaser.Input.Events.POINTER_DOWN, handlePointerDown)
      scene.input.on(Phaser.Input.Events.POINTER_MOVE, handlePointerMove)
      scene.input.on(Phaser.Input.Events.POINTER_UP, handlePointerUp)

      const keyboard = scene.input.keyboard
      if (keyboard) {
        keys = keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT") as typeof keys
      }
    },
    onUpdate: (deltaMs) => {
      const player = context.getActor("player")
      if (context.isPaused()) {
        currentInputVector = { x: 0, y: 0 }
        player.setVelocity(0, 0)
        return
      }

      const moveSpeed = getTuningNumber(context.tuning, "moveSpeed", puniPushControllerDefaults.moveSpeed)
      const isDragging = activePointerId !== undefined
      const keyboardVector = isDragging ? { x: 0, y: 0 } : readKeyboardVector()
      const isKeyboardActive = keyboardVector.x !== 0 || keyboardVector.y !== 0

      if (isKeyboardActive) {
        currentInputVector = keyboardVector
      } else if (!isDragging) {
        currentInputVector = computeDecayedVelocity(currentInputVector, RELEASE_DECAY_PER_MS, deltaMs)
      }

      player.setVelocity(currentInputVector.x * moveSpeed, currentInputVector.y * moveSpeed)
    },
    onDispose: () => {
      scene.input.off(Phaser.Input.Events.POINTER_DOWN, handlePointerDown)
      scene.input.off(Phaser.Input.Events.POINTER_MOVE, handlePointerMove)
      scene.input.off(Phaser.Input.Events.POINTER_UP, handlePointerUp)
    },
  }
}
