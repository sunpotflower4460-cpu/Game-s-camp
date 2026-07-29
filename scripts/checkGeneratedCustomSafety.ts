import { mkdirSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

import { checkGeneratedCustomSafety } from "../src/forge/safety/checkGeneratedCustomSafety"
import { explainGeneratedCustomSafety } from "../src/forge/safety/explainGeneratedCustomSafety"

const REPORT_PATH = "reports/generated-custom-safety.md"
const SCRIPTS_DIR = "scripts"

function discoverScripts(rootDir: string): string[] {
  return readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .map((entry) => join(rootDir, entry.name))
    .sort()
}

const result = checkGeneratedCustomSafety({
  generatedDir: "generated",
  customDir: "custom",
  scriptsToInspect: discoverScripts(SCRIPTS_DIR),
})

const report = explainGeneratedCustomSafety(result)
mkdirSync(dirname(REPORT_PATH), { recursive: true })
writeFileSync(REPORT_PATH, `${report}\n`)

if (!result.ok) {
  console.error(report)
  process.exit(1)
}

console.log(report)
