import type { AssemblerPlan } from "./assemblerPlan.types"

function formatAssignmentCategory(assignment: {
  category: string
  requiresProvides?: string[]
}): string {
  const requiresProvides = assignment.requiresProvides ?? []
  if (requiresProvides.length === 0) {
    return assignment.category
  }
  return `${assignment.category}, requires: ${requiresProvides.join(", ")}`
}

export function explainAssemblerPlan(plan: AssemblerPlan): string {
  const lines: string[] = []

  lines.push(`# Assembler Plan: ${plan.recipeId}`)
  lines.push("")
  lines.push(`Template: ${plan.templateId}`)
  lines.push(`Engine: ${plan.engine}`)
  lines.push(`Genre: ${plan.genre}`)
  lines.push("")
  lines.push("## Required assignments")

  for (const assignment of plan.requiredAssignments) {
    lines.push(
      `- ${assignment.slotName} (${formatAssignmentCategory(assignment)}) -> ${assignment.kitId}`,
    )
  }

  if (plan.optionalAssignments.length > 0) {
    lines.push("")
    lines.push("## Optional assignments")
    for (const assignment of plan.optionalAssignments) {
      lines.push(
        `- ${assignment.slotName} (${formatAssignmentCategory(assignment)}) -> ${assignment.kitId}`,
      )
    }
  }

  if (plan.unresolvedRequiredSlots.length > 0) {
    lines.push("")
    lines.push("## Unresolved required slots")
    for (const slot of plan.unresolvedRequiredSlots) {
      lines.push(`- ${slot.slotName} (${slot.category}): ${slot.reason}`)
    }
  }

  if (plan.notes.length > 0) {
    lines.push("")
    lines.push("## Notes")
    for (const note of plan.notes) {
      lines.push(`- ${note}`)
    }
  }

  return lines.join("\n")
}
