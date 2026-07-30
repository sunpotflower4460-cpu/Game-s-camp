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
import { UnsafeGeneratedWritePathError } from "../../safety/writeGeneratedFile"
import { renderTemplateSet } from "../renderTemplateSet"
import type { RenderContext } from "../renderContext.types"
import type { TemplateRegistryEntry } from "../../template-registry/templateRegistry.types"

const CONTEXT: RenderContext = {
  gameId: "test-game",
  title: "Test Game",
  templateId: "template.test.v1",
  engine: "phaser",
  input: "mobile_drag",
  durationSec: 60,
  requiredKitsJson: "[]",
}

describe("renderTemplateSet", () => {
  let workDir: string
  let generatedRoot: string
  let customRoot: string
  let outputDir: string
  let templatesDir: string

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), "forge-render-set-"))
    generatedRoot = join(workDir, "generated")
    customRoot = join(workDir, "custom")
    outputDir = join(generatedRoot, "games", "test-game")
    templatesDir = join(workDir, "templates", "test", "files")
    mkdirSync(generatedRoot, { recursive: true })
    mkdirSync(customRoot, { recursive: true })
    mkdirSync(templatesDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(workDir, { recursive: true, force: true })
  })

  function templateEntry(files: Record<string, string>): TemplateRegistryEntry {
    return {
      manifestPath: join(workDir, "templates", "test", "template.manifest.json"),
      manifest: {
        id: "template.test.v1",
        name: "Test",
        genre: "mini_action",
        engine: "phaser",
        version: "1.0.0",
        description: "test",
        requiredSlots: [],
        optionalSlots: [],
        files,
        invariants: [],
      },
    } as unknown as TemplateRegistryEntry
  }

  it("writes every file once the whole set resolves with no unresolved tokens", () => {
    writeFileSync(join(templatesDir, "good.ts.tpl"), "export const id = \"{{gameId}}\"\n", "utf8")
    writeFileSync(join(templatesDir, "title.ts.tpl"), "export const title = \"{{title}}\"\n", "utf8")

    const result = renderTemplateSet({
      templateEntry: templateEntry({ good: "./files/good.ts.tpl", title: "./files/title.ts.tpl" }),
      context: CONTEXT,
      outputDir,
      generatedRoot,
      customRoot,
    })

    expect(result.unresolvedTokens).toEqual([])
    expect(readFileSync(join(outputDir, "good.ts"), "utf8")).toBe("export const id = \"test-game\"\n")
    expect(readFileSync(join(outputDir, "title.ts"), "utf8")).toBe("export const title = \"Test Game\"\n")
  })

  it("writes nothing at all when any file in the set has an unresolved token", () => {
    writeFileSync(join(templatesDir, "good.ts.tpl"), "export const id = \"{{gameId}}\"\n", "utf8")
    writeFileSync(join(templatesDir, "bad.ts.tpl"), "export const x = \"{{nonexistent.token}}\"\n", "utf8")

    const result = renderTemplateSet({
      templateEntry: templateEntry({ good: "./files/good.ts.tpl", bad: "./files/bad.ts.tpl" }),
      context: CONTEXT,
      outputDir,
      generatedRoot,
      customRoot,
    })

    expect(result.unresolvedTokens).toEqual(["nonexistent.token"])
    expect(existsSync(join(outputDir, "good.ts"))).toBe(false)
    expect(existsSync(join(outputDir, "bad.ts"))).toBe(false)
  })

  it("does not overwrite previously-good output when a later regeneration fails", () => {
    writeFileSync(join(templatesDir, "good.ts.tpl"), "export const id = \"{{gameId}}\"\n", "utf8")
    renderTemplateSet({
      templateEntry: templateEntry({ good: "./files/good.ts.tpl" }),
      context: CONTEXT,
      outputDir,
      generatedRoot,
      customRoot,
    })
    expect(readFileSync(join(outputDir, "good.ts"), "utf8")).toBe("export const id = \"test-game\"\n")

    writeFileSync(join(templatesDir, "bad.ts.tpl"), "export const x = \"{{nonexistent.token}}\"\n", "utf8")
    const result = renderTemplateSet({
      templateEntry: templateEntry({ good: "./files/good.ts.tpl", bad: "./files/bad.ts.tpl" }),
      context: CONTEXT,
      outputDir,
      generatedRoot,
      customRoot,
    })

    expect(result.unresolvedTokens).toEqual(["nonexistent.token"])
    expect(readFileSync(join(outputDir, "good.ts"), "utf8")).toBe("export const id = \"test-game\"\n")
    expect(existsSync(join(outputDir, "bad.ts"))).toBe(false)
  })

  it("writes nothing at all when one destination in the set is unsafe, even if others would be fine", () => {
    mkdirSync(outputDir, { recursive: true })
    const outsideTarget = join(workDir, "outside-target.ts")
    writeFileSync(outsideTarget, "original\n", "utf8")
    symlinkSync(outsideTarget, join(outputDir, "evil.ts"))

    writeFileSync(join(templatesDir, "good.ts.tpl"), "export const id = \"{{gameId}}\"\n", "utf8")
    writeFileSync(join(templatesDir, "evil.ts.tpl"), "export const x = 1\n", "utf8")

    expect(() =>
      renderTemplateSet({
        templateEntry: templateEntry({ good: "./files/good.ts.tpl", evil: "./files/evil.ts.tpl" }),
        context: CONTEXT,
        outputDir,
        generatedRoot,
        customRoot,
      }),
    ).toThrow(UnsafeGeneratedWritePathError)

    expect(existsSync(join(outputDir, "good.ts"))).toBe(false)
    expect(readFileSync(outsideTarget, "utf8")).toBe("original\n")
  })
})
