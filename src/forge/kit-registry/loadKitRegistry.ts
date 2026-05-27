import { readdirSync } from "node:fs"
import { join } from "node:path"

import { ReadJsonFileError, readJsonFile } from "../shared/readJsonFile"

import { kitManifestSchema } from "./kitManifest.zod"
import type { KitRegistry, KitRegistryEntry } from "./kitRegistry.types"

export class LoadKitRegistryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "LoadKitRegistryError"
  }
}

function findManifestPaths(rootDir: string): string[] {
  let entries
  try {
    entries = readdirSync(rootDir, { withFileTypes: true })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new LoadKitRegistryError(
      `Kit registry directory is not readable: ${rootDir} (${reason})`,
    )
  }

  const manifestPaths: string[] = []

  for (const entry of entries) {
    const path = join(rootDir, entry.name)

    if (entry.isDirectory()) {
      manifestPaths.push(...findManifestPaths(path))
      continue
    }

    if (entry.isFile() && entry.name === "kit.manifest.json") {
      manifestPaths.push(path)
    }
  }

  return manifestPaths.sort()
}

export function loadKitRegistry(rootDir = "kits"): KitRegistry {
  const entries: KitRegistryEntry[] = []

  for (const manifestPath of findManifestPaths(rootDir)) {
    let rawManifest: unknown

    try {
      rawManifest = readJsonFile(manifestPath)
    } catch (error) {
      if (error instanceof ReadJsonFileError) {
        throw new LoadKitRegistryError(error.message)
      }
      throw error
    }

    const parsed = kitManifestSchema.safeParse(rawManifest)
    if (!parsed.success) {
      throw new LoadKitRegistryError(
        `Invalid KitManifest: ${manifestPath}\n${JSON.stringify(parsed.error.format(), null, 2)}`,
      )
    }

    entries.push({
      manifest: parsed.data,
      manifestPath,
    })
  }

  const byId = new Map<string, KitRegistryEntry>()
  for (const entry of entries) {
    const existing = byId.get(entry.manifest.id)
    if (existing) {
      throw new LoadKitRegistryError(
        `Duplicate kit id found: ${entry.manifest.id} (${existing.manifestPath}, ${entry.manifestPath})`,
      )
    }
    byId.set(entry.manifest.id, entry)
  }

  return {
    entries,
    byId,
  }
}
