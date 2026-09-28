/**
 * Tunable values for Rotterdam Ship Radar.
 * Point of interest: Holland Amerikakade (Cruise Terminal Rotterdam).
 */

/** Cruise berth on Wilhelminapier — OSM / Cruise Terminal Rotterdam. */
export const HOLLAND_AMERIKAKADE = {
  lat: 51.9065,
  lng: 4.486,
  label: "Holland Amerikakade",
  address: "Wilhelminakade 699, 3072 AP Rotterdam",
} as const

/** Landmark only — not the detection target. */
export const ERASMUS_BRIDGE = {
  lat: 51.909,
  lng: 4.4867,
  label: "Erasmusbrug",
} as const

/** @deprecated Use HOLLAND_AMERIKAKADE. Kept as alias during the pivot. */
export const POINT_OF_INTEREST = HOLLAND_AMERIKAKADE

export const SETTINGS = {
  detectionRadiusKm: 20,
  maxEtaMinutes: 180,
  minimumSpeedKnots: 1,
  /** How close the projected track must pass to the berth. */
  maxTrajectoryDistanceMeters: 250,
  /** Stationary ships inside this radius count as at the quay. */
  atQuayRadiusMeters: 200,
  /** Departures are tracked until this far from the quay. */
  departureRadiusKm: 10,
  approachAngleDegrees: 45,
  staleAfterMinutes: 10,
  /** Zoom that frames Wilhelminapier and the near river. */
  defaultMapZoom: 15,
  /**
   * Minimum overall length (AIS A+B) to count as a large cruise ship.
   * Ferries and waterbuses are also excluded by name.
   */
  minimumCruiseLengthMeters: 180,
} as const

/**
 * AIS listen area: Nieuwe Maas approaches to Holland Amerikakade,
 * from west (Hoek van Holland corridor) through the city center.
 */
export const AIS_BOUNDING_BOX = {
  southWest: { lat: 51.84, lng: 4.2 },
  northEast: { lat: 51.98, lng: 4.72 },
} as const

export function toAisStreamBoundingBoxes() {
  const { southWest, northEast } = AIS_BOUNDING_BOX

  return [
    [
      [southWest.lat, southWest.lng],
      [northEast.lat, northEast.lng],
    ],
  ]
}

export const AISSTREAM_URL = "wss://stream.aisstream.io/v0/stream"

export const AIS_MESSAGE_TYPES = [
  "PositionReport",
  "StandardClassBPositionReport",
  "ExtendedClassBPositionReport",
  "ShipStaticData",
  "StaticDataReport",
] as const

/**
 * Mock data only when explicitly enabled.
 * Live AIS requires NEXT_PUBLIC_USE_MOCK_AIS=false and npm run dev:server.
 */
export const USE_MOCK_AIS = process.env.NEXT_PUBLIC_USE_MOCK_AIS === "true"

export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""

export const GOOGLE_MAP_ID =
  process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "DEMO_MAP_ID"

export const AIS_SERVER_URL =
  process.env.NEXT_PUBLIC_AIS_SERVER_URL || "ws://localhost:3001"

export const AIS_SERVER_PORT = Number(process.env.AIS_SERVER_PORT ?? 3001)
