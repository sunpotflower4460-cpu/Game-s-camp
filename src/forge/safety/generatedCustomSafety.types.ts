export type GeneratedCustomSafetyIssue = {
  severity: "error" | "warning"
  code:
    | "missing_generated_dir"
    | "missing_custom_dir"
    | "custom_path_inside_generated"
    | "generated_path_inside_custom"
    | "custom_and_generated_identical"
    | "script_mentions_custom_write"
  message: string
  path?: string
}

export type GeneratedCustomSafetyResult = {
  ok: boolean
  issues: GeneratedCustomSafetyIssue[]
}
