"use client"

import { MapPin } from "lucide-react"
import { HOLLAND_AMERIKAKADE } from "@/lib/config"

const destination = `${HOLLAND_AMERIKAKADE.lat},${HOLLAND_AMERIKAKADE.lng}`
const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`

export function GoToBridgeButton() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(12px,env(safe-area-inset-bottom))]">
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto flex h-12 items-center justify-center gap-2 rounded-full bg-bridge text-[16px] font-medium text-white"
      >
        <MapPin className="size-4" aria-hidden />
        Y aller
      </a>
    </div>
  )
}
