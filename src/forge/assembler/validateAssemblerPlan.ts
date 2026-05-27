import type { AssemblerPlan } from "./assemblerPlan.types"

export type AssemblerPlanIssue = {
  severity: "error" | "warning"
  type:
    | "unresolved_required_slot"
    | "duplicate_required_assignment"
    | "missing_plan_identity"
  message: string
}

export function validateAssemblerPlan(plan: AssemblerPlan): AssemblerPlanIssue[] {
  const issues: AssemblerPlanIssue[] = []

  if (plan.recipeId.trim().length === 0 || plan.templateId.trim().length === 0) {
    issues.push({
      severity: "error",
      type: "missing_plan_identity",
      message: "Assembler plan requires non-empty recipeId and templateId.",
    })
  }

  for (const unresolved of plan.unresolvedRequiredSlots) {
    issues.push({
      severity: "error",
      type: "unresolved_required_slot",
      message: `Required slot unresolved: ${unresolved.slotName} (${unresolved.category}) - ${unresolved.reason}`,
    })
  }

  for (const assignment of plan.requiredAssignments) {
    if (assignment.slotName.trim().length === 0) {
      issues.push({
        severity: "error",
        type: "unresolved_required_slot",
        message: "Required assignment has an empty slot name.",
      })
    }
  }

  const requiredKitCounts = new Map<string, number>()
  for (const assignment of plan.requiredAssignments) {
    requiredKitCounts.set(assignment.kitId, (requiredKitCounts.get(assignment.kitId) ?? 0) + 1)
  }

  for (const [kitId, count] of requiredKitCounts) {
    if (count <= 1) {
      continue
    }
    issues.push({
      severity: "error",
      type: "duplicate_required_assignment",
      message: `Required assignments contain duplicate kitId: ${kitId}`,
    })
  }

  return issues
}
