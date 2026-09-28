import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { HOLLAND_AMERIKAKADE } from "@/lib/config"
import {
  angularDifference,
  calculateEta,
  classifyQuayActivity,
} from "@/lib/geo"

const quayLatitude = HOLLAND_AMERIKAKADE.lat
const westOfQuay = HOLLAND_AMERIKAKADE.lng - 0.08

describe("angularDifference", () => {
  it("wraps 359° and 2° to 3°, not 357°", () => {
    assert.equal(angularDifference(359, 2), 3)
    assert.equal(angularDifference(2, 359), 3)
  })
})

describe("calculateEta", () => {
  it("converts nautical distance and speed into minutes", () => {
    const etaMinutes = calculateEta(1.852, 1)
    assert.ok(etaMinutes != null)
    assert.ok(Math.abs(etaMinutes - 60) < 0.001)
  })
})

describe("classifyQuayActivity", () => {
  it("marks a ship west of the quay heading east as arriving", () => {
    assert.equal(
      classifyQuayActivity({
        latitude: quayLatitude,
        longitude: westOfQuay,
        course: 90,
        speed: 10,
      }),
      "arriving",
    )
  })

  it("marks a ship west of the quay heading further west as departing", () => {
    assert.equal(
      classifyQuayActivity({
        latitude: quayLatitude,
        longitude: westOfQuay,
        course: 270,
        speed: 10,
      }),
      "departing",
    )
  })

  it("marks a nearly stopped ship on the berth as at-quay", () => {
    assert.equal(
      classifyQuayActivity({
        latitude: HOLLAND_AMERIKAKADE.lat,
        longitude: HOLLAND_AMERIKAKADE.lng,
        course: 270,
        speed: 0.2,
      }),
      "at-quay",
    )
  })

  it("rejects a ship making 0.2 knots away from the berth", () => {
    assert.equal(
      classifyQuayActivity({
        latitude: quayLatitude,
        longitude: westOfQuay,
        course: 90,
        speed: 0.2,
      }),
      null,
    )
  })
})
