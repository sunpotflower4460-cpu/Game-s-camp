export type SceneHostState = {
  mounted: boolean
  sceneId?: string
}

export function createSceneHostState(): SceneHostState {
  return {
    mounted: false,
  }
}
