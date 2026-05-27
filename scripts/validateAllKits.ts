import { kitManifestSchema } from "../src/forge/kit-registry/kitManifest.zod"
import { validateAll } from "./lib/validateAll"

validateAll({
  label: "KitManifest",
  rootDir: "kits",
  suffix: "kit.manifest.json",
  schema: kitManifestSchema,
})
