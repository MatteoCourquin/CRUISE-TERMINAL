"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import {
  activityDetail,
  formatDistance,
  formatLength,
  formatSpeed,
  primaryTimeLabel,
  quayActivityLabel,
  shipTypeDisplay,
  vesselName,
} from "@/lib/vessels"
import type { Vessel } from "@/types/vessel"

export function ShipCard({
  vessel,
  selected,
  onSelect,
}: {
  vessel: Vessel
  selected: boolean
  onSelect: (mmsi: string) => void
}) {
  const DirectionIcon =
    vessel.direction === "east-to-west" ? ArrowRight : ArrowLeft
  const showArrow =
    vessel.quayActivity === "arriving" || vessel.quayActivity === "departing"

  return (
    <button
      id={`ship-${vessel.mmsi}`}
      type="button"
      onClick={() => onSelect(vessel.mmsi)}
      aria-pressed={selected}
      className={`w-full rounded-2xl px-4 py-3 text-left ${
        selected
          ? "bg-white ring-2 ring-bridge"
          : "bg-white ring-1 ring-black/10"
      }`}
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="truncate text-[17px] font-semibold tracking-tight">
          {vesselName(vessel)}
        </span>
        <span className="shrink-0 text-[17px] font-semibold tabular-nums">
          {primaryTimeLabel(vessel)}
        </span>
      </span>
      <span className="mt-1 block text-[13px] font-medium text-bridge">
        {quayActivityLabel(vessel.quayActivity)}
      </span>
      <span className="mt-0.5 block text-[13px] text-muted">
        {shipTypeDisplay(vessel)}
        {formatLength(vessel.lengthMeters)
          ? ` · ${formatLength(vessel.lengthMeters)}`
          : ""}
      </span>
      <span className="mt-0.5 flex items-center gap-1 text-[13px] text-muted">
        {showArrow && vessel.direction !== "unknown" ? (
          <DirectionIcon className="size-3.5" aria-hidden />
        ) : null}
        {activityDetail(vessel)}
      </span>
      <span className="mt-2 flex items-center justify-between text-[13px] tabular-nums">
        <span>{formatDistance(vessel.distanceToQuayKm)}</span>
        <span>{formatSpeed(vessel.speed)}</span>
      </span>
    </button>
  )
}
