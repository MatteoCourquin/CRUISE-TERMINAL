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
    <div className="absolute inset-0 z-30 flex items-end lg:items-center lg:justify-center lg:p-6">
      <button
        type="button"
        aria-label="Fermer les filtres"
        className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filtrer"
        className="relative w-full animate-rise-in rounded-t-3xl bg-panel px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_-12px_rgba(11,21,32,0.35)] lg:max-w-md lg:rounded-3xl lg:pb-5"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-bridge/15 lg:hidden" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[18px] font-bold tracking-tight">
            Filtrer
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-[14px] font-medium text-muted transition-colors hover:bg-bridge-soft/50 hover:text-ink"
          >
            Fermer
          </button>
        </div>
        <ul>
          {OPTIONS.map((option) => {
            const selected = option.id === filter
            return (
              <li key={option.id} className="border-b border-bridge/8 py-1">
                <button
                  type="button"
                  onClick={() => onFilter(option.id)}
                  className="flex min-h-12 w-full items-start justify-between gap-3 rounded-xl py-2.5 text-left transition-colors hover:bg-bridge-soft/30"
                >
                  <span>
                    <span className="block text-[16px] font-medium">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-muted">
                      {option.hint}
                    </span>
                  </span>
                  {selected ? (
                    <Check
                      className="mt-1 size-5 shrink-0 text-bridge"
                      aria-hidden
                    />
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
          className="mt-3 flex min-h-12 w-full items-center justify-between rounded-xl text-left text-[16px] font-medium"
        >
          Masquer les petits bateaux
          <span
            className={`relative h-7 w-12 rounded-full transition-colors ${hideSmall ? "bg-bridge" : "bg-bridge/15"}`}
          >
            <span
              className={`absolute top-0.5 size-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${hideSmall ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </span>
        </button>
      </div>
    </div>
  )
}
