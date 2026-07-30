import type { KitFixtureMetadata } from "../../shared/KitDefinition"

export const roundTimerFixture: KitFixtureMetadata = {
  kitId: "ui.roundTimer.v1",
  fixtureId: "round-timer-ui",
  phase: "runtime-ready",
  notes: "Displays the remaining round time, driven by the shared MiniActionGameKitContext elapsed clock.",
}
