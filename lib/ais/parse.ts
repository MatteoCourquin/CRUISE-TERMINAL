import type { VesselTrack } from "@/lib/vessels"

type JsonRecord = Record<string, unknown>

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" ? (value as JsonRecord) : null
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function cleanName(value?: string): string | undefined {
  if (!value) return undefined
  const cleaned = value.replace(/[@\u0000]/g, "").trim()
  return cleaned.length > 0 ? cleaned : undefined
}

function lengthFromDimension(dimension: unknown): {
  lengthMeters?: number
  beamMeters?: number
} {
  const record = asRecord(dimension)
  if (!record) return {}
  const a = asNumber(record.A) ?? 0
  const b = asNumber(record.B) ?? 0
  const c = asNumber(record.C) ?? 0
  const d = asNumber(record.D) ?? 0
  const lengthMeters = a + b
  const beamMeters = c + d
  return {
    lengthMeters: lengthMeters > 0 ? lengthMeters : undefined,
    beamMeters: beamMeters > 0 ? beamMeters : undefined,
  }
}

function readPositionPayload(message: JsonRecord, messageType: string) {
  const payload = asRecord(message[messageType])
  if (!payload) return null

  const latitude = asNumber(payload.Latitude)
  const longitude = asNumber(payload.Longitude)
  if (latitude == null || longitude == null) return null
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null

  const speed = asNumber(payload.Sog)
  const course = asNumber(payload.Cog)
  const heading = asNumber(payload.TrueHeading)

  return {
    latitude,
    longitude,
    speed: speed != null && speed < 102.2 ? speed : undefined,
    course: course != null && course < 360 ? course : undefined,
    heading:
      heading != null && heading >= 0 && heading < 511 ? heading : undefined,
  }
}

export type ParsedAisUpdate = Partial<VesselTrack> & { mmsi: string }

/**
 * Normalize one AISStream envelope into a partial vessel track.
 * Returns null for subscription confirmations and unsupported frames.
 */
export function parseAisStreamMessage(
  raw: unknown,
  now = Date.now(),
): ParsedAisUpdate | null {
  const envelope = asRecord(raw)
  if (!envelope) return null

  const messageType = asString(envelope.MessageType)
  if (!messageType || messageType === "SubscriptionConfirmation") return null

  const meta = asRecord(envelope.MetaData)
  const message = asRecord(envelope.Message)
  if (!message) return null

  const mmsiValue =
    asNumber(meta?.MMSI) ??
    asNumber(asRecord(message[messageType])?.UserID)
  if (mmsiValue == null) return null
  const mmsi = String(Math.trunc(mmsiValue))

  if (
    messageType === "PositionReport" ||
    messageType === "StandardClassBPositionReport" ||
    messageType === "ExtendedClassBPositionReport"
  ) {
    const position = readPositionPayload(message, messageType)
    if (!position) return null

    return {
      mmsi,
      name: cleanName(asString(meta?.ShipName)),
      ...position,
      lastUpdate: now,
    }
  }

  if (messageType === "ShipStaticData") {
    const staticData = asRecord(message.ShipStaticData)
    if (!staticData) return null
    const dimensions = lengthFromDimension(staticData.Dimension)

    return {
      mmsi,
      name:
        cleanName(asString(staticData.Name)) ??
        cleanName(asString(meta?.ShipName)),
      shipType: asNumber(staticData.Type),
      destination: cleanName(asString(staticData.Destination)),
      ...dimensions,
      lastUpdate: now,
    }
  }

  if (messageType === "StaticDataReport") {
    const report = asRecord(message.StaticDataReport)
    const partA = asRecord(report?.ReportA)
    const partB = asRecord(report?.ReportB)
    const dimensions = lengthFromDimension(partB?.Dimension)

    return {
      mmsi,
      name:
        cleanName(asString(partA?.Name)) ??
        cleanName(asString(meta?.ShipName)),
      shipType: asNumber(partB?.ShipType) ?? asNumber(partB?.Type),
      ...dimensions,
      lastUpdate: now,
    }
  }

  return null
}

export function mergeVesselTrack(
  current: VesselTrack | undefined,
  update: ParsedAisUpdate,
): VesselTrack | null {
  const latitude = update.latitude ?? current?.latitude
  const longitude = update.longitude ?? current?.longitude
  if (latitude == null || longitude == null) return null

  return {
    mmsi: update.mmsi,
    name: update.name ?? current?.name,
    latitude,
    longitude,
    speed: update.speed ?? current?.speed,
    course: update.course ?? current?.course,
    heading: update.heading ?? current?.heading,
    shipType: update.shipType ?? current?.shipType,
    lengthMeters: update.lengthMeters ?? current?.lengthMeters,
    beamMeters: update.beamMeters ?? current?.beamMeters,
    destination: update.destination ?? current?.destination,
    lastUpdate: update.lastUpdate ?? current?.lastUpdate ?? Date.now(),
  }
}
