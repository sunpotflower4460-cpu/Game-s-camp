import { kitManifestSchema } from "../src/forge/kit-registry/kitManifest.zod"
import { validateAll } from "./lib/validateAll"

validateAll({
  label: "KitManifest",
  rootDir: "examples/kits",
  suffix: ".manifest.json",
  schema: kitManifestSchema,
})
