import {
  existsSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { UnsafeGeneratedWritePathError, writeGeneratedFile } from "../writeGeneratedFile"

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

  it("rejects writing through a destination that is a dangling symlink", () => {
    const outputPath = join(generatedRoot, "gameDefinition.ts")
    symlinkSync(join(workDir, "does-not-exist.ts"), outputPath)

    expect(() =>
      writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: "x" }),
    ).toThrow(UnsafeGeneratedWritePathError)
  })

  it("returns the resolved absolute output path on success", () => {
    const outputPath = join(generatedRoot, "gameConfig.ts")

    const resolved = writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: "x" })

    expect(resolved).toBe(outputPath)
  })
})
