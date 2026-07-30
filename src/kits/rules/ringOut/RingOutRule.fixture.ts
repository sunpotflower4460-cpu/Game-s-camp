import type { KitFixtureMetadata } from "../../shared/KitDefinition"

export const ringOutRuleFixture: KitFixtureMetadata = {
  kitId: "rule.ringOut.v1",
  fixtureId: "ring-out-rule",
  phase: "runtime-ready",
  notes: "Judges ring-out and timeout win/lose/draw outcomes; latches the first reported outcome only.",
}
