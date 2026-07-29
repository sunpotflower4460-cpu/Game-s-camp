import { execFileSync } from "node:child_process"
import {
  existsSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { UnsafeGeneratedWritePathError, writeGeneratedFile } from "../writeGeneratedFile"

// Mounts a size-capped tmpfs so a write that exceeds its capacity fails with a real ENOSPC —
// the only reliable, non-mocked way to reproduce "the initial write to the temp path partially
// creates the file, then fails" (as opposed to failing before creating anything at all, which
// wouldn't distinguish the fix from the bug it fixes). Returns null if mounting isn't permitted
// in this environment (e.g. an unprivileged CI container), so the test can skip instead of
// false-failing on an unrelated platform limitation.
function withTinyTmpfs<T>(sizeBytes: number, run: (mountPoint: string) => T): T | null {
  const mountPoint = mkdtempSync(join(tmpdir(), "forge-tinyfs-"))
  try {
    execFileSync("mount", ["-t", "tmpfs", "-o", `size=${sizeBytes}`, "tmpfs", mountPoint], {
      stdio: "ignore",
    })
  } catch {
    rmSync(mountPoint, { recursive: true, force: true })
    return null
  }
  try {
    return run(mountPoint)
  } finally {
    execFileSync("umount", [mountPoint])
    rmSync(mountPoint, { recursive: true, force: true })
  }
}

describe("writeGeneratedFile", () => {
  let workDir: string
  let generatedRoot: string
  let customRoot: string

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), "forge-safety-"))
    generatedRoot = join(workDir, "generated")
    customRoot = join(workDir, "custom")
    mkdirSync(generatedRoot, { recursive: true })
    mkdirSync(customRoot, { recursive: true })
  })

  afterEach(() => {
    rmSync(workDir, { recursive: true, force: true })
  })

  it("writes a file inside generated/, creating missing directories", () => {
    const outputPath = join(generatedRoot, "games", "puni-sumo", "gameDefinition.ts")

    writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: "export const x = 1\n" })

    expect(readFileSync(outputPath, "utf8")).toBe("export const x = 1\n")
  })

  it("rejects path traversal that escapes generated/", () => {
    const outputPath = join(generatedRoot, "..", "escaped.ts")

    expect(() =>
      writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: "x" }),
    ).toThrow(UnsafeGeneratedWritePathError)
  })

  it("rejects an absolute path outside generated/", () => {
    const outputPath = join(workDir, "outside.ts")

    expect(() =>
      writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: "x" }),
    ).toThrow(UnsafeGeneratedWritePathError)
  })

  it("rejects any write path under custom/, even when nominally computed relative to generatedRoot", () => {
    const outputPath = join(customRoot, "sneaky.ts")

    expect(() =>
      writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: "x" }),
    ).toThrow(UnsafeGeneratedWritePathError)
  })

  it("rejects writing through a symlinked directory that escapes generated/", () => {
    const outsideDir = join(workDir, "outside-real")
    mkdirSync(outsideDir, { recursive: true })
    const linkPath = join(generatedRoot, "escape-link")
    symlinkSync(outsideDir, linkPath, "dir")
    const outputPath = join(linkPath, "sneaky.ts")

    expect(() =>
      writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: "x" }),
    ).toThrow(UnsafeGeneratedWritePathError)
  })

  it("rejects writing through a destination that is itself a symlink escaping generated/, without touching the target", () => {
    const outsideTarget = join(workDir, "outside-target.ts")
    writeFileSync(outsideTarget, "original contents\n", "utf8")
    const outputPath = join(generatedRoot, "gameDefinition.ts")
    symlinkSync(outsideTarget, outputPath)

    expect(() =>
      writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: "malicious\n" }),
    ).toThrow(UnsafeGeneratedWritePathError)
    expect(readFileSync(outsideTarget, "utf8")).toBe("original contents\n")
  })

  it("rejects creating missing subdirectories through a symlinked ancestor, without creating anything outside generated/", () => {
    const outsideDir = join(workDir, "outside-real")
    mkdirSync(outsideDir, { recursive: true })
    const linkPath = join(generatedRoot, "escape-link")
    symlinkSync(outsideDir, linkPath, "dir")
    const outputPath = join(linkPath, "nested", "gameDefinition.ts")

    expect(() =>
      writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: "x" }),
    ).toThrow(UnsafeGeneratedWritePathError)
    expect(existsSync(join(outsideDir, "nested"))).toBe(false)
  })

  it("rejects writing into a hard-linked destination, without touching the linked file", () => {
    const linkedElsewhere = join(customRoot, "shared.ts")
    writeFileSync(linkedElsewhere, "original contents\n", "utf8")
    const outputPath = join(generatedRoot, "gameDefinition.ts")
    linkSync(linkedElsewhere, outputPath)

    expect(() =>
      writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: "malicious\n" }),
    ).toThrow(UnsafeGeneratedWritePathError)
    expect(readFileSync(linkedElsewhere, "utf8")).toBe("original contents\n")
  })

  it("rejects writing into generated/ when customRoot is itself a symlink aliasing that location", () => {
    const aliasedCustomTarget = join(generatedRoot, "aliased-custom")
    mkdirSync(aliasedCustomTarget, { recursive: true })
    rmSync(customRoot, { recursive: true, force: true })
    symlinkSync(aliasedCustomTarget, customRoot, "dir")

    const outputPath = join(aliasedCustomTarget, "rules.ts")

    expect(() =>
      writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: "x" }),
    ).toThrow(UnsafeGeneratedWritePathError)
  })

  it("rejects writing through a dangling customRoot symlink whose target gets created by this same write's mkdirSync", () => {
    // customRoot is a symlink to a location under generatedRoot that doesn't exist yet, so at the
    // start of resolveSafeGeneratedWritePath it's dangling (existsSync is false) and its "real"
    // path can't be resolved. The output path being written sits inside that not-yet-existing
    // target, so `mkdirSync(outputDir, { recursive: true })` materializes it as a side effect of
    // creating the output directory — which must not let the stale pre-creation resolution of
    // customRoot bypass the final custom/-alias check.
    const aliasTarget = join(generatedRoot, "alias-target")
    rmSync(customRoot, { recursive: true, force: true })
    symlinkSync(aliasTarget, customRoot, "dir")
    const outputPath = join(aliasTarget, "nested", "rules.ts")

    expect(() =>
      writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: "x" }),
    ).toThrow(UnsafeGeneratedWritePathError)
    expect(existsSync(outputPath)).toBe(false)
  })

  it("rejects writing through a destination that is a dangling symlink", () => {
    const outputPath = join(generatedRoot, "gameDefinition.ts")
    symlinkSync(join(workDir, "does-not-exist.ts"), outputPath)

    expect(() =>
      writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: "x" }),
    ).toThrow(UnsafeGeneratedWritePathError)
  })

  it("leaves no orphaned temp file when the initial write to the temp path itself fails (disk full)", () => {
    const leftoverFiles = withTinyTmpfs(64 * 1024, (mountPoint) => {
      const tinyGeneratedRoot = join(mountPoint, "generated")
      mkdirSync(tinyGeneratedRoot, { recursive: true })
      // Leave only a few KB free so the real write below can't possibly fit.
      writeFileSync(join(mountPoint, "filler.bin"), Buffer.alloc(60 * 1024))
      const outputPath = join(tinyGeneratedRoot, "gameDefinition.ts")

      expect(() =>
        writeGeneratedFile({
          generatedRoot: tinyGeneratedRoot,
          customRoot,
          outputPath,
          contents: "x".repeat(128 * 1024),
        }),
      ).toThrow()

      return readdirSync(tinyGeneratedRoot)
    })

    if (leftoverFiles === null) {
      // Mounting a tmpfs isn't permitted in this environment — skip rather than false-fail.
      return
    }
    expect(leftoverFiles).toEqual([])
  })

  it("returns the resolved absolute output path on success", () => {
    const outputPath = join(generatedRoot, "gameConfig.ts")

    const resolved = writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: "x" })

    expect(resolved).toBe(outputPath)
  })
})
