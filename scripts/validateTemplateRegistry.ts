import {
  LoadTemplateRegistryError,
  loadTemplateRegistry,
} from "../src/forge/template-registry/loadTemplateRegistry"
import { validateTemplateRegistry } from "../src/forge/template-registry/validateTemplateRegistry"

const rootDir = process.argv[2] ?? "templates"

let registry
try {
  registry = loadTemplateRegistry(rootDir)
} catch (error) {
  if (error instanceof LoadTemplateRegistryError) {
    console.error(`[fail] TemplateRegistry: ${error.message}`)
    process.exit(1)
  }
  throw error
}

const result = validateTemplateRegistry(registry)

if (result.ok) {
  console.log(`[ok] TemplateRegistry: ${rootDir} (ids + file references)`)
} else {
  for (const errorMessage of result.errors) {
    console.error(`[fail] TemplateRegistry: ${errorMessage}`)
  }
  process.exit(1)
}
