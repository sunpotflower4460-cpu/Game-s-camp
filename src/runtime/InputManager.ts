export type InputMode = "none" | "keyboard" | "pointer" | "touch" | "gamepad"

export type InputManagerState = {
  mode: InputMode
  enabled: boolean
}

export function createInputManagerState(): InputManagerState {
  return {
    mode: "none",
    enabled: false,
  }
}
