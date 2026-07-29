import type { RuntimeKitAdapter, RuntimeKitFactory } from "./runtimeKit.types"

export class RuntimeKitResolutionError extends Error {
  readonly kitId: string

  constructor(kitId: string) {
    super(`Runtime Kit "${kitId}" is not registered in the RuntimeKitRegistry.`)
    this.name = "RuntimeKitResolutionError"
    this.kitId = kitId
  }
}

export class RuntimeKitIdentityMismatchError extends Error {
  readonly expectedKitId: string
  readonly actualKitId: string

  constructor(expectedKitId: string, actualKitId: string) {
    super(
      `Runtime Kit "${expectedKitId}" resolved to an adapter identifying itself as ` +
        `"${actualKitId}". A factory must always produce an adapter whose kitId matches the ` +
        `ID it was registered under.`,
    )
    this.name = "RuntimeKitIdentityMismatchError"
    this.expectedKitId = expectedKitId
    this.actualKitId = actualKitId
  }
}

/**
 * Resolves Kit IDs (e.g. `controller.puniPush.v1`) to runtime adapters.
 * Generated definitions reference Kits by ID only; the registry is the single place that maps
 * an ID to an actual implementation, so Scenes never need a Kit-ID switch statement.
 */
export class RuntimeKitRegistry {
  private readonly factories = new Map<string, RuntimeKitFactory>()

  register(kitId: string, factory: RuntimeKitFactory): void {
    if (this.factories.has(kitId)) {
      throw new Error(`Runtime Kit "${kitId}" is already registered.`)
    }
    this.factories.set(kitId, factory)
  }

  has(kitId: string): boolean {
    return this.factories.has(kitId)
  }

  resolve(kitId: string): RuntimeKitAdapter {
    const factory = this.factories.get(kitId)
    if (!factory) {
      throw new RuntimeKitResolutionError(kitId)
    }
    const adapter = factory()
    if (adapter.kitId !== kitId) {
      throw new RuntimeKitIdentityMismatchError(kitId, adapter.kitId)
    }
    return adapter
  }

  listRegisteredKitIds(): string[] {
    return Array.from(this.factories.keys())
  }
}

export function createRuntimeKitRegistry(): RuntimeKitRegistry {
  return new RuntimeKitRegistry()
}
