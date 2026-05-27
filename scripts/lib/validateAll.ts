import { readdirSync } from "node:fs"
import { join } from "node:path"
import { z } from "zod"

import { ReadJsonFileError, readJsonFile } from "../../src/forge/shared/readJsonFile"

type ValidateAllOptions = {
  label: string
  rootDir: string
  suffix: string
  schema: z.ZodTypeAny
}

function findFiles(rootDir: string, suffix: string): string[] {
  const entries = readdirSync(rootDir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const path = join(rootDir, entry.name)
    if (entry.isDirectory()) {
      files.push(...findFiles(path, suffix))
      continue
    }
    if (entry.isFile() && entry.name.endsWith(suffix)) {
      files.push(path)
    }
  }

  return files
}

export function validateAll({ label, rootDir, suffix, schema }: ValidateAllOptions): void {
  const files = findFiles(rootDir, suffix).sort()

  if (files.length === 0) {
    console.warn(`[warn] No ${label} files found under ${rootDir}`)
    return
  }

  let hasFailure = false

  for (const filePath of files) {
    let json: unknown
    try {
      json = readJsonFile(filePath)
    } catch (error) {
      hasFailure = true
      if (error instanceof ReadJsonFileError) {
        console.error(`[fail] ${label}: ${error.message}`)
      } else {
        const reason = error instanceof Error ? error.message : String(error)
        console.error(`[fail] ${label}: ${filePath} (${reason})`)
      }
      continue
    }

    const parsed = schema.safeParse(json)
    if (parsed.success) {
      console.log(`[ok] ${label}: ${filePath}`)
      continue
    }

    hasFailure = true
    console.error(`[fail] ${label}: ${filePath}`)
    console.error(JSON.stringify(parsed.error.format(), null, 2))
  }

  if (hasFailure) {
    process.exit(1)
  }
}
