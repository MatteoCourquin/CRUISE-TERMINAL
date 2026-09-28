"use client"

import { Check } from "lucide-react"
import type { ShipFilter } from "@/lib/vessels"

const OPTIONS: { id: ShipFilter; label: string; hint: string }[] = [
  {
    id: "cruise",
    label: "Paquebots de croisière",
    hint: "Gros navires uniquement (≥ 180 m, hors ferries)",
  },
  {
    id: "all",
    label: "Tous les mouvements détectés",
    hint: "Debug — garde la trajectoire quai sans filtre croisière",
  },
]

export function Filters({
  open,
  filter,
  hideSmall,
  onClose,
  onFilter,
  onHideSmall,
}: {
  open: boolean
  filter: ShipFilter
  hideSmall: boolean
  onClose: () => void
  onFilter: (filter: ShipFilter) => void
  onHideSmall: (hideSmall: boolean) => void
}) {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-30 flex items-end">
      <button
        type="button"
        aria-label="Fermer les filtres"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filtrer"
        className="relative w-full rounded-t-3xl bg-white px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-black/15" />
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold">Filtrer</h2>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-2 text-[15px] text-muted"
          >
            Fermer
          </button>
        </div>
        <ul>
          {OPTIONS.map((option) => {
            const selected = option.id === filter
            return (
              <li key={option.id} className="border-b border-black/5 py-1">
                <button
                  type="button"
                  onClick={() => onFilter(option.id)}
                  className="flex min-h-12 w-full items-start justify-between gap-3 py-2 text-left"
                >
                  <span>
                    <span className="block text-[17px]">{option.label}</span>
                    <span className="mt-0.5 block text-[13px] text-muted">
                      {option.hint}
                    </span>
                  </span>
                  {selected ? (
                    <Check className="mt-1 size-5 shrink-0 text-bridge" />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
        <button
          type="button"
          role="switch"
          aria-checked={hideSmall}
          onClick={() => onHideSmall(!hideSmall)}
          className="mt-2 flex min-h-12 w-full items-center justify-between text-left text-[17px]"
        >
          Masquer les petits bateaux
          <span
            className={`relative h-7 w-12 rounded-full ${hideSmall ? "bg-bridge" : "bg-black/15"}`}
          >
            <span
              className={`absolute top-0.5 size-6 rounded-full bg-white transition-transform ${hideSmall ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </span>
        </button>
      </div>
    </div>
  )
}
