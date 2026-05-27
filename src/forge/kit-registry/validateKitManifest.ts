import { kitManifestSchema } from "./kitManifest.zod"
import { ReadJsonFileError, readJsonFile } from "../shared/readJsonFile"
import {
  formatValidationFailure,
  formatValidationSuccess,
} from "../shared/validationResult"

const manifestPath = process.argv[2]

if (!manifestPath) {
  console.error(
    "Usage: tsx src/forge/kit-registry/validateKitManifest.ts <path-to-manifest.json>",
  )
  process.exit(1)
}

let manifest: unknown
try {
  manifest = readJsonFile(manifestPath)
} catch (error) {
  if (error instanceof ReadJsonFileError) {
    console.error(`❌ ${error.message}`)
    process.exit(1)
  }
  throw error
}

const parsed = kitManifestSchema.safeParse(manifest)

if (parsed.success) {
  console.log(formatValidationSuccess("KitManifest", manifestPath))
} else {
  console.error(formatValidationFailure("KitManifest", manifestPath))
  console.error(JSON.stringify(parsed.error.format(), null, 2))
  process.exit(1)
}
