import type Phaser from "phaser"

/** Null-safe teardown so callers never need to null-check before cleanup. */
export function destroyPhaserGame(game: Phaser.Game | null | undefined): void {
  if (!game) {
    return
  }
  game.destroy(true, false)
}
