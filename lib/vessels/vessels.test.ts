import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { formatEta, removeStaleVessels } from "@/lib/vessels"

describe("formatEta", () => {
  it("renders hours and minutes with a leading tilde", () => {
    assert.equal(formatEta(12.4), "~12 min")
    assert.equal(formatEta(65), "~1h05")
  })
})

describe("removeStaleVessels", () => {
  it("drops tracks silent for more than 10 minutes", () => {
    const now = Date.now()
    const kept = removeStaleVessels(
      [
        { mmsi: "fresh", lastUpdate: now - 2 * 60 * 1000 },
        { mmsi: "stale", lastUpdate: now - 11 * 60 * 1000 },
      ],
      now,
    )

    assert.deepEqual(
      kept.map((vessel) => vessel.mmsi),
      ["fresh"],
    )
  })
})
