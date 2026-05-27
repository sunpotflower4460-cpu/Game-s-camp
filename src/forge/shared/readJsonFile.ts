import { readFileSync } from "node:fs"

export function readJsonFile(path: string): unknown {
  const raw = readFileSync(path, "utf-8")
  return JSON.parse(raw)
}
