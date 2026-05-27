import type { KitManifest } from "./kitManifest.zod"

export type KitRegistryEntry = {
  manifest: KitManifest
  manifestPath: string
}

export type KitRegistry = {
  entries: KitRegistryEntry[]
  byId: Map<string, KitRegistryEntry>
}
