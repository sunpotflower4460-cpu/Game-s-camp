import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { checkGeneratedCustomSafety } from "../checkGeneratedCustomSafety"

describe("checkGeneratedCustomSafety", () => {
  let workDir: string
  let generatedDir: string
  let customDir: string

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), "forge-custom-safety-"))
    generatedDir = join(workDir, "generated")
    customDir = join(workDir, "custom")
    mkdirSync(generatedDir, { recursive: true })
    mkdirSync(customDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(workDir, { recursive: true, force: true })
  })

  function writeScript(name: string, contents: string): string {
    const scriptPath = join(workDir, name)
    writeFileSync(scriptPath, contents, "utf8")
    return scriptPath
  }

  it("passes when generated/ and custom/ both exist and no script mentions custom writes", () => {
    const scriptPath = writeScript(
      "safe.ts",
      `import { writeFileSync } from "node:fs"\nwriteFileSync("generated/games/x.ts", "content")\n`,
    )

    const result = checkGeneratedCustomSafety({
      generatedDir,
      customDir,
      scriptsToInspect: [scriptPath],
    })

    expect(result.ok).toBe(true)
    expect(result.issues).toEqual([])
  })

  it("flags a script writing a literal custom/ path", () => {
    const scriptPath = writeScript(
      "unsafe.ts",
      `import { writeFileSync } from "node:fs"\nwriteFileSync("custom/games/x.ts", "content")\n`,
    )

    const result = checkGeneratedCustomSafety({
      generatedDir,
      customDir,
      scriptsToInspect: [scriptPath],
    })

    expect(result.ok).toBe(false)
    expect(result.issues.some((issue) => issue.code === "script_mentions_custom_write")).toBe(true)
  })

  it("flags a script writing a computed custom path via join(...)", () => {
    const scriptPath = writeScript(
      "unsafe-computed.ts",
      `import { writeFileSync } from "node:fs"\nimport { join } from "node:path"\nwriteFileSync(join("custom", "rules.ts"), "content")\n`,
    )

    const result = checkGeneratedCustomSafety({
      generatedDir,
      customDir,
      scriptsToInspect: [scriptPath],
    })

    expect(result.ok).toBe(false)
    expect(result.issues.some((issue) => issue.code === "script_mentions_custom_write")).toBe(true)
  })

  it("flags a script writing a custom path referenced through a local variable", () => {
    const scriptPath = writeScript(
      "unsafe-indirect.ts",
      [
        `import { writeFileSync } from "node:fs"`,
        `import { join } from "node:path"`,
        `const root = "custom"`,
        `writeFileSync(join(root, "rules.ts"), "content")`,
        ``,
      ].join("\n"),
    )

    const result = checkGeneratedCustomSafety({
      generatedDir,
      customDir,
      scriptsToInspect: [scriptPath],
    })

    expect(result.ok).toBe(false)
    expect(result.issues.some((issue) => issue.code === "script_mentions_custom_write")).toBe(true)
  })

  it("flags a script writing a custom path via the async (non-Sync) writeFile API", () => {
    const scriptPath = writeScript(
      "unsafe-async.ts",
      `import { writeFile } from "node:fs/promises"\nawait writeFile("custom/games/x.ts", "content")\n`,
    )

    const result = checkGeneratedCustomSafety({
      generatedDir,
      customDir,
      scriptsToInspect: [scriptPath],
    })

    expect(result.ok).toBe(false)
    expect(result.issues.some((issue) => issue.code === "script_mentions_custom_write")).toBe(true)
  })

  it("does not flag a script that merely passes a customDir option unrelated to its own writes", () => {
    const scriptPath = writeScript(
      "runner-like.ts",
      [
        `import { writeFileSync, mkdirSync } from "node:fs"`,
        `import { dirname } from "node:path"`,
        `import { checkGeneratedCustomSafety } from "../src/forge/safety/checkGeneratedCustomSafety"`,
        ``,
        `const REPORT_PATH = "reports/generated-custom-safety.md"`,
        `const result = checkGeneratedCustomSafety({`,
        `  generatedDir: "generated",`,
        `  customDir: "custom",`,
        `  scriptsToInspect: [],`,
        `})`,
        `mkdirSync(dirname(REPORT_PATH), { recursive: true })`,
        `writeFileSync(REPORT_PATH, "report")`,
        ``,
      ].join("\n"),
    )

    const result = checkGeneratedCustomSafety({
      generatedDir,
      customDir,
      scriptsToInspect: [scriptPath],
    })

    expect(result.ok).toBe(true)
    expect(result.issues).toEqual([])
  })

  it("reports missing generated/ and custom/ directories", () => {
    rmSync(generatedDir, { recursive: true, force: true })
    rmSync(customDir, { recursive: true, force: true })

    const result = checkGeneratedCustomSafety({
      generatedDir,
      customDir,
      scriptsToInspect: [],
    })

    expect(result.ok).toBe(false)
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["missing_generated_dir", "missing_custom_dir"]),
    )
  })

  it("reports custom/ nested inside generated/", () => {
    const nestedCustom = join(generatedDir, "custom")
    mkdirSync(nestedCustom, { recursive: true })

    const result = checkGeneratedCustomSafety({
      generatedDir,
      customDir: nestedCustom,
      scriptsToInspect: [],
    })

    expect(result.ok).toBe(false)
    expect(result.issues.some((issue) => issue.code === "custom_path_inside_generated")).toBe(true)
  })

  it("reports generated/ and custom/ resolving to the identical directory", () => {
    const result = checkGeneratedCustomSafety({
      generatedDir,
      customDir: generatedDir,
      scriptsToInspect: [],
    })

    expect(result.ok).toBe(false)
    expect(result.issues.some((issue) => issue.code === "custom_and_generated_identical")).toBe(true)
  })

  it("reports generated/ and custom/ as identical when two different symlinks resolve to the same real directory", () => {
    const sharedTarget = join(workDir, "shared-real")
    mkdirSync(sharedTarget, { recursive: true })
    rmSync(generatedDir, { recursive: true, force: true })
    rmSync(customDir, { recursive: true, force: true })
    symlinkSync(sharedTarget, generatedDir, "dir")
    symlinkSync(sharedTarget, customDir, "dir")

    const result = checkGeneratedCustomSafety({
      generatedDir,
      customDir,
      scriptsToInspect: [],
    })

    expect(result.ok).toBe(false)
    expect(result.issues.some((issue) => issue.code === "custom_and_generated_identical")).toBe(true)
  })
})
