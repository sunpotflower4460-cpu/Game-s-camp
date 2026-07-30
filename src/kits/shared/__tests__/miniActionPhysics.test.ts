import { describe, expect, it } from "vitest"
import {
  clampVectorLength,
  computeChaseSteering,
  computeDecayedVelocity,
  computeDragMovementVector,
  computePushImpulse,
  distanceFromCenter,
  isBeyondRingBounds,
  judgeTimeoutWinner,
} from "../miniActionPhysics"

describe("computeDragMovementVector", () => {
  it("returns zero inside the dead zone", () => {
    expect(computeDragMovementVector({ x: 5, y: 0 }, { deadZone: 10, maxDistance: 100 })).toEqual({ x: 0, y: 0 })
  })

  it("returns zero for no drag at all", () => {
    expect(computeDragMovementVector({ x: 0, y: 0 }, { deadZone: 10, maxDistance: 100 })).toEqual({ x: 0, y: 0 })
  })

  it("scales strength linearly between deadZone and maxDistance", () => {
    const result = computeDragMovementVector({ x: 55, y: 0 }, { deadZone: 10, maxDistance: 100 })
    expect(result.x).toBeCloseTo(0.5, 5)
    expect(result.y).toBeCloseTo(0, 5)
  })

  it("clamps strength to 1 beyond maxDistance without changing direction", () => {
    const result = computeDragMovementVector({ x: 0, y: 300 }, { deadZone: 10, maxDistance: 100 })
    expect(result.x).toBeCloseTo(0, 5)
    expect(result.y).toBeCloseTo(1, 5)
  })

  it("preserves direction for a diagonal drag", () => {
    const result = computeDragMovementVector({ x: 30, y: 40 }, { deadZone: 0, maxDistance: 50 })
    expect(result.x / result.y).toBeCloseTo(30 / 40, 5)
  })
})

describe("computeDecayedVelocity", () => {
  it("leaves velocity unchanged when decay is zero", () => {
    expect(computeDecayedVelocity({ x: 100, y: -50 }, 0, 16)).toEqual({ x: 100, y: -50 })
  })

  it("reduces velocity toward zero over time", () => {
    const result = computeDecayedVelocity({ x: 100, y: 0 }, 0.01, 16)
    expect(result.x).toBeLessThan(100)
    expect(result.x).toBeGreaterThan(0)
  })

  it("never overshoots into negative retained velocity", () => {
    const result = computeDecayedVelocity({ x: 100, y: 0 }, 1, 1000)
    expect(result.x).toBe(0)
  })
})

describe("clampVectorLength", () => {
  it("leaves a vector under the max length untouched", () => {
    expect(clampVectorLength({ x: 3, y: 4 }, 10)).toEqual({ x: 3, y: 4 })
  })

  it("scales a vector over the max length down to exactly maxLength", () => {
    const result = clampVectorLength({ x: 3, y: 4 }, 2.5)
    expect(Math.sqrt(result.x ** 2 + result.y ** 2)).toBeCloseTo(2.5, 5)
    expect(result.x / result.y).toBeCloseTo(3 / 4, 5)
  })

  it("returns the zero vector as-is", () => {
    expect(clampVectorLength({ x: 0, y: 0 }, 10)).toEqual({ x: 0, y: 0 })
  })
})

describe("computePushImpulse", () => {
  it("scales the impulse by pushPower", () => {
    const result = computePushImpulse({ relativeVelocity: { x: 10, y: 0 }, pushPower: 2, maxImpulse: 1000 })
    expect(result).toEqual({ x: 20, y: 0 })
  })

  it("clamps an oversized impulse to maxImpulse", () => {
    const result = computePushImpulse({ relativeVelocity: { x: 1000, y: 0 }, pushPower: 5, maxImpulse: 50 })
    expect(Math.sqrt(result.x ** 2 + result.y ** 2)).toBeCloseTo(50, 5)
  })
})

describe("isBeyondRingBounds", () => {
  const arena = { center: { x: 0, y: 0 }, radius: 100 }

  it("is false well inside the ring", () => {
    expect(isBeyondRingBounds({ x: 10, y: 10 }, arena, 0)).toBe(false)
  })

  it("is true once past the radius", () => {
    expect(isBeyondRingBounds({ x: 150, y: 0 }, arena, 0)).toBe(true)
  })

  it("respects a positive margin narrowing the effective ring", () => {
    expect(isBeyondRingBounds({ x: 95, y: 0 }, arena, 10)).toBe(true)
  })

  it("respects a negative margin widening the effective ring", () => {
    expect(isBeyondRingBounds({ x: 105, y: 0 }, arena, -10)).toBe(false)
  })
})

describe("distanceFromCenter", () => {
  it("computes straightforward euclidean distance", () => {
    expect(distanceFromCenter({ x: 3, y: 4 }, { x: 0, y: 0 })).toBeCloseTo(5, 5)
  })
})

describe("judgeTimeoutWinner", () => {
  it("picks the actor closer to center", () => {
    expect(judgeTimeoutWinner({ player: 10, opponent: 50 }, 5)).toBe("player")
    expect(judgeTimeoutWinner({ player: 50, opponent: 10 }, 5)).toBe("opponent")
  })

  it("calls a draw when the difference is under the threshold", () => {
    expect(judgeTimeoutWinner({ player: 20, opponent: 22 }, 5)).toBe("draw")
  })

  it("treats an exact tie as a draw", () => {
    expect(judgeTimeoutWinner({ player: 30, opponent: 30 }, 5)).toBe("draw")
  })
})

describe("computeChaseSteering", () => {
  const arena = { center: { x: 0, y: 0 }, radius: 100 }

  it("moves toward the target when far from the edge and wobble is zero", () => {
    const result = computeChaseSteering({
      self: { x: 0, y: 0 },
      target: { x: 10, y: 0 },
      arena,
      aggression: 1,
      edgeAvoidance: 0,
      wobbleAngle: 0,
      wobbleStrength: 0,
    })
    expect(result.x).toBeGreaterThan(0)
    expect(result.y).toBeCloseTo(0, 5)
  })

  it("blends toward the center when near the ring edge with edge avoidance active", () => {
    const nearEdge = computeChaseSteering({
      self: { x: 95, y: 0 },
      target: { x: 100, y: 0 },
      arena,
      aggression: 0.5,
      edgeAvoidance: 1,
      wobbleAngle: 0,
      wobbleStrength: 0,
    })
    // Target is further from center than self, so pure chase would push further out (+x);
    // strong edge avoidance near the boundary should pull the result back toward center (-x).
    expect(nearEdge.x).toBeLessThan(0)
  })

  it("keeps the output length clamped to at most 1", () => {
    const result = computeChaseSteering({
      self: { x: 0, y: 0 },
      target: { x: 100, y: 0 },
      arena,
      aggression: 5,
      edgeAvoidance: 5,
      wobbleAngle: 0,
      wobbleStrength: 5,
    })
    expect(Math.sqrt(result.x ** 2 + result.y ** 2)).toBeLessThanOrEqual(1 + 1e-9)
  })

  it("is deterministic for the same inputs", () => {
    const args = {
      self: { x: 12, y: -8 },
      target: { x: -20, y: 30 },
      arena,
      aggression: 0.6,
      edgeAvoidance: 0.7,
      wobbleAngle: 1.23,
      wobbleStrength: 0.1,
    }
    expect(computeChaseSteering(args)).toEqual(computeChaseSteering(args))
  })
})
