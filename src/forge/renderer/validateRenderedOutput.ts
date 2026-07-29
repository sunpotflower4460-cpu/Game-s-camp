import { existsSync } from "node:fs"
import { join } from "node:path"

export type RenderedOutputIssue = {
  severity: "error" | "warning"
  message: string
}

export type RenderedOutputValidationResult = {
  ok: boolean
  issues: RenderedOutputIssue[]
}

// Unresolved-token detection lives solely in `renderTemplateSet`'s `unresolvedTokens` tracking,
// which knows the provenance of every token it substitutes and can never mistake literal Recipe
// data for an unresolved placeholder. A disk-content rescan here using a `{{...}}` regex would be
// both redundant with that (the caller already checks `renderResult.unresolvedTokens.length`) and
// wrong: it would false-positive on any legitimate Recipe value that merely resembles a template
// token (e.g. a tuning string containing the literal text `"{{debug.label}}"`).
export function validateRenderedOutput(args: {
  outputDir: string
  expectedFiles: string[]
}): RenderedOutputValidationResult {
  const issues: RenderedOutputIssue[] = []

  for (const fileName of args.expectedFiles) {
    const outputPath = join(args.outputDir, fileName)
    if (!existsSync(outputPath)) {
      issues.push({
        severity: "error",
        message: `Missing rendered output: ${outputPath}`,
      })
    }
  }

  return {
    ok: !issues.some((issue) => issue.severity === "error"),
    issues,
  }
}
