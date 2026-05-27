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
    id: z.string().regex(/^[a-z]+(?:\.[a-zA-Z]+)*\.v[0-9]+$/),
    name: z.string().min(1),
    category: kitCategorySchema,
    engine: z.enum(["phaser"]),
    version: z.string().regex(/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/),
    description: z.string().min(1),
    provides: z.array(z.string()).default([]),
    requires: z.array(z.string()).default([]),
    compatibleWith: z.record(z.string(), z.array(z.string())).default({}),
    tunables: z
      .record(
        z.string(),
        z.discriminatedUnion("type", [
          z
            .object({
              type: z.literal("number"),
              default: z.number().optional(),
              min: z.number().optional(),
              max: z.number().optional(),
              description: z.string().optional(),
            })
            .strict(),
          z
            .object({
              type: z.literal("string"),
              default: z.string().optional(),
              description: z.string().optional(),
            })
            .strict(),
          z
            .object({
              type: z.literal("boolean"),
              default: z.boolean().optional(),
              description: z.string().optional(),
            })
            .strict(),
        ]),
      )
      .default({}),
    invariants: z.array(z.string()).default([]),
    entry: z.string().min(1),
    testFixture: z.string().optional(),
  })
  .strict()

export type KitManifest = z.infer<typeof kitManifestSchema>
