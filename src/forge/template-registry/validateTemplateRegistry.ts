import { existsSync } from "node:fs"

import { resolveTemplateManifestReferencePath } from "./loadTemplateRegistry"
import type { TemplateRegistry } from "./templateRegistry.types"

export type TemplateRegistryValidationResult = {
  ok: boolean
  errors: string[]
}

export function validateTemplateRegistry(
  registry: TemplateRegistry,
): TemplateRegistryValidationResult {
  const errors: string[] = []

  if (registry.entries.length === 0) {
    errors.push("No template manifests found in registry.")
  }

  const duplicateLocations = new Map<string, string[]>()
  for (const entry of registry.entries) {
    const paths = duplicateLocations.get(entry.manifest.id) ?? []
    paths.push(entry.manifestPath)
    duplicateLocations.set(entry.manifest.id, paths)
  }

  for (const [templateId, paths] of duplicateLocations) {
    if (paths.length <= 1) {
      continue
    }
    errors.push(`Duplicate template id found: ${templateId} (${paths.join(", ")})`)
  }

  for (const entry of registry.entries) {
    const slotNames = new Set<string>()
    for (const slot of entry.manifest.requiredSlots) {
      if (slotNames.has(slot.name)) {
        errors.push(
          `Duplicate slot name in template ${entry.manifest.id}: ${slot.name}`,
        )
      }
      slotNames.add(slot.name)
    }

    for (const slot of entry.manifest.optionalSlots) {
      if (slotNames.has(slot.name)) {
        errors.push(
          `Duplicate slot name in template ${entry.manifest.id}: ${slot.name}`,
        )
      }
      slotNames.add(slot.name)
    }

    for (const [fileKey, fileReference] of Object.entries(entry.manifest.files)) {
      const filePath = resolveTemplateManifestReferencePath(
        entry.manifestPath,
        fileReference,
      )
      if (!existsSync(filePath)) {
        errors.push(
          `Missing template file: ${entry.manifest.id} -> ${fileKey} (${fileReference})`,
        )
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  }
}
