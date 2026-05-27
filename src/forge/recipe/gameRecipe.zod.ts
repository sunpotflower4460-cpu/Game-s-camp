import { z } from "zod"

export const gameGenreSchema = z.enum([
  "mini_action",
  "puzzle",
  "exploration",
  "srpg",
  "mystery_sandbox",
])

export const targetDeviceSchema = z.enum(["mobile", "pc", "both"])

export const engineSchema = z.enum(["phaser"])

export const gameRecipeSchema = z
  .object({
    schemaVersion: z.literal("0.1"),
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1),
    genre: gameGenreSchema,
    targetDevice: targetDeviceSchema,
    engine: engineSchema,
    template: z.string().min(1),
    input: z.string().min(1),
    durationSec: z.number().int().positive().max(3600).optional(),
    requiredKits: z.array(z.string().min(1)).default([]),
    optionalKits: z.array(z.string().min(1)).default([]),
    tuning: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
      .optional(),
    constraints: z.array(z.string()).default([]),
    notesForAssembler: z.string().optional(),
  })
  .strict()
  .superRefine((recipe, ctx) => {
    const required = new Set(recipe.requiredKits)
    for (const kit of recipe.optionalKits) {
      if (required.has(kit)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["optionalKits"],
          message: `Kit is both required and optional: ${kit}`,
        })
      }
    }
  })

export type GameRecipe = z.infer<typeof gameRecipeSchema>
