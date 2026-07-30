import type Phaser from "phaser"
import type { Vector2 } from "../../kits/shared/miniActionPhysics"

/**
 * Runtime context contract for `template.miniAction.v1` Kits — the genre-specific `TContext`
 * that `RuntimeKitRegistry<TContext>` is parameterized with for this template. Two shapes exist
 * because the gameplay Kits (resolved by `MiniActionGameScene`) and the result-presentation Kit
 * (resolved by `MiniActionResultScene`) need structurally different access: giving `ui.resultScreen.v1`
 * a context with no physics/actor access makes "a UI Kit must not alter physics" true by
 * construction, not just by convention.
 */

export type MiniActionActorId = "player" | "opponent"

export type MiniActionActorHandle = {
  readonly id: MiniActionActorId
  readonly gameObject: Phaser.GameObjects.Arc
  readonly body: Phaser.Physics.Arcade.Body
  getPosition(): Vector2
  getVelocity(): Vector2
  setVelocity(x: number, y: number): void
}

export type MiniActionArenaBounds = {
  center: Vector2
  radius: number
}

export type MiniActionOutcome = {
  result: "win" | "lose" | "draw"
  reason: string
}

/**
 * Test-mode-only overrides, populated from the `VITE_E2E`-gated debug hook (see
 * `miniActionDebugHook.ts`). Present so deterministic e2e runs can seed the AI's wobble, shorten
 * the round, force a specific outcome, or reposition an actor without any always-on production
 * debug surface.
 */
export type MiniActionDebugOverride = {
  seed?: number
  timerOverrideSec?: number
  forceResult?: MiniActionOutcome
  actorPositionOverride?: Partial<Record<MiniActionActorId, Vector2>>
}

export type MiniActionGameKitContext = {
  readonly scene: Phaser.Scene
  readonly tuning: Record<string, string | number | boolean>
  readonly isTestMode: boolean
  getActor(id: MiniActionActorId): MiniActionActorHandle
  setArenaBounds(bounds: MiniActionArenaBounds): void
  getArenaBounds(): MiniActionArenaBounds | undefined
  /** Milliseconds of actual round play elapsed — frozen while paused/countdown/hidden-tab. */
  getElapsedMs(): number
  /** True during countdown, while the tab is hidden, and once an outcome has been reported. */
  isPaused(): boolean
  /** First call latches the outcome; later calls are no-ops (ring-out settles only once). */
  reportOutcome(outcome: MiniActionOutcome): void
  getOutcome(): MiniActionOutcome | undefined
  getDebugOverride(): MiniActionDebugOverride | undefined
  /** Consumes a forced result once it has been reported, so it applies to one round only. */
  clearDebugForcedResult(): void
}

export type MiniActionResultKitContext = {
  readonly scene: Phaser.Scene
  readonly tuning: Record<string, string | number | boolean>
  readonly outcome: MiniActionOutcome
}
