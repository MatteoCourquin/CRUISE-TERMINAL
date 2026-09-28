import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { mergeVesselTrack, parseAisStreamMessage } from "@/lib/ais/parse"

describe("parseAisStreamMessage", () => {
  it("reads a PositionReport into a track update", () => {
    const update = parseAisStreamMessage({
      MessageType: "PositionReport",
      MetaData: {
        MMSI: 244123001,
        ShipName: "NIEUW STATENDAM",
      },
      Message: {
        PositionReport: {
          UserID: 244123001,
          Latitude: 51.91,
          Longitude: 4.48,
          Sog: 11.2,
          Cog: 90,
          TrueHeading: 91,
        },
      },
    })

    assert.equal(update?.mmsi, "244123001")
    assert.equal(update?.name, "NIEUW STATENDAM")
    assert.equal(update?.speed, 11.2)
    assert.equal(update?.course, 90)
  })

  it("reads ShipStaticData length from dimensions", () => {
    const update = parseAisStreamMessage({
      MessageType: "ShipStaticData",
      MetaData: { MMSI: 244123001 },
      Message: {
        ShipStaticData: {
          UserID: 244123001,
          Name: "EURODAM",
          Type: 60,
          Destination: "NLRTM",
          Dimension: { A: 150, B: 150, C: 15, D: 20 },
        },
      },
    })

    assert.equal(update?.name, "EURODAM")
    assert.equal(update?.shipType, 60)
    assert.equal(update?.lengthMeters, 300)
    assert.equal(update?.beamMeters, 35)
  })

  it("merges static data onto an existing position track", () => {
    const merged = mergeVesselTrack(
      {
        mmsi: "244123001",
        latitude: 51.91,
        longitude: 4.48,
        speed: 10,
        course: 90,
        lastUpdate: 1,
      },
      {
        mmsi: "244123001",
        name: "EURODAM",
        shipType: 60,
        lengthMeters: 285,
        lastUpdate: 2,
      },
    )

    assert.equal(merged?.name, "EURODAM")
    assert.equal(merged?.latitude, 51.91)
    assert.equal(merged?.lengthMeters, 285)
  })
})
