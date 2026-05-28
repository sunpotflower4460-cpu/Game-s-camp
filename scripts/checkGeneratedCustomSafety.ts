import { mkdirSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

import { checkGeneratedCustomSafety } from "../src/forge/safety/checkGeneratedCustomSafety"
import { explainGeneratedCustomSafety } from "../src/forge/safety/explainGeneratedCustomSafety"

const REPORT_PATH = "reports/generated-custom-safety.md"

const result = checkGeneratedCustomSafety({
  generatedDir: "generated",
  customDir: "custom",
  scriptsToInspect: [
    "scripts/renderPuniSumoDryRun.ts",
    "scripts/createAssemblerPlan.ts",
  ],
})

const report = explainGeneratedCustomSafety(result)
mkdirSync(dirname(REPORT_PATH), { recursive: true })
writeFileSync(REPORT_PATH, `${report}\n`)

if (!result.ok) {
  console.error(report)
  process.exit(1)
}

console.log(report)
