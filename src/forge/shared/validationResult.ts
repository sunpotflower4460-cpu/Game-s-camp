export function formatValidationSuccess(label: string, path: string): string {
  return `✅ ${label} is valid: ${path}`
}

export function formatValidationFailure(label: string, path: string): string {
  return `❌ ${label} is invalid: ${path}`
}
