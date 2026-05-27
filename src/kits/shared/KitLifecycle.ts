export type KitLifecycleState = "created" | "mounted" | "updated" | "disposed"

export type KitLifecycleHooks = {
  onCreate?: () => void
  onMount?: () => void
  onUpdate?: (deltaMs: number) => void
  onDispose?: () => void
}
