/**
 * Runtime-side Kit contract. This mirrors `src/kits/shared/KitLifecycle.ts` but describes the
 * shape a Kit must expose once it is promoted from a design-time skeleton to a runtime-ready
 * adapter that `RuntimeKitRegistry` can resolve by Kit ID.
 *
 * `TContext` is genre-specific (e.g. `MiniActionGameKitContext`/`MiniActionResultKitContext` for
 * `template.miniAction.v1`) — the registry and this contract stay generic across genres, while a
 * genre's own Scene decides what its Kits can see. Defaulting to `void` keeps a context-free
 * adapter (and `RuntimeKitRegistry.resolve(kitId)` with no second argument) valid for genres that
 * don't need one.
 */
export type RuntimeKitAdapter = {
  readonly kitId: string
  onCreate?: () => void
  onMount?: () => void
  onUpdate?: (deltaMs: number) => void
  onDispose?: () => void
}

export type RuntimeKitFactory<TContext = void> = (context: TContext) => RuntimeKitAdapter

export type RuntimeKitModule<TContext = void> = {
  readonly kitId: string
  createAdapter: RuntimeKitFactory<TContext>
}
