import { existsSync, readFileSync } from "node:fs"
import { relative, resolve } from "node:path"

import type {
  GeneratedCustomSafetyIssue,
  GeneratedCustomSafetyResult,
} from "./generatedCustomSafety.types"

function isInside(parent: string, child: string): boolean {
  const relativePath = relative(parent, child)
  return (
    Boolean(relativePath) &&
    !relativePath.startsWith("..") &&
    !resolve(relativePath).startsWith("/")
  )
}

export function checkGeneratedCustomSafety(args: {
  generatedDir: string
  customDir: string
  scriptsToInspect: string[]
}): GeneratedCustomSafetyResult {
  const issues: GeneratedCustomSafetyIssue[] = []
  const generatedRoot = resolve(args.generatedDir)
  const customRoot = resolve(args.customDir)

  if (!existsSync(generatedRoot)) {
    issues.push({
      severity: "error",
      code: "missing_generated_dir",
      message: `Missing generated directory: ${args.generatedDir}`,
      path: args.generatedDir,
    })
  }

  if (!existsSync(customRoot)) {
    issues.push({
      severity: "error",
      code: "missing_custom_dir",
      message: `Missing custom directory: ${args.customDir}`,
      path: args.customDir,
    })
  }

  if (existsSync(generatedRoot) && existsSync(customRoot)) {
    if (isInside(generatedRoot, customRoot)) {
      issues.push({
        severity: "error",
        code: "custom_path_inside_generated",
        message: "custom/ must not be inside generated/.",
        path: args.customDir,
      })
    }

    if (isInside(customRoot, generatedRoot)) {
      issues.push({
        severity: "error",
        code: "generated_path_inside_custom",
        message: "generated/ must not be inside custom/.",
        path: args.generatedDir,
      })
    }
  }

  for (const scriptPath of args.scriptsToInspect) {
    if (!existsSync(scriptPath)) {
      continue
    }

    const source = readFileSync(scriptPath, "utf-8")
    const suspiciousWrites =
      source.includes("custom/") &&
      (source.includes("writeFileSync") ||
        source.includes("mkdirSync") ||
        source.includes("rmSync") ||
        source.includes("renameSync"))

    if (suspiciousWrites) {
      issues.push({
        severity: "error",
        code: "script_mentions_custom_write",
        message: `Script appears to mention custom/ while performing filesystem writes: ${scriptPath}`,
        path: scriptPath,
      })
    }
  }

  return {
    ok: !issues.some((issue) => issue.severity === "error"),
    issues,
  }
}
