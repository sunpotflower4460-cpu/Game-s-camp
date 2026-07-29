import { basename, join, relative } from "node:path"

import {
  resolveTemplateManifestReferencePath,
} from "../template-registry/loadTemplateRegistry"
import { writeGeneratedFile } from "../safety/writeGeneratedFile"
import type { TemplateRegistryEntry } from "../template-registry/templateRegistry.types"

import type { RenderContext, RenderContextValue } from "./renderContext.types"
import { renderTemplateFile } from "./renderTemplateFile"

export type RenderedTemplateOutput = {
  sourcePath: string
  outputPath: string
  unresolvedTokens: string[]
}

export type RenderTemplateSetResult = {
  files: RenderedTemplateOutput[]
  unresolvedTokens: string[]
}

export function renderTemplateSet(args: {
  templateEntry: TemplateRegistryEntry
  context: RenderContext
  outputDir: string
  generatedRoot?: string
  customRoot?: string
  tokenReplacements?: Record<string, RenderContextValue>
}): RenderTemplateSetResult {
  const {
    templateEntry,
    context,
    outputDir,
    generatedRoot = "generated",
    customRoot = "custom",
    tokenReplacements = {},
  } = args
  const files: RenderedTemplateOutput[] = []
  const unresolved = new Set<string>()

  for (const templateFileReference of Object.values(templateEntry.manifest.files)) {
    const sourcePath = resolveTemplateManifestReferencePath(
      templateEntry.manifestPath,
      templateFileReference,
    )
    const outputFileName = basename(templateFileReference).replace(/\.tpl$/, "")
    const outputPath = join(outputDir, outputFileName)
    const rendered = renderTemplateFile(sourcePath, context, tokenReplacements)

    writeGeneratedFile({ generatedRoot, customRoot, outputPath, contents: rendered.output })

    for (const token of rendered.unresolvedTokens) {
      unresolved.add(token)
    }

    files.push({
      sourcePath: relative(process.cwd(), sourcePath),
      outputPath,
      unresolvedTokens: rendered.unresolvedTokens,
    })
  }

  return {
    files,
    unresolvedTokens: [...unresolved],
  }
}
