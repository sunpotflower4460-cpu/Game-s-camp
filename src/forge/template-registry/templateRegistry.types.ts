import type { TemplateManifest } from "./templateManifest.zod"

export type TemplateRegistryEntry = {
  manifest: TemplateManifest
  manifestPath: string
}

export type TemplateRegistry = {
  entries: TemplateRegistryEntry[]
  byId: Map<string, TemplateRegistryEntry>
}
