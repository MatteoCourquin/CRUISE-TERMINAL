import {
  calculateDistance,
  calculateEta,
  classifyQuayActivity,
} from "@/lib/geo"
import { HOLLAND_AMERIKAKADE, SETTINGS } from "@/lib/config"
import { isLargeCruiseShip } from "@/lib/vessels/cruise"
import type {
  QuayActivity,
  ShipTypeLabel,
  Vessel,
  VesselDirection,
} from "@/types/vessel"

export type VesselTrack = {
  mmsi: string
  name?: string
  latitude: number
  longitude: number
  speed?: number
  course?: number
  heading?: number
  shipType?: number
  lengthMeters?: number
  beamMeters?: number
  destination?: string
  lastUpdate: number
}

export type ShipFilter = "cruise" | "all"

const QUAY = {
  latitude: HOLLAND_AMERIKAKADE.lat,
  longitude: HOLLAND_AMERIKAKADE.lng,
}

export function shipTypeFromAis(code?: number): ShipTypeLabel {
  if (code == null) return "Unknown"
  if (code >= 70 && code <= 79) return "Cargo"
  if (code >= 80 && code <= 89) return "Tanker"
  if (code >= 60 && code <= 69) return "Passenger"
  if (code === 31 || code === 32 || code === 52) return "Tug"
  if (code === 36 || code === 37) return "Pleasure Craft"
  if (code >= 40 && code <= 49) return "High Speed Craft"
  return "Other"
}

export function courseToDirection(course?: number): VesselDirection {
  if (course == null || Number.isNaN(course)) return "unknown"
  const normalized = ((course % 360) + 360) % 360
  if (normalized >= 45 && normalized < 135) return "west-to-east"
  if (normalized >= 225 && normalized < 315) return "east-to-west"
  return "unknown"
}

export function toVessel(track: VesselTrack, now = Date.now()): Vessel {
  const from = { latitude: track.latitude, longitude: track.longitude }
  const distanceToQuayKm = calculateDistance(from, QUAY)
  const shipTypeLabel = shipTypeFromAis(track.shipType)
  const isCruiseShip = isLargeCruiseShip({
    name: track.name,
    shipType: track.shipType,
    shipTypeLabel,
    lengthMeters: track.lengthMeters,
  })
  const quayActivity = classifyQuayActivity(track)

  const etaMinutes =
    quayActivity === "arriving" && track.speed != null
      ? calculateEta(distanceToQuayKm, track.speed)
      : quayActivity === "departing" && track.speed != null
        ? calculateEta(distanceToQuayKm, track.speed)
        : undefined

  return {
    mmsi: track.mmsi,
    name: track.name,
    latitude: track.latitude,
    longitude: track.longitude,
    speed: track.speed,
    course: track.course,
    heading: track.heading,
    shipType: track.shipType,
    shipTypeLabel,
    lengthMeters: track.lengthMeters,
    beamMeters: track.beamMeters,
    destination: track.destination,
    distanceToQuayKm,
    etaMinutes,
    direction: courseToDirection(track.course),
    quayActivity,
    isCruiseShip,
    relevantToQuay: quayActivity != null && isCruiseShip,
    lastUpdate: track.lastUpdate || now,
  }
}

export function removeStaleVessels<T extends { lastUpdate: number }>(
  vessels: T[],
  now = Date.now(),
  maxAgeMs = SETTINGS.staleAfterMinutes * 60 * 1000,
): T[] {
  return vessels.filter((vessel) => now - vessel.lastUpdate <= maxAgeMs)
}

const ACTIVITY_ORDER: Record<QuayActivity, number> = {
  "at-quay": 0,
  arriving: 1,
  departing: 2,
}

export function sortByQuayRelevance(vessels: Vessel[]): Vessel[] {
  return [...vessels].sort((a, b) => {
    const activityA = a.quayActivity ? ACTIVITY_ORDER[a.quayActivity] : 99
    const activityB = b.quayActivity ? ACTIVITY_ORDER[b.quayActivity] : 99
    if (activityA !== activityB) return activityA - activityB

    if (a.quayActivity === "arriving" || b.quayActivity === "arriving") {
      const left = a.etaMinutes ?? Number.POSITIVE_INFINITY
      const right = b.etaMinutes ?? Number.POSITIVE_INFINITY
      return left - right
    }

    return a.distanceToQuayKm - b.distanceToQuayKm
  })
}

/** @deprecated Prefer sortByQuayRelevance. */
export const sortByEta = sortByQuayRelevance

export function isSmallVessel(vessel: Vessel): boolean {
  return (
    !vessel.isCruiseShip ||
    (vessel.lengthMeters != null &&
      vessel.lengthMeters < SETTINGS.minimumCruiseLengthMeters)
  )
}

export function matchesFilter(
  vessel: Vessel,
  filter: ShipFilter,
  hideSmall: boolean,
): boolean {
  if (vessel.quayActivity == null) return false
  if (filter === "cruise" && !vessel.isCruiseShip) return false
  if (hideSmall && isSmallVessel(vessel)) return false
  return true
}

const numberFormat = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatEta(minutes?: number): string {
  if (minutes == null || !Number.isFinite(minutes)) return "—"
  const rounded = Math.max(1, Math.round(minutes))
  if (rounded < 60) return `~${rounded} min`
  const hours = Math.floor(rounded / 60)
  const rest = rounded % 60
  return `~${hours}h${rest.toString().padStart(2, "0")}`
}

export function formatDistance(kilometers: number): string {
  if (kilometers < 0.1) return "< 100 m"
  return `${numberFormat.format(kilometers)} km`
}

export function formatSpeed(knots?: number): string {
  if (knots == null || !Number.isFinite(knots)) return "—"
  return `${numberFormat.format(knots)} kn`
}

export function formatLength(meters?: number): string {
  if (meters == null || !Number.isFinite(meters)) return ""
  return `${Math.round(meters)} m`
}

export function quayActivityLabel(activity: QuayActivity | null): string {
  switch (activity) {
    case "arriving":
      return "Arrivée au quai"
    case "departing":
      return "Départ du quai"
    case "at-quay":
      return "À quai"
    default:
      return "Hors trajectoire"
  }
}

export function directionLabel(direction: VesselDirection): string {
  switch (direction) {
    case "west-to-east":
      return "Depuis l'ouest"
    case "east-to-west":
      return "Depuis l'est"
    default:
      return "Direction inconnue"
  }
}

export function activityDetail(vessel: Vessel): string {
  if (vessel.quayActivity === "at-quay") return "Holland Amerikakade"
  if (vessel.quayActivity === "departing") {
    return vessel.direction === "west-to-east"
      ? "Vers l'est"
      : vessel.direction === "east-to-west"
        ? "Vers l'ouest"
        : "En quittant le quai"
  }
  return directionLabel(vessel.direction)
}

export function vesselName(vessel: Vessel): string {
  const name = vessel.name?.trim()
  return name ? name : `Navire ${vessel.mmsi}`
}

export function shipTypeDisplay(
  vessel: Vessel | ShipTypeLabel | undefined,
): string {
  if (vessel && typeof vessel === "object") {
    if (vessel.isCruiseShip) return "Paquebot de croisière"
    return shipTypeDisplay(vessel.shipTypeLabel)
  }

  switch (vessel) {
    case "Cargo":
      return "Cargo"
    case "Tanker":
      return "Pétrolier"
    case "Passenger":
      return "Passager"
    case "Tug":
      return "Remorqueur"
    case "Pleasure Craft":
      return "Plaisance"
    case "High Speed Craft":
      return "Navire rapide"
    case "Other":
      return "Autre"
    default:
      return "Type inconnu"
  }
}

export function primaryTimeLabel(vessel: Vessel): string {
  if (vessel.quayActivity === "at-quay") return "À quai"
  if (vessel.quayActivity === "departing") {
    return vessel.etaMinutes != null
      ? formatEta(vessel.etaMinutes)
      : formatDistance(vessel.distanceToQuayKm)
  }
  return formatEta(vessel.etaMinutes)
}

export {
  isLargeCruiseShip,
  matchesCruiseName,
  matchesFerryName,
} from "@/lib/vessels/cruise"
