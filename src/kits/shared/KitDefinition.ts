import type { KitContext, KitPhase } from "./KitContext"
import type { KitLifecycleHooks } from "./KitLifecycle"

export type KitDefinition<TTunables extends Record<string, unknown>> = {
  kitId: string
  name: string
  context: KitContext
  phase: KitPhase
  defaults: TTunables
  lifecycle: KitLifecycleHooks
}

export type KitFixtureMetadata = {
  kitId: string
  fixtureId: string
  phase: KitPhase
  notes?: string
}
