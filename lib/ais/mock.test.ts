import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createMockTracks, vesselsFromTracks } from "@/lib/ais/mock"
import { matchesFilter } from "@/lib/vessels"

describe("mock vessels", () => {
  it("shows only large cruise ships with the default cruise filter", () => {
    const vessels = vesselsFromTracks(createMockTracks()).filter((vessel) =>
      matchesFilter(vessel, "cruise", true),
    )
    assert.deepEqual(
      vessels.map((vessel) => vessel.name),
      ["EURODAM", "NIEUW STATENDAM", "ROTTERDAM", "KONINGSDAM"],
    )
    assert.equal(vessels[0]?.quayActivity, "at-quay")
    assert.equal(vessels[1]?.quayActivity, "arriving")
    assert.equal(vessels[2]?.quayActivity, "arriving")
    assert.equal(vessels[3]?.quayActivity, "departing")
  })

  it("never treats ferries or short boats as cruise ships", () => {
    const vessels = vesselsFromTracks(createMockTracks())
    const stena = vessels.find((vessel) => vessel.name === "STENA BRITANNICA")
    const splash = vessels.find((vessel) => vessel.name === "MAAS SPLASH")
    assert.equal(stena?.isCruiseShip ?? false, false)
    assert.equal(splash?.isCruiseShip ?? false, false)
  })
})
