import Phaser from "phaser"

/** Single-responsibility wrapper so nothing outside the runtime constructs Phaser.Game directly. */
export function createPhaserGame(config: Phaser.Types.Core.GameConfig): Phaser.Game {
  return new Phaser.Game(config)
}
