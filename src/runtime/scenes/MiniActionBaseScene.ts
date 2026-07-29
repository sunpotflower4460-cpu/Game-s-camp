import Phaser from "phaser"
import { RUNTIME_ERROR_EVENT, type GeneratedGameDefinition } from "../phaser/runtimeGameDefinition.types"

/**
 * Shared base for the Phase 6.0 placeholder scenes. Catching each scene's own `onCreate()`
 * error here and re-emitting it on `this.game.events` keeps a failure scoped to the exact
 * Phaser instance that produced it, instead of relying on a page-wide `window` error listener
 * that would also catch unrelated errors from React or other hosts.
 */
export abstract class MiniActionBaseScene extends Phaser.Scene {
  protected readonly definition: GeneratedGameDefinition

  constructor(key: string, definition: GeneratedGameDefinition) {
    super(key)
    this.definition = definition
  }

  create(): void {
    try {
      this.onCreate()
    } catch (caught) {
      this.game.events.emit(RUNTIME_ERROR_EVENT, {
        message: caught instanceof Error ? caught.message : String(caught),
        cause: caught,
      })
    }
  }

  protected abstract onCreate(): void
}
