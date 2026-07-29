import { dirname, isAbsolute, relative, resolve } from "node:path"
import { mkdirSync, realpathSync, writeFileSync } from "node:fs"

export class UnsafeGeneratedWritePathError extends Error {
  readonly attemptedPath: string

  constructor(message: string, attemptedPath: string) {
    super(message)
    this.name = "UnsafeGeneratedWritePathError"
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
 * The single place every generator script must write through. Enforces that output stays under
 * `generatedRoot`, rejects any write under `customRoot` outright (even if it would otherwise
 * resolve inside `generatedRoot`), and re-checks after directory creation so a symlinked
 * ancestor directory can't silently redirect a write outside `generatedRoot`.
 */
export function writeGeneratedFile(args: {
  generatedRoot: string
  customRoot?: string
  outputPath: string
  contents: string
}): string {
  const generatedRootAbs = resolve(args.generatedRoot)
  const customRootAbs = resolve(args.customRoot ?? "custom")
  const outputPathAbs = resolve(args.outputPath)

  if (isWithin(customRootAbs, outputPathAbs)) {
    throw new UnsafeGeneratedWritePathError(
      `Refusing to write into the protected custom/ directory: ${args.outputPath}`,
      args.outputPath,
    )
  }

  if (!isWithin(generatedRootAbs, outputPathAbs)) {
    throw new UnsafeGeneratedWritePathError(
      `Refusing to write outside the generated/ root (${args.generatedRoot}): ${args.outputPath}`,
      args.outputPath,
    )
  }

  const outputDir = dirname(outputPathAbs)
  mkdirSync(outputDir, { recursive: true })

  const realOutputDir = realpathSync(outputDir)
  if (!isWithin(generatedRootAbs, realOutputDir)) {
    throw new UnsafeGeneratedWritePathError(
      `Refusing to write through a symlink that escapes generated/: ${args.outputPath}`,
      args.outputPath,
    )
  }

  writeFileSync(outputPathAbs, args.contents, "utf8")
  return outputPathAbs
}
