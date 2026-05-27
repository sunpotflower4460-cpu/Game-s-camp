export type RuntimeEvent =
  | { type: "runtime:created" }
  | { type: "runtime:ready" }
  | { type: "runtime:error"; message: string }
