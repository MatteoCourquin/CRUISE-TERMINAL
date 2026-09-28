import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  isLargeCruiseShip,
  matchesCruiseName,
  matchesFerryName,
} from "@/lib/vessels/cruise"

describe("cruise ship filter", () => {
  it("accepts large HAL ships by name and length", () => {
    assert.equal(
      isLargeCruiseShip({
        name: "NIEUW STATENDAM",
        shipType: 60,
        lengthMeters: 300,
      }),
      true,
    )
    assert.equal(matchesCruiseName("EURODAM"), true)
  })

  it("rejects ferries even when they are long passenger ships", () => {
    assert.equal(matchesFerryName("STENA BRITANNICA"), true)
    assert.equal(
      isLargeCruiseShip({
        name: "STENA BRITANNICA",
        shipType: 60,
        lengthMeters: 240,
      }),
      false,
    )
  })

  it("rejects short passenger boats", () => {
    assert.equal(
      isLargeCruiseShip({
        name: "MAAS SPLASH",
        shipType: 60,
        lengthMeters: 32,
      }),
      false,
    )
  })

  it("rejects cargo even with a long hull", () => {
    assert.equal(
      isLargeCruiseShip({
        name: "MSC LORENA",
        shipType: 70,
        lengthMeters: 300,
      }),
      false,
    )
  })

  it("keeps a named cruise ship before AIS length arrives", () => {
    assert.equal(
      isLargeCruiseShip({
        name: "AIDAPERLA",
        shipType: 60,
      }),
      true,
    )
  })

  it("drops an unnamed passenger ship until length is known", () => {
    assert.equal(
      isLargeCruiseShip({
        name: undefined,
        shipType: 60,
      }),
      false,
    )
  })
})
