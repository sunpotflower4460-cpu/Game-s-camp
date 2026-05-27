import { readdirSync } from "node:fs"
import { dirname, isAbsolute, join, resolve } from "node:path"

import { ReadJsonFileError, readJsonFile } from "../shared/readJsonFile"

import { templateManifestSchema } from "./templateManifest.zod"
import type { TemplateRegistry, TemplateRegistryEntry } from "./templateRegistry.types"

export class LoadTemplateRegistryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "LoadTemplateRegistryError"
  }
}

export function resolveTemplateManifestReferencePath(
  manifestPath: string,
  referencePath: string,
): string {
  if (isAbsolute(referencePath)) {
    return referencePath
  }

  if (referencePath.startsWith("./") || referencePath.startsWith("../")) {
    return resolve(dirname(manifestPath), referencePath)
  }

  return resolve(referencePath)
}

function findManifestPaths(rootDir: string): string[] {
  let entries
  try {
    entries = readdirSync(rootDir, { withFileTypes: true })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new LoadTemplateRegistryError(
      `Template registry directory is not readable: ${rootDir} (${reason})`,
    )
  }

  const manifestPaths: string[] = []

  for (const entry of entries) {
    const path = join(rootDir, entry.name)

    if (entry.isDirectory()) {
      manifestPaths.push(...findManifestPaths(path))
      continue
    }

    if (entry.isFile() && entry.name === "template.manifest.json") {
      manifestPaths.push(path)
    }
  }

  return manifestPaths.sort()
}

export function loadTemplateRegistry(rootDir = "templates"): TemplateRegistry {
  const entries: TemplateRegistryEntry[] = []

  for (const manifestPath of findManifestPaths(rootDir)) {
    let rawManifest: unknown

    try {
      rawManifest = readJsonFile(manifestPath)
    } catch (error) {
      if (error instanceof ReadJsonFileError) {
        throw new LoadTemplateRegistryError(error.message)
      }
      throw error
    }

    const parsed = templateManifestSchema.safeParse(rawManifest)
    if (!parsed.success) {
      throw new LoadTemplateRegistryError(
        `Invalid TemplateManifest: ${manifestPath}\n${JSON.stringify(parsed.error.format(), null, 2)}`,
      )
    }

    entries.push({
      manifest: parsed.data,
      manifestPath,
    })
  }

  const byId = new Map<string, TemplateRegistryEntry>()
  for (const entry of entries) {
    const existing = byId.get(entry.manifest.id)
    if (existing) {
      throw new LoadTemplateRegistryError(
        `Duplicate template id found: ${entry.manifest.id} (${existing.manifestPath}, ${entry.manifestPath})`,
      )
    }
    byId.set(entry.manifest.id, entry)
  }

  return {
    entries,
    byId,
  }
}
