import { isAbsolute, join, relative, resolve } from "node:path"
import { existsSync, readdirSync, rmSync } from "node:fs"

export class UnsafeGeneratedPrunePathError extends Error {
  readonly attemptedPath: string

  constructor(message: string, attemptedPath: string) {
    super(message)
    this.name = "UnsafeGeneratedPrunePathError"
    this.attemptedPath = attemptedPath
  }
}

function isWithin(root: string, target: string): boolean {
  if (root === target) {
    return true
  }
  const rel = relative(root, target)
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel)
}

/**
 * Deletes any direct entry in `outputDir` whose name isn't in `expectedFileNames`, so a renamed
 * or removed Template file mapping can't leave a stale generated file (and a stale import of it)
 * behind after regeneration. Only touches direct children of `outputDir` — one flat directory per
 * game, matching the current Template file layout — and refuses to run outside `generatedRoot`
 * or inside `customRoot`, mirroring `writeGeneratedFile`'s boundary checks. Directories are left
 * alone (the current Template layout never nests output), and a symlinked entry is removed as a
 * link only, never through it, since `rmSync` doesn't follow symlinks.
 */
export function pruneStaleGeneratedFiles(args: {
  generatedRoot: string
  customRoot?: string
  outputDir: string
  expectedFileNames: string[]
}): string[] {
  const generatedRootAbs = resolve(args.generatedRoot)
  const customRootAbs = resolve(args.customRoot ?? "custom")
  const outputDirAbs = resolve(args.outputDir)

  if (isWithin(customRootAbs, outputDirAbs)) {
    throw new UnsafeGeneratedPrunePathError(
      `Refusing to prune inside the protected custom/ directory: ${args.outputDir}`,
      args.outputDir,
    )
  }
  if (!isWithin(generatedRootAbs, outputDirAbs)) {
    throw new UnsafeGeneratedPrunePathError(
      `Refusing to prune outside the generated/ root (${args.generatedRoot}): ${args.outputDir}`,
      args.outputDir,
    )
  }

  if (!existsSync(outputDirAbs)) {
    return []
  }

  const expected = new Set(args.expectedFileNames)
  const removed: string[] = []
  for (const entry of readdirSync(outputDirAbs, { withFileTypes: true })) {
    if (!entry.isFile() && !entry.isSymbolicLink()) {
      continue
    }
    if (expected.has(entry.name)) {
      continue
    }
    const entryPath = join(outputDirAbs, entry.name)
    rmSync(entryPath)
    removed.push(entryPath)
  }
  return removed
}
