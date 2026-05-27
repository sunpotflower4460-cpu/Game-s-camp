import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

export type RenderedOutputIssue = {
  severity: "error" | "warning"
  message: string
}

export type RenderedOutputValidationResult = {
  ok: boolean
  issues: RenderedOutputIssue[]
}

const PLACEHOLDER_PATTERN = /{{\s*([a-zA-Z0-9._-]+)\s*}}/g

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
      continue
    }

    const content = readFileSync(outputPath, "utf-8")
    const unresolved = new Set<string>()
    for (const match of content.matchAll(PLACEHOLDER_PATTERN)) {
      unresolved.add(match[1])
    }

    if (unresolved.size > 0) {
      issues.push({
        severity: "error",
        message: `Unresolved placeholders in ${outputPath}: ${[...unresolved].join(", ")}`,
      })
    }
  }

  return {
    ok: !issues.some((issue) => issue.severity === "error"),
    issues,
  }
}
