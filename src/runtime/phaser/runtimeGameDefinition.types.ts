/**
 * Typed shape for a Forge-generated game definition, consumed by the generic Phaser runtime.
 * Phase 6.0 only defines this contract; `generated/games/puni-sumo/` is not wired to produce
 * a real instance of it yet (that is Phase 6.1).
 */
export type GeneratedGameDefinitionSlots = {
  playerController: string
  opponentController: string
  mainStage: string
  winLoseRule: string
  resultUi: string
  mainCamera: string
  timerUi?: string
  visualFlavor?: string
  impactAudio?: string
}

export type GeneratedGameDefinition = {
  schemaVersion: "0.1"
  gameId: string
  title: string
  engine: "phaser"
  templateId: string
  scenes: {
    title: string
    game: string
    result: string
  }
  slots: GeneratedGameDefinitionSlots
  tuning: Record<string, string | number | boolean>
}

export type RuntimeStatus = "idle" | "loading" | "ready" | "playing" | "result" | "error"

export type RuntimeErrorInfo = {
  message: string
  cause?: unknown
}

export type RuntimeSnapshot = {
  status: RuntimeStatus
  gameId?: string
  message: string
  error?: RuntimeErrorInfo
}

/** Custom Phaser game-level event used by scenes to report runtime state transitions. */
export const RUNTIME_STATUS_EVENT = "forge-runtime:status"

/**
 * Custom Phaser game-level event a scene emits (on its own `this.game`) when one of its own
 * lifecycle methods throws. Scoped to the Phaser instance that produced it, unlike a page-wide
 * `window` error listener, which would also catch unrelated errors from React or other hosts.
 */
export const RUNTIME_ERROR_EVENT = "forge-runtime:error"

export function createIdleRuntimeSnapshot(): RuntimeSnapshot {
  return {
    status: "idle",
    message: "Runtime is not initialized yet.",
  }
}
