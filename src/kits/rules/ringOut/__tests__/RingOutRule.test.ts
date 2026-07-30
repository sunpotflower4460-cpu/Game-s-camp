import { describe, expect, it } from "vitest"
import { createRingOutRuleRuntimeAdapter } from "../RingOutRule"
import { ringOutRuleFixture } from "../RingOutRule.fixture"
import { createFakeMiniActionGameKitContext } from "../../../../runtime/scenes/__tests__/fakeMiniActionGameKitContext"

const ARENA = { center: { x: 0, y: 0 }, radius: 100 }

describe("controller.ringOut.v1 runtime adapter", () => {
  it("identifies itself with the fixture's kitId", () => {
    const fake = createFakeMiniActionGameKitContext()
    const adapter = createRingOutRuleRuntimeAdapter(fake.context)
    expect(adapter.kitId).toBe(ringOutRuleFixture.kitId)
  })

  it("does nothing before arena bounds are known", () => {
    const fake = createFakeMiniActionGameKitContext()
    const adapter = createRingOutRuleRuntimeAdapter(fake.context)
    adapter.onUpdate?.(16)
    expect(fake.getOutcome()).toBeUndefined()
  })

  it("reports a loss when the player crosses the ring boundary", () => {
    const fake = createFakeMiniActionGameKitContext()
    fake.setArenaBounds(ARENA)
    fake.setActorPosition("player", { x: 150, y: 0 })
    fake.setActorPosition("opponent", { x: 0, y: 0 })
    const adapter = createRingOutRuleRuntimeAdapter(fake.context)

    adapter.onUpdate?.(16)

    expect(fake.getOutcome()?.result).toBe("lose")
  })

  it("reports a win when the opponent crosses the ring boundary", () => {
    const fake = createFakeMiniActionGameKitContext()
    fake.setArenaBounds(ARENA)
    fake.setActorPosition("player", { x: 0, y: 0 })
    fake.setActorPosition("opponent", { x: -150, y: 0 })
    const adapter = createRingOutRuleRuntimeAdapter(fake.context)

    adapter.onUpdate?.(16)

    expect(fake.getOutcome()?.result).toBe("win")
  })

  it("reports a draw when both actors are out at once", () => {
    const fake = createFakeMiniActionGameKitContext()
    fake.setArenaBounds(ARENA)
    fake.setActorPosition("player", { x: 150, y: 0 })
    fake.setActorPosition("opponent", { x: -150, y: 0 })
    const adapter = createRingOutRuleRuntimeAdapter(fake.context)

    adapter.onUpdate?.(16)

    expect(fake.getOutcome()?.result).toBe("draw")
  })

  it("latches the first outcome and ignores later ring-outs", () => {
    const fake = createFakeMiniActionGameKitContext()
    fake.setArenaBounds(ARENA)
    fake.setActorPosition("player", { x: 150, y: 0 })
    const adapter = createRingOutRuleRuntimeAdapter(fake.context)

    adapter.onUpdate?.(16)
    expect(fake.getOutcome()?.result).toBe("lose")

    fake.setActorPosition("player", { x: 0, y: 0 })
    fake.setActorPosition("opponent", { x: -150, y: 0 })
    adapter.onUpdate?.(16)

    expect(fake.getOutcome()?.result).toBe("lose")
  })

  it("resolves the winner by distance from center once the round times out", () => {
    const fake = createFakeMiniActionGameKitContext({ roundTimeSec: 10 })
    fake.setArenaBounds(ARENA)
    fake.setActorPosition("player", { x: 10, y: 0 })
    fake.setActorPosition("opponent", { x: 60, y: 0 })
    fake.setElapsedMs(10_000)
    const adapter = createRingOutRuleRuntimeAdapter(fake.context)

    adapter.onUpdate?.(16)

    expect(fake.getOutcome()?.result).toBe("win")
  })

  it("calls a draw on timeout when both actors are equally close to center", () => {
    const fake = createFakeMiniActionGameKitContext({ roundTimeSec: 10 })
    fake.setArenaBounds(ARENA)
    fake.setActorPosition("player", { x: 20, y: 0 })
    fake.setActorPosition("opponent", { x: -20, y: 0 })
    fake.setElapsedMs(10_000)
    const adapter = createRingOutRuleRuntimeAdapter(fake.context)

    adapter.onUpdate?.(16)

    expect(fake.getOutcome()?.result).toBe("draw")
  })

  it("does not resolve before the round time has elapsed", () => {
    const fake = createFakeMiniActionGameKitContext({ roundTimeSec: 10 })
    fake.setArenaBounds(ARENA)
    fake.setActorPosition("player", { x: 10, y: 0 })
    fake.setActorPosition("opponent", { x: 60, y: 0 })
    fake.setElapsedMs(5_000)
    const adapter = createRingOutRuleRuntimeAdapter(fake.context)

    adapter.onUpdate?.(16)

    expect(fake.getOutcome()).toBeUndefined()
  })

  it("consumes a forced result after reporting it, instead of leaving it to re-trigger on a Replay", () => {
    // The debug hook's override state lives at module scope, so it survives a Replay's fresh
    // Scene/Kit instances (unlike seed/timerOverrideSec/actorPositionOverride, which a test author
    // would reasonably want to persist across rounds) — without clearing it, the next round would
    // silently re-force the same outcome before any natural ring-out/timeout could occur.
    const fake = createFakeMiniActionGameKitContext()
    fake.setArenaBounds(ARENA)
    fake.setDebugOverride({ forceResult: { result: "win", reason: "round 1 forced win" } })
    const adapter = createRingOutRuleRuntimeAdapter(fake.context)

    adapter.onUpdate?.(16)

    expect(fake.getOutcome()?.reason).toBe("round 1 forced win")
    expect(fake.getDebugOverride()?.forceResult).toBeUndefined()
  })

  it("respects a debug-hook forced result", () => {
    const fake = createFakeMiniActionGameKitContext()
    fake.setArenaBounds(ARENA)
    fake.setDebugOverride({ forceResult: { result: "draw", reason: "forced by e2e" } })
    const adapter = createRingOutRuleRuntimeAdapter(fake.context)

    adapter.onUpdate?.(16)

    expect(fake.getOutcome()).toEqual({ result: "draw", reason: "forced by e2e" })
  })

  it("respects a debug-hook timer override for timeout resolution", () => {
    const fake = createFakeMiniActionGameKitContext({ roundTimeSec: 60 })
    fake.setArenaBounds(ARENA)
    fake.setActorPosition("player", { x: 10, y: 0 })
    fake.setActorPosition("opponent", { x: 60, y: 0 })
    fake.setElapsedMs(5_000)
    fake.setDebugOverride({ timerOverrideSec: 5 })
    const adapter = createRingOutRuleRuntimeAdapter(fake.context)

    adapter.onUpdate?.(16)

    expect(fake.getOutcome()?.result).toBe("win")
  })
})
