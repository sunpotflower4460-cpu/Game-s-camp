import type { KitFixtureMetadata } from "../../shared/KitDefinition"

export const puniOpponentAIControllerFixture: KitFixtureMetadata = {
  kitId: "controller.puniOpponentAI.v1",
  fixtureId: "puni-opponent-ai-controller",
  phase: "runtime-ready",
  notes: "Chase-with-edge-avoidance steering AI; deterministic under a debug-hook seed in test mode.",
}
