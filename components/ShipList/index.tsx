"use client"

import { ShipCard } from "@/components/ShipCard"
import type { ConnectionStatus } from "@/types/stream"
import type { Vessel } from "@/types/vessel"

export function ShipList({
  vessels,
  selectedMmsi,
  loading,
  status,
  onSelect,
}: {
  vessels: Vessel[]
  selectedMmsi: string | null
  loading: boolean
  status: ConnectionStatus
  onSelect: (mmsi: string) => void
}) {
  if (loading) {
    return (
      <div aria-busy="true" aria-live="polite">
        <p className="text-[15px] text-muted">Recherche des bateaux…</p>
        <div className="mt-3 space-y-2.5">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-[108px] rounded-2xl bg-panel motion-safe:animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  if (vessels.length === 0) {
    if (status === "offline") {
      return (
        <div className="rounded-2xl bg-panel px-4 py-7 ring-1 ring-bridge/8">
          <p className="font-display text-[18px] font-bold tracking-tight">
            Flux AIS indisponible
          </p>
          <p className="mt-2 max-w-[36ch] text-[14px] leading-6 text-muted">
            Ce n’est pas qu’il n’y a pas de paquebot : le radar n’est pas
            connecté. Lance{" "}
            <code className="font-mono text-[12px]">npm run dev:server</code>{" "}
            avec ta clé AISStream, ou active le mode démo.
          </p>
        </div>
      )
    }

    return (
      <div className="rounded-2xl bg-panel px-4 py-7 ring-1 ring-bridge/8">
        <p className="font-display text-[18px] font-bold tracking-tight">
          Aucun paquebot au quai
        </p>
        <p className="mt-2 max-w-[36ch] text-[14px] leading-6 text-muted">
          Le flux est actif. On surveille les gros paquebots de croisière à
          Holland Amerikakade — les prochaines arrivées et départs
          apparaîtront ici automatiquement.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-2.5">
      {vessels.map((vessel, index) => (
        <li
          key={vessel.mmsi}
          className="animate-rise-in"
          style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
        >
          <ShipCard
            vessel={vessel}
            selected={vessel.mmsi === selectedMmsi}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  )
}
