import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from "node:fs"
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

  it("returns the resolved absolute output path on success", () => {
    const outputPath = join(generatedRoot, "gameConfig.ts")

    const resolved = writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: "x" })

    expect(resolved).toBe(outputPath)
  })
})
