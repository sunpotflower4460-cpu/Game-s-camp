export type KitContext = {
  gameId: string
  recipeId?: string
  kitId: string
  phase: "skeleton"
}

export function createSkeletonKitContext(kitId: string): KitContext {
  return {
    gameId: "puni-sumo-forest-v1",
    recipeId: "puni-sumo-forest-v1",
    kitId,
    phase: "skeleton",
  }
}
