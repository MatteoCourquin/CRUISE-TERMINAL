import {
  removeStaleVessels,
  sortByQuayRelevance,
  toVessel,
  type VesselTrack,
} from "@/lib/vessels"
import type { Vessel } from "@/types/vessel"
import {
  mergeVesselTrack,
  parseAisStreamMessage,
  type ParsedAisUpdate,
} from "@/lib/ais/parse"

export class VesselStore {
  private tracks = new Map<string, VesselTrack>()
  private staticByMmsi = new Map<string, ParsedAisUpdate>()

  ingestRawMessage(raw: unknown, now = Date.now()): void {
    const update = parseAisStreamMessage(raw, now)
    if (!update) return

    const hasPosition =
      update.latitude != null &&
      update.longitude != null &&
      Number.isFinite(update.latitude) &&
      Number.isFinite(update.longitude)

    if (!hasPosition) {
      const previous = this.staticByMmsi.get(update.mmsi)
      this.staticByMmsi.set(update.mmsi, {
        ...previous,
        ...update,
        lastUpdate: now,
      })
      const existing = this.tracks.get(update.mmsi)
      if (!existing) return
      const merged = mergeVesselTrack(existing, update)
      if (merged) this.tracks.set(update.mmsi, merged)
      return
    }

    const staticData = this.staticByMmsi.get(update.mmsi)
    const withStatic = staticData
      ? {
          ...staticData,
          ...update,
          name: update.name ?? staticData.name,
          shipType: update.shipType ?? staticData.shipType,
          lengthMeters: update.lengthMeters ?? staticData.lengthMeters,
          beamMeters: update.beamMeters ?? staticData.beamMeters,
          destination: update.destination ?? staticData.destination,
          lastUpdate: now,
        }
      : update

    const merged = mergeVesselTrack(this.tracks.get(update.mmsi), withStatic)
    if (!merged) return
    this.tracks.set(update.mmsi, merged)
  }

  prune(now = Date.now()): void {
    const fresh = removeStaleVessels([...this.tracks.values()], now)
    this.tracks = new Map(fresh.map((track) => [track.mmsi, track]))
  }

  listTracks(now = Date.now()): VesselTrack[] {
    this.prune(now)
    return [...this.tracks.values()]
  }

  listRelevantVessels(now = Date.now()): Vessel[] {
    return sortByQuayRelevance(
      this.listTracks(now)
        .map((track) => toVessel(track, now))
        .filter((vessel) => vessel.relevantToQuay),
    )
  }

  listQuayVessels(now = Date.now()): Vessel[] {
    return sortByQuayRelevance(
      this.listTracks(now)
        .map((track) => toVessel(track, now))
        .filter((vessel) => vessel.quayActivity != null),
    )
  }

  size(): number {
    return this.tracks.size
  }
}
