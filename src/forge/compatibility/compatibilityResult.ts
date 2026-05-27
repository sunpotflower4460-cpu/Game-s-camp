export type CompatibilityIssueSeverity = "error" | "warning"

export type CompatibilityIssue = {
  severity: CompatibilityIssueSeverity
  code: string
  message: string
  recipeId: string
  kitId?: string
}

export type CompatibilityResult = {
  isCompatible: boolean
  issues: CompatibilityIssue[]
}

export function createCompatibilityResult(
  issues: CompatibilityIssue[],
): CompatibilityResult {
  return {
    isCompatible: !issues.some((issue) => issue.severity === "error"),
    issues,
  }
}
