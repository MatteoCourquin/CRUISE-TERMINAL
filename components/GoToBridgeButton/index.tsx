"use client"

import { MapPin } from "lucide-react"
import { HOLLAND_AMERIKAKADE } from "@/lib/config"

const destination = `${HOLLAND_AMERIKAKADE.lat},${HOLLAND_AMERIKAKADE.lng}`
const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`

export function GoToBridgeButton() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-surface via-surface/95 to-transparent px-4 pt-8 pb-[max(12px,env(safe-area-inset-bottom))] lg:px-5">
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto flex h-12 items-center justify-center gap-2 rounded-full bg-bridge text-[15px] font-semibold tracking-tight text-white shadow-[0_10px_28px_-8px_rgba(10,61,92,0.55)] transition-transform duration-150 ease-out hover:bg-[#0c4a6e] active:scale-[0.98]"
      >
        <MapPin className="size-4" aria-hidden />
        Y aller · Holland Amerikakade
      </a>
    </div>
  )
}
