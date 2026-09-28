import { HOLLAND_AMERIKAKADE, SETTINGS } from "@/lib/config"

const EARTH_RADIUS_KM = 6371
const METERS_PER_DEG_LAT = 111_320
export const NAUTICAL_MILE_KM = 1.852

export type GeoPoint = {
  latitude: number
  longitude: number
}

export type TrackPoint = GeoPoint & {
  course?: number
}

const QUAY: GeoPoint = {
  latitude: HOLLAND_AMERIKAKADE.lat,
  longitude: HOLLAND_AMERIKAKADE.lng,
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

function toDegrees(radians: number) {
  return (radians * 180) / Math.PI
}

function normalizeCourse(course: number) {
  return ((course % 360) + 360) % 360
}

export function calculateDistance(from: GeoPoint, to: GeoPoint): number {
  const φ1 = toRadians(from.latitude)
  const φ2 = toRadians(to.latitude)
  const Δφ = toRadians(to.latitude - from.latitude)
  const Δλ = toRadians(to.longitude - from.longitude)
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function calculateBearing(from: GeoPoint, to: GeoPoint): number {
  const φ1 = toRadians(from.latitude)
  const φ2 = toRadians(to.latitude)
  const Δλ = toRadians(to.longitude - from.longitude)
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)

  return (toDegrees(Math.atan2(y, x)) + 360) % 360
}

export function angularDifference(course: number, bearing: number): number {
  const diff = Math.abs(normalizeCourse(course) - normalizeCourse(bearing)) % 360
  return diff > 180 ? 360 - diff : diff
}

export function calculateEta(
  distanceKm: number,
  speedKnots: number,
): number | undefined {
  if (
    !Number.isFinite(distanceKm) ||
    !Number.isFinite(speedKnots) ||
    speedKnots <= 0
  ) {
    return undefined
  }

  const distanceNm = distanceKm / NAUTICAL_MILE_KM
  const hours = distanceNm / speedKnots
  return hours * 60
}

/**
 * Shortest distance, in meters, between the forward track and the quay.
 * The track is the ray starting at the vessel and running along its course.
 * A vessel heading away returns Infinity: the ray never reaches the berth.
 */
export function calculateClosestApproach(
  vessel: TrackPoint,
  quay: GeoPoint = QUAY,
): number {
  if (vessel.course == null || Number.isNaN(vessel.course)) {
    return Number.POSITIVE_INFINITY
  }

  const course = normalizeCourse(vessel.course)
  const radians = toRadians(course)
  const directionEast = Math.sin(radians)
  const directionNorth = Math.cos(radians)
  const metersPerDegLng =
    METERS_PER_DEG_LAT * Math.cos(toRadians(vessel.latitude))
  const east = (quay.longitude - vessel.longitude) * metersPerDegLng
  const north = (quay.latitude - vessel.latitude) * METERS_PER_DEG_LAT
  const ahead = east * directionEast + north * directionNorth

  if (ahead <= 0) return Number.POSITIVE_INFINITY

  const crossEast = east - ahead * directionEast
  const crossNorth = north - ahead * directionNorth
  return Math.hypot(crossEast, crossNorth)
}

export const calculateClosestApproachToBridge = calculateClosestApproach

type QuayInput = TrackPoint & {
  speed?: number
}

export type QuayActivity = "arriving" | "departing" | "at-quay"

export function classifyQuayActivity(
  vessel: QuayInput,
  quay: GeoPoint = QUAY,
): QuayActivity | null {
  const from = { latitude: vessel.latitude, longitude: vessel.longitude }
  const distanceKm = calculateDistance(from, quay)
  if (distanceKm > SETTINGS.detectionRadiusKm) return null

  const speed = vessel.speed ?? 0
  const distanceMeters = distanceKm * 1000

  if (
    distanceMeters <= SETTINGS.atQuayRadiusMeters &&
    speed < SETTINGS.minimumSpeedKnots
  ) {
    return "at-quay"
  }

  if (speed < SETTINGS.minimumSpeedKnots) return null
  if (vessel.course == null || Number.isNaN(vessel.course)) return null

  const bearingToQuay = calculateBearing(from, quay)
  const angleToQuay = angularDifference(vessel.course, bearingToQuay)
  const closestMeters = calculateClosestApproach(vessel, quay)

  if (
    angleToQuay <= SETTINGS.approachAngleDegrees &&
    closestMeters <= SETTINGS.maxTrajectoryDistanceMeters
  ) {
    const etaMinutes = calculateEta(distanceKm, speed)
    if (etaMinutes == null || etaMinutes > SETTINGS.maxEtaMinutes) return null
    return "arriving"
  }

  if (distanceKm > SETTINGS.departureRadiusKm) return null

  const bearingAway = (bearingToQuay + 180) % 360
  const headingAway =
    angularDifference(vessel.course, bearingAway) <=
    SETTINGS.approachAngleDegrees

  if (headingAway || closestMeters === Number.POSITIVE_INFINITY) {
    if (headingAway) return "departing"
  }

  return null
}

/** @deprecated Prefer classifyQuayActivity. */
export function isApproachingBridge(
  vessel: QuayInput,
  quay: GeoPoint = QUAY,
): boolean {
  return classifyQuayActivity(vessel, quay) === "arriving"
}

export function isRelevantToQuay(
  vessel: QuayInput,
  quay: GeoPoint = QUAY,
): boolean {
  return classifyQuayActivity(vessel, quay) != null
}
