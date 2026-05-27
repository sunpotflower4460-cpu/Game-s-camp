export type GameRuntimeStatus = "idle" | "loading" | "ready" | "error"

export type GameRuntimeSnapshot = {
  status: GameRuntimeStatus
  activeGameId?: string
  message: string
}

export function createInitialRuntimeSnapshot(): GameRuntimeSnapshot {
  return {
    status: "idle",
    message: "Runtime is not initialized yet.",
  }
}
