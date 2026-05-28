import type { GeneratedCustomSafetyResult } from "./generatedCustomSafety.types"

export function explainGeneratedCustomSafety(result: GeneratedCustomSafetyResult): string {
  const lines: string[] = []

  lines.push("# Generated / Custom Safety Check")
  lines.push("")
  lines.push(`Result: ${result.ok ? "OK" : "FAILED"}`)
  lines.push("")

  if (result.issues.length === 0) {
    lines.push("No issues found.")
    return lines.join("\n")
  }

  lines.push("## Issues")
  for (const issue of result.issues) {
    lines.push(`- ${issue.severity.toUpperCase()} [${issue.code}] ${issue.message}`)
    if (issue.path) {
      lines.push(`  - path: \`${issue.path}\``)
    }
  }

  return lines.join("\n")
}
