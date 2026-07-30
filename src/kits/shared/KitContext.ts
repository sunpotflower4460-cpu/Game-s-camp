export type KitPhase = "skeleton" | "runtime-ready"

export type KitContext = {
  gameId: string
  recipeId?: string
  kitId: string
  phase: KitPhase
}

export function createKitContext(kitId: string, phase: KitPhase): KitContext {
  return {
    gameId: "puni-sumo-forest-v1",
    recipeId: "puni-sumo-forest-v1",
    kitId,
    phase,
  }
}
