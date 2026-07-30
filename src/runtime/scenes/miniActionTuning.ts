export function getTuningNumber(
  tuning: Record<string, string | number | boolean>,
  key: string,
  fallback: number,
): number {
  const value = tuning[key]
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}
