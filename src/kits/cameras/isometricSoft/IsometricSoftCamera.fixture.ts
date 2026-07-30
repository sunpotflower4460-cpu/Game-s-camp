import type { KitFixtureMetadata } from "../../shared/KitDefinition"

export const isometricSoftCameraFixture: KitFixtureMetadata = {
  kitId: "camera.isometricSoft.v1",
  fixtureId: "isometric-soft-camera",
  phase: "runtime-ready",
  notes: "Softly follows the midpoint between the two actors; owns no win-condition logic.",
}
