import Phaser from "phaser"
import {
  RUNTIME_ERROR_EVENT,
  RUNTIME_STATUS_EVENT,
  type GeneratedGameDefinition,
} from "../phaser/runtimeGameDefinition.types"
import { MiniActionBaseScene } from "./MiniActionBaseScene"
import { createRuntimeKitRegistry, type RuntimeKitRegistry } from "../phaser/RuntimeKitRegistry"
import type { RuntimeKitAdapter } from "../phaser/runtimeKit.types"
import { MINI_ACTION_GAME_SLOT_ORDER, registerMiniActionGameKits } from "./registerMiniActionRuntimeKits"
import type {
  MiniActionActorHandle,
  MiniActionActorId,
  MiniActionArenaBounds,
  MiniActionGameKitContext,
  MiniActionOutcome,
} from "./miniActionKitContext.types"
import { clearMiniActionForcedResult, getMiniActionDebugOverride, isMiniActionE2EEnabled } from "./miniActionDebugHook"
import { computeDecayedVelocity, computePushImpulse, type Vector2 } from "../../kits/shared/miniActionPhysics"
import { getTuningNumber } from "./miniActionTuning"
import { puniPushControllerDefaults } from "../../kits/controllers/puniPush/PuniPushController"

const ACTOR_RADIUS = 28
const PUSH_COOLDOWN_MS = 90
const PUSH_DECAY_PER_MS = 0.004
const MAX_PUSH_IMPULSE = 420
const COUNTDOWN_STEP_MS = 800

type RoundPhase = "countdown" | "playing" | "ended"

type ActorState = {
  gameObject: Phaser.GameObjects.Arc
  body: Phaser.Physics.Arcade.Body
  controllerVelocity: Vector2
  pushVelocity: Vector2
}

/**
 * The real `template.miniAction.v1` gameplay scene: countdown, two physics-driven actors inside a
 * circular arena, a round timer, ring-out/timeout judging, and pause/visibility handling. All of
 * the actual gameplay behavior (movement, AI, arena, win condition, camera, timer HUD) lives in
 * the Kits resolved from `definition.slots` — this Scene only owns the physics/lifecycle
 * plumbing generic to the mini-action genre: it iterates slots and calls
 * `registry.resolve(kitId, context)`, never branching on which Kit ID a slot holds.
 */
export class MiniActionGameScene extends MiniActionBaseScene {
  private kitRegistry: RuntimeKitRegistry<MiniActionGameKitContext> = createRuntimeKitRegistry()
  private adapters = new Map<string, RuntimeKitAdapter>()
  private actors = new Map<MiniActionActorId, ActorState>()
  private arenaBounds: MiniActionArenaBounds | undefined
  private elapsedMs = 0
  private outcome: MiniActionOutcome | undefined
  private roundPhase: RoundPhase = "countdown"
  private documentHidden = false
  private countdownText: Phaser.GameObjects.Text | undefined
  private lastPushAt = -Infinity

  constructor(definition: GeneratedGameDefinition) {
    super(definition.scenes.game, definition)
  }

  private readonly handleVisibilityChange = (): void => {
    this.documentHidden = typeof document !== "undefined" && document.hidden
  }

  protected onCreate(): void {
    // Phaser registers this Scene under a fixed key once and reuses the SAME instance across
    // every later `scene.start(key)` (e.g. Replay) rather than constructing a new one — so class
    // field initializers only ever run once, at that first construction. Every mutable field a
    // round can end up leaving in a non-initial state (most importantly `outcome`/`roundPhase`:
    // an un-reset outcome would otherwise resolve the very next round the instant its countdown
    // ends, from a stale value that has nothing to do with that round) must be reset explicitly
    // here, at the top of `onCreate`, instead of relying on field initializers.
    this.adapters.clear()
    this.actors.clear()
    this.arenaBounds = undefined
    this.elapsedMs = 0
    this.outcome = undefined
    this.roundPhase = "countdown"
    this.documentHidden = false
    this.countdownText = undefined
    this.lastPushAt = -Infinity

    this.cameras.main.setBackgroundColor("#26392b")
    this.kitRegistry = createRuntimeKitRegistry<MiniActionGameKitContext>()
    registerMiniActionGameKits(this.kitRegistry)

    this.createActor("player", 0x8fd694)
    this.createActor("opponent", 0xe08a8a)
    this.physics.add.collider(
      this.getActorState("player").gameObject,
      this.getActorState("opponent").gameObject,
      this.handleActorCollision,
      undefined,
      this,
    )

    const context = this.buildContext()
    for (const slotName of MINI_ACTION_GAME_SLOT_ORDER) {
      const kitId = this.definition.slots[slotName]
      if (!kitId) {
        continue
      }
      const adapter = this.kitRegistry.resolve(kitId, context)
      this.adapters.set(slotName, adapter)
    }
    for (const adapter of this.adapters.values()) {
      adapter.onCreate?.()
    }

    // Arena bounds are known now (mainStage runs first) — place actors inside it, far enough
    // apart that they don't spawn already overlapping.
    const arena = this.arenaBounds ?? {
      center: { x: this.scale.width / 2, y: this.scale.height / 2 },
      radius: 200,
    }
    this.positionActor("player", arena.center.x, arena.center.y + arena.radius * 0.55)
    this.positionActor("opponent", arena.center.x, arena.center.y - arena.radius * 0.55)

    for (const adapter of this.adapters.values()) {
      adapter.onMount?.()
    }

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.handleVisibilityChange)
      this.documentHidden = document.hidden
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this)
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleShutdown, this)

    this.startCountdown()
    this.game.events.emit(RUNTIME_STATUS_EVENT, "playing")
  }

  update(_time: number, delta: number): void {
    try {
      this.tick(delta)
    } catch (caught) {
      this.game.events.emit(RUNTIME_ERROR_EVENT, {
        message: caught instanceof Error ? caught.message : String(caught),
        cause: caught,
      })
    }
  }

  private tick(delta: number): void {
    if (this.roundPhase === "ended") {
      return
    }

    const debugOverride = getMiniActionDebugOverride()
    if (debugOverride?.actorPositionOverride) {
      for (const id of ["player", "opponent"] as const) {
        const position = debugOverride.actorPositionOverride[id]
        if (position) {
          this.positionActor(id, position.x, position.y)
        }
      }
    }

    const paused = this.roundPhase !== "playing" || this.documentHidden
    if (!paused) {
      this.elapsedMs += delta
    }

    for (const actor of this.actors.values()) {
      actor.pushVelocity = computeDecayedVelocity(actor.pushVelocity, PUSH_DECAY_PER_MS, delta)
    }

    for (const adapter of this.adapters.values()) {
      adapter.onUpdate?.(delta)
    }

    for (const actor of this.actors.values()) {
      actor.body.setVelocity(
        actor.controllerVelocity.x + actor.pushVelocity.x,
        actor.controllerVelocity.y + actor.pushVelocity.y,
      )
    }

    if (this.roundPhase === "playing" && this.outcome) {
      this.roundPhase = "ended"
      for (const actor of this.actors.values()) {
        actor.body.setVelocity(0, 0)
      }
      this.scene.start(this.definition.scenes.result, { outcome: this.outcome })
    }
  }

  private startCountdown(): void {
    const { width, height } = this.scale
    const text = this.add
      .text(width / 2, height / 2, "3", {
        fontFamily: "sans-serif",
        fontSize: "72px",
        color: "#f4ead1",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setScrollFactor(0)
    this.countdownText = text

    const remainingSteps = ["2", "1"]
    const step = (): void => {
      const next = remainingSteps.shift()
      if (next === undefined) {
        text.destroy()
        this.countdownText = undefined
        this.roundPhase = "playing"
        return
      }
      text.setText(next)
      this.time.delayedCall(COUNTDOWN_STEP_MS, step)
    }
    this.time.delayedCall(COUNTDOWN_STEP_MS, step)
  }

  private createActor(id: MiniActionActorId, color: number): void {
    const gameObject = this.add.circle(0, 0, ACTOR_RADIUS, color, 1)
    this.physics.add.existing(gameObject)
    const body = gameObject.body as Phaser.Physics.Arcade.Body
    body.setCircle(ACTOR_RADIUS)
    body.setCollideWorldBounds(false)
    body.setBounce(0.2)
    this.actors.set(id, {
      gameObject,
      body,
      controllerVelocity: { x: 0, y: 0 },
      pushVelocity: { x: 0, y: 0 },
    })
  }

  private positionActor(id: MiniActionActorId, x: number, y: number): void {
    const actor = this.actors.get(id)
    if (!actor) {
      return
    }
    actor.gameObject.setPosition(x, y)
    actor.body.reset(x, y)
  }

  private getActorState(id: MiniActionActorId): ActorState {
    const actor = this.actors.get(id)
    if (!actor) {
      throw new Error(`Actor "${id}" has not been created yet.`)
    }
    return actor
  }

  private getActorHandle(id: MiniActionActorId): MiniActionActorHandle {
    const actor = this.getActorState(id)
    return {
      id,
      gameObject: actor.gameObject,
      body: actor.body,
      getPosition: () => ({ x: actor.gameObject.x, y: actor.gameObject.y }),
      getVelocity: () => ({ x: actor.body.velocity.x, y: actor.body.velocity.y }),
      setVelocity: (x, y) => {
        actor.controllerVelocity = { x, y }
      },
    }
  }

  /**
   * Fixed collider order (player, opponent — set up once in `onCreate`), so this never needs to
   * inspect the callback's own arguments to know which body is which.
   */
  private readonly handleActorCollision = (): void => {
    const now = this.time.now
    if (now - this.lastPushAt < PUSH_COOLDOWN_MS) {
      return
    }

    const player = this.getActorState("player")
    const opponent = this.getActorState("opponent")
    const axis = { x: opponent.gameObject.x - player.gameObject.x, y: opponent.gameObject.y - player.gameObject.y }
    const axisLength = Math.sqrt(axis.x * axis.x + axis.y * axis.y) || 1
    const axisNorm = { x: axis.x / axisLength, y: axis.y / axisLength }

    const relativeVelocity = {
      x: player.body.velocity.x - opponent.body.velocity.x,
      y: player.body.velocity.y - opponent.body.velocity.y,
    }
    // Positive when the two actors are closing the distance between them along the axis
    // connecting their centers — moving apart already needs no extra push.
    const closingSpeed = -(relativeVelocity.x * axisNorm.x + relativeVelocity.y * axisNorm.y)
    if (closingSpeed <= 0) {
      return
    }

    this.lastPushAt = now
    const pushPower = getTuningNumber(this.definition.tuning, "pushPower", puniPushControllerDefaults.pushPower)
    const impulse = computePushImpulse({
      relativeVelocity: { x: axisNorm.x * closingSpeed, y: axisNorm.y * closingSpeed },
      pushPower,
      maxImpulse: MAX_PUSH_IMPULSE,
    })

    opponent.pushVelocity = { x: opponent.pushVelocity.x + impulse.x, y: opponent.pushVelocity.y + impulse.y }
    player.pushVelocity = { x: player.pushVelocity.x - impulse.x, y: player.pushVelocity.y - impulse.y }
  }

  private buildContext(): MiniActionGameKitContext {
    return {
      scene: this,
      tuning: this.definition.tuning,
      isTestMode: isMiniActionE2EEnabled(),
      getActor: (id) => this.getActorHandle(id),
      setArenaBounds: (bounds) => {
        this.arenaBounds = bounds
      },
      getArenaBounds: () => this.arenaBounds,
      getElapsedMs: () => this.elapsedMs,
      isPaused: () => this.roundPhase !== "playing" || this.documentHidden,
      reportOutcome: (outcome) => {
        if (!this.outcome) {
          this.outcome = outcome
        }
      },
      getOutcome: () => this.outcome,
      getDebugOverride: () => getMiniActionDebugOverride(),
      clearDebugForcedResult: () => clearMiniActionForcedResult(),
    }
  }

  private readonly handleShutdown = (): void => {
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange)
    }
    for (const adapter of this.adapters.values()) {
      adapter.onDispose?.()
    }
    this.adapters.clear()
    this.countdownText?.destroy()
    this.countdownText = undefined
  }
}
