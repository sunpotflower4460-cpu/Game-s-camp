import { describe, expect, it } from "vitest"
import { mergeGameOverrides } from "../mergeGameOverrides"

describe("mergeGameOverrides", () => {
  it("returns Kit defaults untouched when no overrides are given", () => {
    const result = mergeGameOverrides({ moveSpeed: 180, pushPower: 1.2 })
    expect(result).toEqual({ moveSpeed: 180, pushPower: 1.2 })
  })

  it("lets Recipe tuning win over Kit defaults", () => {
    const result = mergeGameOverrides({ moveSpeed: 180, pushPower: 1.2 }, { moveSpeed: 220 })
    expect(result).toEqual({ moveSpeed: 220, pushPower: 1.2 })
  })

  it("lets custom overrides win over both Kit defaults and Recipe tuning", () => {
    const result = mergeGameOverrides(
      { moveSpeed: 180, pushPower: 1.2 },
      { moveSpeed: 220 },
      { moveSpeed: 260 },
    )
    expect(result).toEqual({ moveSpeed: 260, pushPower: 1.2 })
  })

  it("tolerates missing recipe tuning and custom override layers", () => {
    const result = mergeGameOverrides({ arenaRadius: 260 }, undefined, undefined)
    expect(result).toEqual({ arenaRadius: 260 })
  })
})
