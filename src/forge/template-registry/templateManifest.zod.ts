import { z } from "zod"

export const templateSlotSchema = z.object({
  name: z.string().min(1),
  category: z.enum([
    "controller",
    "camera",
    "physics",
    "stage",
    "rule",
    "ui",
    "visual",
    "audio",
    "npc",
  ]),
  required: z.boolean(),
  description: z.string().min(1),
})

export const templateManifestSchema = z
  .object({
    id: z.string().regex(/^template\.[a-zA-Z0-9]+\.v\d+$/),
    name: z.string().min(1),
    genre: z.enum(["mini_action", "puzzle", "exploration", "srpg", "mystery_sandbox"]),
    engine: z.enum(["phaser"]),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    description: z.string().min(1),
    requiredSlots: z.array(templateSlotSchema).min(1),
    optionalSlots: z.array(templateSlotSchema).default([]),
    files: z
      .object({
        gameScene: z.string().min(1),
        titleScene: z.string().min(1),
        resultScene: z.string().min(1),
        gameConfig: z.string().min(1),
      })
      .strict(),
    invariants: z.array(z.string()).default([]),
  })
  .strict()

export type TemplateManifest = z.infer<typeof templateManifestSchema>
export type TemplateSlot = z.infer<typeof templateSlotSchema>
