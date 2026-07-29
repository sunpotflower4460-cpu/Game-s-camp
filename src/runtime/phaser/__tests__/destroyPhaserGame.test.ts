import { describe, expect, it, vi } from "vitest"
import type Phaser from "phaser"
import { destroyPhaserGame } from "../destroyPhaserGame"

describe("destroyPhaserGame", () => {
  it("is a no-op for null or undefined, so callers never need to null-check first", () => {
    expect(() => destroyPhaserGame(null)).not.toThrow()
    expect(() => destroyPhaserGame(undefined)).not.toThrow()
  })

  it("calls game.destroy(true, false) exactly once for a live instance", () => {
    const destroy = vi.fn()
    const fakeGame = { destroy } as unknown as Phaser.Game

    destroyPhaserGame(fakeGame)

    expect(destroy).toHaveBeenCalledTimes(1)
    expect(destroy).toHaveBeenCalledWith(true, false)
  })

})
