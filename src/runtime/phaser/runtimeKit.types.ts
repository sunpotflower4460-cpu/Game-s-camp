/**
 * Runtime-side Kit contract. This mirrors `src/kits/shared/KitLifecycle.ts` but describes the
 * shape a Kit must expose once it is promoted from a design-time skeleton to a runtime-ready
 * adapter that `RuntimeKitRegistry` can resolve by Kit ID. No Kit is upgraded to this shape in
 * Phase 6.0 — that starts in Phase 6.2 with the Puni Sumo gameplay Kits.
 */
export type RuntimeKitAdapter = {
  readonly kitId: string
  onCreate?: () => void
  onMount?: () => void
  onUpdate?: (deltaMs: number) => void
  onDispose?: () => void
}

export type RuntimeKitFactory = () => RuntimeKitAdapter

export type RuntimeKitModule = {
  readonly kitId: string
  createAdapter: RuntimeKitFactory
}
