import { describe, expect, it } from "vitest"
import {
  RuntimeKitIdentityMismatchError,
  RuntimeKitResolutionError,
  createRuntimeKitRegistry,
} from "../RuntimeKitRegistry"
import type { RuntimeKitAdapter } from "../runtimeKit.types"

describe("RuntimeKitRegistry", () => {
  it("resolves a registered Kit ID to the adapter its factory produces", () => {
    const registry = createRuntimeKitRegistry()
    const adapter: RuntimeKitAdapter = { kitId: "controller.puniPush.v1" }
    registry.register("controller.puniPush.v1", () => adapter)

    expect(registry.has("controller.puniPush.v1")).toBe(true)
    expect(registry.resolve("controller.puniPush.v1")).toBe(adapter)
  })

  it("throws a typed, clear error for an unregistered Kit ID instead of failing silently", () => {
    const registry = createRuntimeKitRegistry()

    expect(() => registry.resolve("controller.unknown.v1")).toThrow(RuntimeKitResolutionError)
    expect(() => registry.resolve("controller.unknown.v1")).toThrow(/controller\.unknown\.v1/)
  })

  it("rejects a factory whose adapter identifies as a different Kit ID than it was registered under", () => {
    const registry = createRuntimeKitRegistry()
    registry.register("controller.puniPush.v1", () => ({ kitId: "controller.puniOpponentAI.v1" }))

    expect(() => registry.resolve("controller.puniPush.v1")).toThrow(RuntimeKitIdentityMismatchError)
    expect(() => registry.resolve("controller.puniPush.v1")).toThrow(
      /controller\.puniPush\.v1.*controller\.puniOpponentAI\.v1/s,
    )
  })

  it("rejects registering the same Kit ID twice", () => {
    const registry = createRuntimeKitRegistry()
    registry.register("rule.ringOut.v1", () => ({ kitId: "rule.ringOut.v1" }))

    expect(() => registry.register("rule.ringOut.v1", () => ({ kitId: "rule.ringOut.v1" }))).toThrow()
  })

  it("lists every registered Kit ID", () => {
    const registry = createRuntimeKitRegistry()
    registry.register("stage.circularArenaForest.v1", () => ({ kitId: "stage.circularArenaForest.v1" }))
    registry.register("camera.isometricSoft.v1", () => ({ kitId: "camera.isometricSoft.v1" }))

    expect(registry.listRegisteredKitIds().sort()).toEqual(
      ["camera.isometricSoft.v1", "stage.circularArenaForest.v1"].sort(),
    )
  })
})
