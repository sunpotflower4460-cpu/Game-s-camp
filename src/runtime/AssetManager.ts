export type AssetManagerState = {
  loaded: boolean
  assetCount: number
}

export function createAssetManagerState(): AssetManagerState {
  return {
    loaded: false,
    assetCount: 0,
  }
}
