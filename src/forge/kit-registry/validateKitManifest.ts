import { kitManifestSchema } from "./kitManifest.zod"
import { readJsonFile } from "../shared/readJsonFile"
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

const parsed = kitManifestSchema.safeParse(readJsonFile(manifestPath))

if (parsed.success) {
  console.log(formatValidationSuccess("KitManifest", manifestPath))
} else {
  console.error(formatValidationFailure("KitManifest", manifestPath))
  console.error(JSON.stringify(parsed.error.format(), null, 2))
  process.exit(1)
}
