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
import type { QuayActivity, Vessel } from "@/types/vessel"

const ACTIVITY_TONE: Record<QuayActivity, { bar: string; label: string }> = {
  arriving: { bar: "bg-bridge", label: "text-bridge" },
  "at-quay": { bar: "bg-live", label: "text-live" },
  departing: { bar: "bg-wait", label: "text-wait" },
}

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
  const tone = vessel.quayActivity
    ? ACTIVITY_TONE[vessel.quayActivity]
    : { bar: "bg-muted/40", label: "text-muted" }

  return (
    <button
      id={`ship-${vessel.mmsi}`}
      type="button"
      onClick={() => onSelect(vessel.mmsi)}
      aria-pressed={selected}
      className={`group relative w-full overflow-hidden rounded-2xl px-4 py-3.5 text-left transition-[background-color,box-shadow,transform] duration-200 ease-out active:scale-[0.985] ${
        selected
          ? "bg-panel shadow-[0_0_0_1.5px_var(--bridge)]"
          : "bg-panel/80 ring-1 ring-bridge/8 hover:bg-panel hover:ring-bridge/15"
      }`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-3 left-0 w-[3px] rounded-full transition-opacity ${tone.bar} ${
          selected ? "opacity-100" : "opacity-70 group-hover:opacity-100"
        }`}
      />
      <span className="flex items-baseline justify-between gap-3 pl-1">
        <span className="truncate font-display text-[17px] font-bold tracking-tight">
          {vesselName(vessel)}
        </span>
        <span className="shrink-0 font-mono text-[15px] font-medium tabular-nums">
          {primaryTimeLabel(vessel)}
        </span>
      </span>
      <span
        className={`mt-1.5 block pl-1 text-[13px] font-semibold ${tone.label}`}
      >
        {quayActivityLabel(vessel.quayActivity)}
      </span>
      <span className="mt-0.5 block pl-1 text-[13px] text-muted">
        {shipTypeDisplay(vessel)}
        {formatLength(vessel.lengthMeters)
          ? ` · ${formatLength(vessel.lengthMeters)}`
          : ""}
      </span>
      <span className="mt-0.5 flex items-center gap-1 pl-1 text-[13px] text-muted">
        {showArrow && vessel.direction !== "unknown" ? (
          <DirectionIcon className="size-3.5" aria-hidden />
        ) : null}
        {activityDetail(vessel)}
      </span>
      <span className="mt-2.5 flex items-center justify-between border-t border-bridge/8 pt-2 pl-1 font-mono text-[12px] tabular-nums text-muted">
        <span>{formatDistance(vessel.distanceToQuayKm)}</span>
        <span>{formatSpeed(vessel.speed)}</span>
      </span>
    </button>
  )
}
