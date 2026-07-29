import { randomBytes } from "node:crypto"
import { dirname, isAbsolute, relative, resolve } from "node:path"
import { existsSync, lstatSync, mkdirSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs"

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

function findNearestExistingAncestor(path: string): string {
  let current = path
  while (!existsSync(current)) {
    const parent = dirname(current)
    if (parent === current) {
      return current
    }
    current = parent
  }
  return current
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

  // `mkdirSync(..., { recursive: true })` follows any symlinked ancestor directory while
  // creating missing path segments, so it could create real directories outside `generatedRoot`
  // before the post-creation check below runs. Check the deepest ALREADY-EXISTING ancestor's
  // real path first — if it resolves outside `generatedRoot`, refuse before creating anything.
  const existingAncestor = findNearestExistingAncestor(outputDir)
  if (isWithin(generatedRootAbs, existingAncestor)) {
    const realExistingAncestor = realpathSync(existingAncestor)
    if (!isWithin(generatedRootAbs, realExistingAncestor)) {
      throw new UnsafeGeneratedWritePathError(
        `Refusing to create directories through a symlink that escapes generated/: ${args.outputPath}`,
        args.outputPath,
      )
    }
  }

  mkdirSync(outputDir, { recursive: true })

  const realOutputDir = realpathSync(outputDir)
  if (!isWithin(generatedRootAbs, realOutputDir)) {
    throw new UnsafeGeneratedWritePathError(
      `Refusing to write through a symlink that escapes generated/: ${args.outputPath}`,
      args.outputPath,
    )
  }

  // `writeFileSync` follows a symlink at the destination itself (even a dangling one), which
  // would let an existing symlink redirect this write outside `generatedRoot` even though the
  // checks above only examined its containing directory. `lstatSync` never follows symlinks, so
  // this rejects that case before anything is opened for writing.
  let existingStat: ReturnType<typeof lstatSync> | undefined
  try {
    existingStat = lstatSync(outputPathAbs)
  } catch {
    existingStat = undefined
  }
  if (existingStat?.isSymbolicLink()) {
    throw new UnsafeGeneratedWritePathError(
      `Refusing to write through an existing symlink at the destination: ${args.outputPath}`,
      args.outputPath,
    )
  }

  // A destination that's hard-linked (nlink > 1) to a file elsewhere — e.g. under custom/ —
  // looks like an ordinary file to `lstatSync` above, but writing into it in place would
  // truncate and overwrite whatever else shares that same inode. Reject it, then always write
  // via a temp file in the same directory followed by an atomic rename: rename() replaces the
  // directory entry itself rather than the inode's contents, so it can't corrupt a hard-linked
  // file even if this check somehow missed one (and it makes the write atomic as a side effect).
  if (existingStat?.isFile() && existingStat.nlink > 1) {
    throw new UnsafeGeneratedWritePathError(
      `Refusing to write into a hard-linked destination (nlink=${existingStat.nlink}): ${args.outputPath}`,
      args.outputPath,
    )
  }

  const tempPath = `${outputPathAbs}.tmp-${process.pid}-${randomBytes(6).toString("hex")}`
  writeFileSync(tempPath, args.contents, "utf8")
  try {
    renameSync(tempPath, outputPathAbs)
  } catch (error) {
    rmSync(tempPath, { force: true })
    throw error
  }
  return outputPathAbs
}
