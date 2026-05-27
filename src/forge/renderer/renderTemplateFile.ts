import { readFileSync } from "node:fs"

import type { RenderContext, RenderContextValue } from "./renderContext.types"

export type RenderTemplateFileResult = {
  output: string
  unresolvedTokens: string[]
}

function toTokenValue(value: RenderContextValue): string {
  if (Array.isArray(value)) {
    return JSON.stringify(value)
  }
  return String(value)
}

export function renderTemplateFile(
  templatePath: string,
  context: RenderContext,
  extraReplacements: Record<string, RenderContextValue> = {},
): RenderTemplateFileResult {
  const replacements: Record<string, RenderContextValue> = {
    gameId: context.gameId,
    title: context.title,
    templateId: context.templateId,
    engine: context.engine,
    input: context.input,
    durationSec: context.durationSec,
    requiredKitsJson: context.requiredKitsJson,
    ...extraReplacements,
  }

  const unresolved = new Set<string>()
  const template = readFileSync(templatePath, "utf-8")
  const output = template.replace(/{{\s*([a-zA-Z0-9._-]+)\s*}}/g, (match, token: string) => {
    if (!(token in replacements)) {
      unresolved.add(token)
      return match
    }
    return toTokenValue(replacements[token])
  })

  return {
    output,
    unresolvedTokens: [...unresolved],
  }
}
