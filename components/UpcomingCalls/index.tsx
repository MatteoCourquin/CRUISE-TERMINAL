"use client"

import { useEffect, useState } from "react"
import {
  formatCallDate,
  formatCallWindow,
} from "@/lib/schedule/cruiseCalls"
import type { CruiseCall, CruiseCallsResponse } from "@/types/schedule"

export function UpcomingCalls() {
  const [calls, setCalls] = useState<CruiseCall[]>([])
  const [warning, setWarning] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sourceUrl, setSourceUrl] = useState(
    "https://www.cruiseportrotterdam.nl/cruise-calls/",
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetch("/api/cruise-calls")
        const payload = (await response.json()) as CruiseCallsResponse
        if (cancelled) return
        setCalls(payload.calls)
        setWarning(payload.warning ?? null)
        setSourceUrl(payload.sourceUrl)
      } catch {
        if (!cancelled) {
          setWarning("Impossible de charger les prochaines escales.")
          setCalls([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="mt-6 border-t border-black/10 pt-4">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-medium">Prochaines escales</h2>
          <p className="mt-0.5 text-[12px] text-muted">
            Planning officiel du Cruise Terminal — toutes compagnies
          </p>
        </div>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[12px] text-bridge"
        >
          Source
        </a>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-16 rounded-2xl bg-white motion-safe:animate-pulse"
            />
          ))}
        </div>
      ) : null}

      {!loading && warning && calls.length === 0 ? (
        <p className="text-[14px] leading-6 text-muted">{warning}</p>
      ) : null}

      {!loading && calls.length > 0 ? (
        <ul className="space-y-2">
          {calls.map((call) => (
            <li key={call.id}>
              <a
                href={call.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl bg-white px-4 py-3 ring-1 ring-black/10"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-[16px] font-semibold tracking-tight">
                    {call.shipName}
                  </span>
                  <span className="shrink-0 text-[13px] tabular-nums text-muted">
                    {formatCallDate(call.date)}
                  </span>
                </span>
                <span className="mt-1 block text-[13px] text-muted">
                  {formatCallWindow(call)}
                </span>
                <span className="mt-0.5 block text-[12px] text-muted">
                  Holland Amerikakade
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {!loading && calls.length > 0 ? (
        <p className="mt-3 text-[11px] leading-5 text-muted">
          Horaires sous réserve de modification (Cruise Port Rotterdam). Ce
          n’est pas une position AIS en direct.
        </p>
      ) : null}
    </section>
  )
}
