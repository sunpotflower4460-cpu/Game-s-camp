import { basename, join, relative } from "node:path"

import {
  resolveTemplateManifestReferencePath,
} from "../template-registry/loadTemplateRegistry"
import { resolveSafeGeneratedWritePath, writeGeneratedFile } from "../safety/writeGeneratedFile"
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
  const staged: { outputPath: string; contents: string }[] = []

  for (const templateFileReference of Object.values(templateEntry.manifest.files)) {
    const sourcePath = resolveTemplateManifestReferencePath(
      templateEntry.manifestPath,
      templateFileReference,
    )
    const outputFileName = basename(templateFileReference).replace(/\.tpl$/, "")
    const outputPath = join(outputDir, outputFileName)
    const rendered = renderTemplateFile(sourcePath, context, tokenReplacements)

    for (const token of rendered.unresolvedTokens) {
      unresolved.add(token)
    }

    staged.push({ outputPath, contents: rendered.output })
    files.push({
      sourcePath: relative(process.cwd(), sourcePath),
      outputPath,
      unresolvedTokens: rendered.unresolvedTokens,
    })
  }

  // Commit writes only once the whole Template set has rendered with no unresolved tokens
  // anywhere — otherwise a failure partway through would overwrite some of the last known-good
  // generated files with new (possibly broken) content while leaving the rest untouched, and the
  // caller's post-render `unresolvedTokens` check runs too late to prevent that.
  if (unresolved.size === 0) {
    // Validate every destination before writing any of them: without this, a later file being
    // rejected (an existing symlink, a hard link, an escaping ancestor) would still leave earlier
    // files in this same batch already overwritten, producing the same mixed old/new tree this
    // staging step exists to prevent — just triggered by a safety rejection instead of a bad
    // token. Real filesystem errors during the write pass itself (disk full, permissions) aren't
    // covered by this — only the same traversal/symlink/hard-link conditions writeGeneratedFile
    // already checks.
    for (const file of staged) {
      resolveSafeGeneratedWritePath({ generatedRoot, customRoot, outputPath: file.outputPath })
    }
    for (const file of staged) {
      writeGeneratedFile({ generatedRoot, customRoot, outputPath: file.outputPath, contents: file.contents })
    }
  }

  return {
    files,
    unresolvedTokens: [...unresolved],
  }
}
