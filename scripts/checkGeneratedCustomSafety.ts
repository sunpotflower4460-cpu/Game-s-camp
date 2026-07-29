import { mkdirSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

import { checkGeneratedCustomSafety } from "../src/forge/safety/checkGeneratedCustomSafety"
import { explainGeneratedCustomSafety } from "../src/forge/safety/explainGeneratedCustomSafety"

const REPORT_PATH = "reports/generated-custom-safety.md"
const SCRIPTS_DIR = "scripts"

const SCRIPT_EXTENSIONS = [".ts", ".js"]

function discoverScripts(rootDir: string): string[] {
  const scripts: string[] = []

  for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
    const path = join(rootDir, entry.name)

    if (entry.isDirectory()) {
      scripts.push(...discoverScripts(path))
      continue
    }

    if (entry.isFile() && SCRIPT_EXTENSIONS.some((extension) => entry.name.endsWith(extension))) {
      scripts.push(path)
    }
  }

  return scripts.sort()
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
