export type VesselDirection = "west-to-east" | "east-to-west" | "unknown"

export type QuayActivity = "arriving" | "departing" | "at-quay"

export type ShipTypeLabel =
  | "Cargo"
  | "Tanker"
  | "Passenger"
  | "Tug"
  | "Pleasure Craft"
  | "High Speed Craft"
  | "Other"
  | "Unknown"

export type Vessel = {
  mmsi: string
  name?: string
  latitude: number
  longitude: number

  speed?: number
  course?: number
  heading?: number

  shipType?: number
  shipTypeLabel?: ShipTypeLabel

  /** Overall length in meters when AIS static dimensions are known. */
  lengthMeters?: number
  beamMeters?: number

  destination?: string

  distanceToQuayKm: number
  etaMinutes?: number

  direction: VesselDirection
  quayActivity: QuayActivity | null

  /** Large cruise ship candidate (not ferry / waterbus / cargo). */
  isCruiseShip: boolean

  /** True when the vessel is a cruise ship arriving, departing, or at the quay. */
  relevantToQuay: boolean

  lastUpdate: number
}
