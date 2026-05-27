import { z } from "zod"

export const kitCategorySchema = z.enum([
  "controller",
  "camera",
  "physics",
  "stage",
  "rule",
  "ui",
  "visual",
  "audio",
  "npc",
])

export const kitManifestSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    category: kitCategorySchema,
    engine: z.enum(["phaser"]),
    version: z.string().min(1),
    description: z.string().min(1),
    provides: z.array(z.string()).default([]),
    requires: z.array(z.string()).default([]),
    compatibleWith: z.record(z.string(), z.array(z.string())).default({}),
    tunables: z
      .record(
        z.string(),
        z.object({
          type: z.enum(["number", "string", "boolean"]),
          default: z.union([z.number(), z.string(), z.boolean()]).optional(),
          min: z.number().optional(),
          max: z.number().optional(),
          description: z.string().optional(),
        }),
      )
      .default({}),
    invariants: z.array(z.string()).default([]),
    entry: z.string().min(1),
    testFixture: z.string().optional(),
  })
  .strict()

export type KitManifest = z.infer<typeof kitManifestSchema>
