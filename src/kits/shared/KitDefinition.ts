import type { KitContext } from "./KitContext"
import type { KitLifecycleHooks } from "./KitLifecycle"

export type KitDefinition<TTunables extends Record<string, unknown>> = {
  kitId: string
  name: string
  context: KitContext
  phase: "skeleton"
  defaults: TTunables
  lifecycle: KitLifecycleHooks
}

export type KitFixtureMetadata = {
  kitId: string
  fixtureId: string
  phase: "skeleton"
  notes?: string
}
