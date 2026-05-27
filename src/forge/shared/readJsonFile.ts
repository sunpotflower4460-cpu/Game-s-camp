import { readFileSync } from "node:fs"

export class ReadJsonFileError extends Error {
  constructor(message: string, readonly path: string) {
    super(message)
    this.name = "ReadJsonFileError"
  }
}

export function readJsonFile(path: string): unknown {
  let raw: string
  try {
    raw = readFileSync(path, "utf-8")
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new ReadJsonFileError(
      `File not found or unreadable: ${path} (${reason})`,
      path,
    )
  }

  try {
    return JSON.parse(raw)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new ReadJsonFileError(`Invalid JSON in file: ${path} (${reason})`, path)
  }
}
