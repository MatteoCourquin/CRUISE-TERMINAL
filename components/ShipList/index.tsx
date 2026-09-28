"use client"

import { ShipCard } from "@/components/ShipCard"
import type { Vessel } from "@/types/vessel"

export function ShipList({
  vessels,
  selectedMmsi,
  loading,
  onSelect,
}: {
  vessels: Vessel[]
  selectedMmsi: string | null
  loading: boolean
  onSelect: (mmsi: string) => void
}) {
  if (loading) {
    return (
      <div>
        <p className="text-[15px] text-muted">Recherche des bateaux…</p>
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-[92px] rounded-2xl bg-white motion-safe:animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (vessels.length === 0) {
    return (
      <div className="px-1 py-6">
        <p className="text-[17px] font-semibold tracking-tight">
          Aucun paquebot au quai
        </p>
        <p className="mt-2 max-w-[32ch] text-[15px] leading-6 text-muted">
          On surveille les gros paquebots de croisière à Holland Amerikakade.
          Les prochaines arrivées et départs apparaîtront ici automatiquement.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-2">
        {vessels.map((vessel) => (
          <ShipCard
            key={vessel.mmsi}
            vessel={vessel}
            selected={vessel.mmsi === selectedMmsi}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
