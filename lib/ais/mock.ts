import { HOLLAND_AMERIKAKADE } from "@/lib/config"
import {
  removeStaleVessels,
  sortByQuayRelevance,
  toVessel,
  type VesselTrack,
} from "@/lib/vessels"
import type { Vessel } from "@/types/vessel"

const METERS_PER_DEG_LAT = 111_320

function offset(eastMeters: number, northMeters: number) {
  const metersPerDegLng =
    METERS_PER_DEG_LAT * Math.cos((HOLLAND_AMERIKAKADE.lat * Math.PI) / 180)

  return {
    latitude: HOLLAND_AMERIKAKADE.lat + northMeters / METERS_PER_DEG_LAT,
    longitude: HOLLAND_AMERIKAKADE.lng + eastMeters / metersPerDegLng,
  }
}

/**
 * Mock fleet around Holland Amerikakade:
 * - 3 large HAL cruise ships (arrival / berth / departure)
 * - 1 large HAL arrival from the east
 * - 1 cargo (ignored)
 * - 1 ferry on a quay-like track (ignored — not a cruise ship)
 * - 1 small passenger boat near the quay (ignored — too short)
 */
export function createMockTracks(now = Date.now()): VesselTrack[] {
  const nieuwStatendam = offset(-5200, 40)
  const rotterdam = offset(9000, -20)
  const atBerth = offset(20, 30)
  const departing = offset(-900, 50)
  const cargoPast = offset(-4000, 120)
  const ferryApproach = offset(-3500, 30)
  const waterbus = offset(-800, 40)

  return [
    {
      mmsi: "244123001",
      name: "NIEUW STATENDAM",
      ...nieuwStatendam,
      speed: 11,
      course: 90,
      heading: 90,
      shipType: 60,
      lengthMeters: 300,
      beamMeters: 35,
      destination: "NLRTM",
      lastUpdate: now,
    },
    {
      mmsi: "244123002",
      name: "ROTTERDAM",
      ...rotterdam,
      speed: 9.5,
      course: 270,
      heading: 270,
      shipType: 60,
      lengthMeters: 300,
      beamMeters: 35,
      destination: "NLRTM",
      lastUpdate: now,
    },
    {
      mmsi: "244123003",
      name: "EURODAM",
      ...atBerth,
      speed: 0.1,
      course: 270,
      heading: 270,
      shipType: 60,
      lengthMeters: 285,
      beamMeters: 32,
      destination: "NLRTM",
      lastUpdate: now,
    },
    {
      mmsi: "244123004",
      name: "KONINGSDAM",
      ...departing,
      speed: 8,
      course: 270,
      heading: 270,
      shipType: 60,
      lengthMeters: 300,
      beamMeters: 35,
      destination: "DOVER",
      lastUpdate: now,
    },
    {
      mmsi: "244123005",
      name: "MSC LORENA",
      ...cargoPast,
      speed: 12,
      course: 90,
      heading: 90,
      shipType: 70,
      lengthMeters: 300,
      destination: "ROTTERDAM",
      lastUpdate: now,
    },
    {
      mmsi: "244123006",
      name: "STENA BRITANNICA",
      ...ferryApproach,
      speed: 14,
      course: 90,
      heading: 90,
      shipType: 60,
      lengthMeters: 240,
      destination: "HOOK",
      lastUpdate: now,
    },
    {
      mmsi: "244123007",
      name: "MAAS SPLASH",
      ...waterbus,
      speed: 8,
      course: 90,
      heading: 90,
      shipType: 60,
      lengthMeters: 32,
      lastUpdate: now,
    },
  ]
}

export function advanceTracks(
  tracks: VesselTrack[],
  dtSeconds: number,
  now = Date.now(),
): VesselTrack[] {
  return tracks.map((track) => {
    const speed = track.speed ?? 0
    if (speed < 0.5) {
      return { ...track, lastUpdate: now }
    }

    const course = track.course ?? 0
    const kilometers = speed * 1.852 * (dtSeconds / 3600)
    const radians = (course * Math.PI) / 180
    const northMeters = Math.cos(radians) * kilometers * 1000
    const eastMeters = Math.sin(radians) * kilometers * 1000
    const metersPerDegLng =
      METERS_PER_DEG_LAT * Math.cos((track.latitude * Math.PI) / 180)

    return {
      ...track,
      latitude: track.latitude + northMeters / METERS_PER_DEG_LAT,
      longitude: track.longitude + eastMeters / metersPerDegLng,
      lastUpdate: now,
    }
  })
}

export function vesselsFromTracks(
  tracks: VesselTrack[],
  now = Date.now(),
): Vessel[] {
  const atQuayTrack = tracks
    .map((track) => toVessel(track, now))
    .filter((vessel) => vessel.quayActivity != null)

  return sortByQuayRelevance(removeStaleVessels(atQuayTrack, now))
}
