export type RenderContextValue = string | number | boolean | string[]

export type RenderContext = {
  gameId: string
  title: string
  templateId: string
  engine: string
  input: string
  durationSec: number
  requiredKitsJson: string
}
