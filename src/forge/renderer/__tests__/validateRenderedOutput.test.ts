import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { validateRenderedOutput } from "../validateRenderedOutput"

describe("validateRenderedOutput", () => {
  let outputDir: string

  beforeEach(() => {
    outputDir = mkdtempSync(join(tmpdir(), "forge-validate-output-"))
  })

  afterEach(() => {
    rmSync(outputDir, { recursive: true, force: true })
  })

  it("passes when every expected file exists", () => {
    writeFileSync(join(outputDir, "gameDefinition.ts"), "export const x = 1\n", "utf8")

    const result = validateRenderedOutput({ outputDir, expectedFiles: ["gameDefinition.ts"] })

    expect(result.ok).toBe(true)
    expect(result.issues).toEqual([])
  })

  it("reports an error for each expected file that is missing", () => {
    writeFileSync(join(outputDir, "gameDefinition.ts"), "export const x = 1\n", "utf8")

    const result = validateRenderedOutput({
      outputDir,
      expectedFiles: ["gameDefinition.ts", "gameConfig.ts"],
    })

    expect(result.ok).toBe(false)
    expect(result.issues).toEqual([
      { severity: "error", message: `Missing rendered output: ${join(outputDir, "gameConfig.ts")}` },
    ])
  })

  it("does not flag legitimate Recipe data that merely resembles a template placeholder", () => {
    // A tuning value that happens to contain literal `{{...}}` text is real, faithfully-rendered
    // Recipe data, not an unresolved template token — renderTemplateSet's own unresolvedTokens
    // tracking (checked separately by the caller) is what actually knows a token's provenance.
    writeFileSync(
      join(outputDir, "gameConfig.ts"),
      'export const tuning = { debugLabel: "{{debug.label}}" }\n',
      "utf8",
    )

    const result = validateRenderedOutput({ outputDir, expectedFiles: ["gameConfig.ts"] })

    expect(result.ok).toBe(true)
    expect(result.issues).toEqual([])
  })

  it("is a no-op when there are no expected files", () => {
    mkdirSync(outputDir, { recursive: true })

    const result = validateRenderedOutput({ outputDir, expectedFiles: [] })

    expect(result.ok).toBe(true)
    expect(result.issues).toEqual([])
  })
})
