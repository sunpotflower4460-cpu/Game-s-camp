/**
 * Pure physics/steering math shared by the `template.miniAction.v1` gameplay Kits
 * (`controller.puniPush.v1`, `controller.puniOpponentAI.v1`, `rule.ringOut.v1`). Kept free of
 * Phaser and Scene state so it can be unit-tested directly, per the Phase 6.2 spec's requirement
 * that the pure part of the physics math be extracted into testable functions.
 */

export type Vector2 = { x: number; y: number }

function length(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

/**
 * Converts a raw drag offset (current pointer position minus the drag start position) into a
 * movement direction/strength vector: below `deadZone` distance the result is zero (prevents
 * jitter from a near-stationary touch), and the magnitude is clamped to 1 once the drag reaches
 * `maxDistance` (further dragging doesn't move faster) — the direction itself is never altered.
 */
export function computeDragMovementVector(
  dragOffset: Vector2,
  opts: { deadZone: number; maxDistance: number },
): Vector2 {
  const distance = length(dragOffset)
  if (distance <= opts.deadZone || distance === 0) {
    return { x: 0, y: 0 }
  }
  const usableRange = Math.max(opts.maxDistance - opts.deadZone, 1e-6)
  const strength = Math.min((distance - opts.deadZone) / usableRange, 1)
  return { x: (dragOffset.x / distance) * strength, y: (dragOffset.y / distance) * strength }
}

/**
 * Decays a velocity toward zero after input release, instead of an abrupt stop. `decayPerMs` is
 * the fraction of velocity removed per millisecond, compounded (not applied as a single linear
 * multiplier) so that calling this once for a combined `deltaMs` produces the same result as
 * calling it repeatedly for smaller steps that sum to the same total — i.e. genuinely frame-rate
 * independent, not just approximately so at typical frame times.
 */
export function computeDecayedVelocity(current: Vector2, decayPerMs: number, deltaMs: number): Vector2 {
  const retained = Math.pow(Math.max(1 - decayPerMs, 0), deltaMs)
  return { x: current.x * retained, y: current.y * retained }
}

/**
 * Clamps a vector's length to `maxLength`, preserving direction. Used to cap movement speed and
 * to bound a single push impulse so no one collision frame can apply an unbounded velocity kick.
 */
export function clampVectorLength(v: Vector2, maxLength: number): Vector2 {
  const len = length(v)
  if (len <= maxLength || len === 0) {
    return v
  }
  const scale = maxLength / len
  return { x: v.x * scale, y: v.y * scale }
}

/**
 * Computes the push impulse applied to an actor on contact, from the relative velocity between
 * the two actors (self minus other) and a shared `pushPower` multiplier. `maxImpulse` bounds a
 * single application so a high-speed collision can't apply an unrealistically large kick.
 */
export function computePushImpulse(args: {
  relativeVelocity: Vector2
  pushPower: number
  maxImpulse: number
}): Vector2 {
  const raw = { x: args.relativeVelocity.x * args.pushPower, y: args.relativeVelocity.y * args.pushPower }
  return clampVectorLength(raw, args.maxImpulse)
}

/**
 * Moves `current` toward `target` by a soft-follow fraction of the remaining distance, compounded
 * over `deltaMs` the same way `computeDecayedVelocity` compounds decay — so the camera's
 * `followLerp` produces the same on-screen speed regardless of frame rate, instead of just
 * applying `lerp` once per call (which would follow faster on higher-FPS devices).
 */
export function computeFollowPosition(current: Vector2, target: Vector2, lerp: number, deltaMs: number): Vector2 {
  const clampedLerp = Math.min(Math.max(lerp, 0), 1)
  const factor = 1 - Math.pow(1 - clampedLerp, deltaMs / 16.67)
  return { x: current.x + (target.x - current.x) * factor, y: current.y + (target.y - current.y) * factor }
}

/**
 * The rate at which two actors are closing the distance between them, projected onto the axis
 * connecting their centers (`axisNorm`, pointing from `self` toward `other`): positive while
 * approaching each other along that axis, negative or zero while separating or moving parallel.
 * Kept as a small named function (rather than inlined at the call site) after a sign inversion
 * here once made the push-on-collision impulse silently never fire on genuine collisions.
 */
export function computeClosingSpeed(relativeVelocity: Vector2, axisNorm: Vector2): number {
  return relativeVelocity.x * axisNorm.x + relativeVelocity.y * axisNorm.y
}

/**
 * Whether a position has crossed the ring boundary. `margin` narrows (positive) or widens
 * (negative) the effective radius, matching `rule.ringOut.v1`'s `ringMargin` tunable.
 */
export function isBeyondRingBounds(position: Vector2, arena: { center: Vector2; radius: number }, margin: number): boolean {
  const dx = position.x - arena.center.x
  const dy = position.y - arena.center.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance > arena.radius - margin
}

export function distanceFromCenter(position: Vector2, center: Vector2): number {
  const dx = position.x - center.x
  const dy = position.y - center.y
  return Math.sqrt(dx * dx + dy * dy)
}

export type TimeoutJudgement = "player" | "opponent" | "draw"

/**
 * At timeout, whichever actor is closer to the arena center wins; if the difference is under
 * `drawThreshold`, the round is a draw instead of deciding on a near-tie.
 */
export function judgeTimeoutWinner(
  distances: { player: number; opponent: number },
  drawThreshold: number,
): TimeoutJudgement {
  const diff = distances.player - distances.opponent
  if (Math.abs(diff) < drawThreshold) {
    return "draw"
  }
  return diff < 0 ? "player" : "opponent"
}

/**
 * Steering vector for a simple chase-with-edge-avoidance AI: blends "move toward target" with
 * "move toward arena center" (weighted up as the actor nears the ring boundary) and a small
 * constant wobble direction (the caller advances `wobbleAngle` over time; kept as an input here
 * so this function stays pure and deterministic for a given call).
 */
export function computeChaseSteering(args: {
  self: Vector2
  target: Vector2
  arena: { center: Vector2; radius: number }
  aggression: number
  edgeAvoidance: number
  wobbleAngle: number
  wobbleStrength: number
}): Vector2 {
  const towardTarget = { x: args.target.x - args.self.x, y: args.target.y - args.self.y }
  const towardCenter = { x: args.arena.center.x - args.self.x, y: args.arena.center.y - args.self.y }

  const distanceFromCenterValue = distanceFromCenter(args.self, args.arena.center)
  const edgeProximity = args.arena.radius > 0
    ? Math.min(Math.max(distanceFromCenterValue / args.arena.radius, 0), 1)
    : 0

  const chaseWeight = args.aggression
  const avoidWeight = edgeProximity * args.edgeAvoidance

  const wobble = {
    x: Math.cos(args.wobbleAngle) * args.wobbleStrength,
    y: Math.sin(args.wobbleAngle) * args.wobbleStrength,
  }

  const targetLen = length(towardTarget)
  const centerLen = length(towardCenter)
  const normalizedTarget = targetLen > 0 ? { x: towardTarget.x / targetLen, y: towardTarget.y / targetLen } : { x: 0, y: 0 }
  const normalizedCenter = centerLen > 0 ? { x: towardCenter.x / centerLen, y: towardCenter.y / centerLen } : { x: 0, y: 0 }

  const combined = {
    x: normalizedTarget.x * chaseWeight + normalizedCenter.x * avoidWeight + wobble.x,
    y: normalizedTarget.y * chaseWeight + normalizedCenter.y * avoidWeight + wobble.y,
  }

  return clampVectorLength(combined, 1)
}
