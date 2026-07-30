import { describe, expect, it } from "vitest"
import { createPuniOpponentAIControllerRuntimeAdapter } from "../PuniOpponentAIController"
import { puniOpponentAIControllerFixture } from "../PuniOpponentAIController.fixture"
import { createFakeMiniActionGameKitContext } from "../../../../runtime/scenes/__tests__/fakeMiniActionGameKitContext"

const ARENA = { center: { x: 0, y: 0 }, radius: 200 }

describe("controller.puniOpponentAI.v1 runtime adapter", () => {
  it("identifies itself with the fixture's kitId", () => {
    const fake = createFakeMiniActionGameKitContext()
    const adapter = createPuniOpponentAIControllerRuntimeAdapter(fake.context)
    expect(adapter.kitId).toBe(puniOpponentAIControllerFixture.kitId)
  })

  it("does nothing before arena bounds are known", () => {
    const fake = createFakeMiniActionGameKitContext()
    const adapter = createPuniOpponentAIControllerRuntimeAdapter(fake.context)
    adapter.onUpdate?.(16)
    expect(fake.getActorVelocity("opponent")).toEqual({ x: 0, y: 0 })
  })

  it("moves toward the player when far from the ring edge", () => {
    const fake = createFakeMiniActionGameKitContext({ aggression: 1, edgeAvoidance: 0, maxSpeed: 170 })
    fake.setArenaBounds(ARENA)
    fake.setActorPosition("opponent", { x: 0, y: 0 })
    fake.setActorPosition("player", { x: 50, y: 0 })
    const adapter = createPuniOpponentAIControllerRuntimeAdapter(fake.context)

    adapter.onUpdate?.(16)

    const velocity = fake.getActorVelocity("opponent")
    expect(velocity.x).toBeGreaterThan(0)
  })

  it("stops moving once the round is paused", () => {
    const fake = createFakeMiniActionGameKitContext({ aggression: 1 })
    fake.setArenaBounds(ARENA)
    fake.setActorPosition("player", { x: 50, y: 0 })
    fake.setPaused(true)
    const adapter = createPuniOpponentAIControllerRuntimeAdapter(fake.context)

    adapter.onUpdate?.(16)

    expect(fake.getActorVelocity("opponent")).toEqual({ x: 0, y: 0 })
  })

  it("only resamples the player's position once the reaction delay has elapsed", () => {
    const fake = createFakeMiniActionGameKitContext({ reactionDelayMs: 1000, aggression: 1, edgeAvoidance: 0 })
    fake.setArenaBounds(ARENA)
    fake.setActorPosition("opponent", { x: 0, y: 0 })
    fake.setActorPosition("player", { x: 100, y: 0 })
    const adapter = createPuniOpponentAIControllerRuntimeAdapter(fake.context)

    fake.setElapsedMs(0)
    adapter.onUpdate?.(16)
    const firstVelocityX = fake.getActorVelocity("opponent").x

    // Player teleports far in the opposite direction, but the reaction delay hasn't elapsed yet.
    fake.setActorPosition("player", { x: -100, y: 0 })
    fake.setElapsedMs(200)
    adapter.onUpdate?.(16)

    expect(fake.getActorVelocity("opponent").x).toBeCloseTo(firstVelocityX, 5)
  })

  it("produces deterministic output for the same seed", () => {
    const fakeA = createFakeMiniActionGameKitContext({ aggression: 0.6, edgeAvoidance: 0.7 })
    fakeA.setArenaBounds(ARENA)
    fakeA.setActorPosition("opponent", { x: 190, y: 0 })
    fakeA.setActorPosition("player", { x: 0, y: 0 })
    fakeA.setDebugOverride({ seed: 42 })
    const adapterA = createPuniOpponentAIControllerRuntimeAdapter(fakeA.context)
    adapterA.onCreate?.()

    const fakeB = createFakeMiniActionGameKitContext({ aggression: 0.6, edgeAvoidance: 0.7 })
    fakeB.setArenaBounds(ARENA)
    fakeB.setActorPosition("opponent", { x: 190, y: 0 })
    fakeB.setActorPosition("player", { x: 0, y: 0 })
    fakeB.setDebugOverride({ seed: 42 })
    const adapterB = createPuniOpponentAIControllerRuntimeAdapter(fakeB.context)
    adapterB.onCreate?.()

    for (let elapsed = 0; elapsed <= 3000; elapsed += 900) {
      fakeA.setElapsedMs(elapsed)
      fakeB.setElapsedMs(elapsed)
      adapterA.onUpdate?.(900)
      adapterB.onUpdate?.(900)
    }

    expect(fakeA.getActorVelocity("opponent")).toEqual(fakeB.getActorVelocity("opponent"))
  })
})
