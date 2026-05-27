import {
  LoadKitRegistryError,
  loadKitRegistry,
} from "../src/forge/kit-registry/loadKitRegistry"
import { validateKitRegistry } from "../src/forge/kit-registry/validateKitRegistry"

const rootDir = process.argv[2] ?? "kits"

let registry
try {
  registry = loadKitRegistry(rootDir)
} catch (error) {
  if (error instanceof LoadKitRegistryError) {
    console.error(`[fail] KitRegistry: ${error.message}`)
    process.exit(1)
  }
  throw error
}

const result = validateKitRegistry(registry)

if (result.ok) {
  console.log(`[ok] KitRegistry: ${rootDir} (ids + entry/testFixture references)`)
} else {
  for (const errorMessage of result.errors) {
    console.error(`[fail] KitRegistry: ${errorMessage}`)
  }
  process.exit(1)
}
