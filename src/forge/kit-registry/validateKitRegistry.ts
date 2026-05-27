import { existsSync } from "node:fs"

import type { KitRegistry } from "./kitRegistry.types"
import { resolveManifestReferencePath } from "./loadKitRegistry"

export type KitRegistryValidationResult = {
  ok: boolean
  errors: string[]
}

export function validateKitRegistry(
  registry: KitRegistry,
): KitRegistryValidationResult {
  const errors: string[] = []

  if (registry.entries.length === 0) {
    errors.push("No kit manifests found in registry.")
  }

  const duplicateLocations = new Map<string, string[]>()
  for (const entry of registry.entries) {
    const paths = duplicateLocations.get(entry.manifest.id) ?? []
    paths.push(entry.manifestPath)
    duplicateLocations.set(entry.manifest.id, paths)
  }

  for (const [kitId, paths] of duplicateLocations) {
    if (paths.length <= 1) {
      continue
    }
    errors.push(
      `Duplicate kit id found: ${kitId} (${paths.join(", ")})`,
    )
  }

  for (const entry of registry.entries) {
    const entryPath = resolveManifestReferencePath(
      entry.manifestPath,
      entry.manifest.entry,
    )
    if (!existsSync(entryPath)) {
      errors.push(
        `Missing entry file: ${entry.manifest.id} -> ${entry.manifest.entry}`,
      )
    }

    if (entry.manifest.testFixture) {
      const fixturePath = resolveManifestReferencePath(
        entry.manifestPath,
        entry.manifest.testFixture,
      )
      if (!existsSync(fixturePath)) {
        errors.push(
          `Missing test fixture file: ${entry.manifest.id} -> ${entry.manifest.testFixture}`,
        )
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  }
}
