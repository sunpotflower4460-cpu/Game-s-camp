import {
  existsSync,
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
import { UnsafeGeneratedPrunePathError, pruneStaleGeneratedFiles } from "../pruneStaleGeneratedFiles"

describe("pruneStaleGeneratedFiles", () => {
  let workDir: string
  let generatedRoot: string
  let customRoot: string
  let outputDir: string

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), "forge-prune-"))
    generatedRoot = join(workDir, "generated")
    customRoot = join(workDir, "custom")
    outputDir = join(generatedRoot, "games", "puni-sumo")
    mkdirSync(outputDir, { recursive: true })
    mkdirSync(customRoot, { recursive: true })
  })

  afterEach(() => {
    rmSync(workDir, { recursive: true, force: true })
  })

  it("removes a file that is no longer in the expected set", () => {
    writeFileSync(join(outputDir, "OldScene.ts"), "stale\n", "utf8")
    writeFileSync(join(outputDir, "gameDefinition.ts"), "current\n", "utf8")

    const removed = pruneStaleGeneratedFiles({
      generatedRoot,
      customRoot,
      outputDir,
      expectedFileNames: ["gameDefinition.ts"],
    })

    expect(removed).toEqual([join(outputDir, "OldScene.ts")])
    expect(existsSync(join(outputDir, "OldScene.ts"))).toBe(false)
    expect(readFileSync(join(outputDir, "gameDefinition.ts"), "utf8")).toBe("current\n")
  })

  it("keeps every file that is in the expected set", () => {
    writeFileSync(join(outputDir, "gameDefinition.ts"), "current\n", "utf8")
    writeFileSync(join(outputDir, "TitleScene.ts"), "current\n", "utf8")

    const removed = pruneStaleGeneratedFiles({
      generatedRoot,
      customRoot,
      outputDir,
      expectedFileNames: ["gameDefinition.ts", "TitleScene.ts"],
    })

    expect(removed).toEqual([])
    expect(existsSync(join(outputDir, "gameDefinition.ts"))).toBe(true)
    expect(existsSync(join(outputDir, "TitleScene.ts"))).toBe(true)
  })

  it("does nothing when outputDir does not exist yet", () => {
    const freshOutputDir = join(generatedRoot, "games", "brand-new")

    const removed = pruneStaleGeneratedFiles({
      generatedRoot,
      customRoot,
      outputDir: freshOutputDir,
      expectedFileNames: ["gameDefinition.ts"],
    })

    expect(removed).toEqual([])
  })

  it("removes a stale symlink without touching its target", () => {
    const outsideTarget = join(workDir, "outside-target.ts")
    writeFileSync(outsideTarget, "original\n", "utf8")
    symlinkSync(outsideTarget, join(outputDir, "StaleLink.ts"))

    const removed = pruneStaleGeneratedFiles({
      generatedRoot,
      customRoot,
      outputDir,
      expectedFileNames: [],
    })

    expect(removed).toEqual([join(outputDir, "StaleLink.ts")])
    expect(existsSync(join(outputDir, "StaleLink.ts"))).toBe(false)
    expect(readFileSync(outsideTarget, "utf8")).toBe("original\n")
  })

  it("leaves subdirectories alone", () => {
    mkdirSync(join(outputDir, "nested"), { recursive: true })
    writeFileSync(join(outputDir, "nested", "file.ts"), "x\n", "utf8")

    const removed = pruneStaleGeneratedFiles({
      generatedRoot,
      customRoot,
      outputDir,
      expectedFileNames: [],
    })

    expect(removed).toEqual([])
    expect(existsSync(join(outputDir, "nested", "file.ts"))).toBe(true)
  })

  it("rejects pruning inside the protected custom/ directory", () => {
    expect(() =>
      pruneStaleGeneratedFiles({
        generatedRoot,
        customRoot,
        outputDir: customRoot,
        expectedFileNames: [],
      }),
    ).toThrow(UnsafeGeneratedPrunePathError)
  })

  it("rejects pruning outside the generated/ root", () => {
    expect(() =>
      pruneStaleGeneratedFiles({
        generatedRoot,
        customRoot,
        outputDir: workDir,
        expectedFileNames: [],
      }),
    ).toThrow(UnsafeGeneratedPrunePathError)
  })
})
