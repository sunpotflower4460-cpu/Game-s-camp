import type Phaser from "phaser"

/**
 * Null-safe teardown so callers never need to null-check before cleanup.
 *
 * `Phaser.Game#destroy()` only *schedules* teardown for the next animation frame step (see its
 * own JSDoc). Phaser also exposes a private, undocumented `runDestroy()` that performs that same
 * teardown immediately — but calling it before Phaser's own boot/scene-queue processing has run
 * at least once (e.g. during a React StrictMode mount -> cleanup -> mount that happens faster
 * than a single frame) throws inside `SceneManager.destroy()`, because the Scene Manager's
 * internal bookkeeping isn't in a state `runDestroy()` expects yet. Only the public, deferred
 * `destroy()` API is safe to call unconditionally here.
 */
export function destroyPhaserGame(game: Phaser.Game | null | undefined): void {
  if (!game) {
    return
  }
  game.destroy(true, false)
}
