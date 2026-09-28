"use client"

import { useEffect, useMemo, useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Filters } from "@/components/Filters"
import { GoToBridgeButton } from "@/components/GoToBridgeButton"
import { LiveStatus } from "@/components/LiveStatus"
import { Map } from "@/components/Map"
import { ShipList } from "@/components/ShipList"
import { UpcomingCalls } from "@/components/UpcomingCalls"
import { USE_MOCK_AIS } from "@/lib/config"
import { matchesFilter, type ShipFilter } from "@/lib/vessels"
import { useVesselFeed } from "@/components/useVesselFeed"

export function RadarApp() {
  const feed = useVesselFeed()
  const [selectedMmsi, setSelectedMmsi] = useState<string | null>(null)
  const [focus, setFocus] = useState<{
    token: number
    latitude: number
    longitude: number
  } | null>(null)
  const [filter, setFilter] = useState<ShipFilter>("cruise")
  const [hideSmall, setHideSmall] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const vessels = useMemo(
    () =>
      feed.vessels.filter((vessel) => matchesFilter(vessel, filter, hideSmall)),
    [feed.vessels, filter, hideSmall],
  )

  const visibleMmsi = vessels.some((vessel) => vessel.mmsi === selectedMmsi)
    ? selectedMmsi
    : null

  useEffect(() => {
    if (!visibleMmsi) return
    document
      .getElementById(`ship-${visibleMmsi}`)
      ?.scrollIntoView({ block: "nearest" })
  }, [visibleMmsi])

  function selectFromList(mmsi: string) {
    const vessel = vessels.find((item) => item.mmsi === mmsi)
    setSelectedMmsi(mmsi)
    if (!vessel) return
    setFocus({
      token: Date.now(),
      latitude: vessel.latitude,
      longitude: vessel.longitude,
    })
  }

  function selectFromMap(mmsi: string | null) {
    setSelectedMmsi(mmsi || null)
  }

  const filtersActive = filter !== "cruise" || !hideSmall
  const countLabel =
    feed.loading || vessels.length === 0
      ? null
      : vessels.length === 1
        ? "1 paquebot au quai"
        : `${vessels.length} paquebots au quai`

  return (
    <div className="relative flex h-full flex-col lg:flex-row">
      <aside className="relative h-[46dvh] shrink-0 lg:h-full lg:min-w-0 lg:flex-1">
        <div className="absolute inset-0 lg:inset-0">
          <Map
            vessels={vessels}
            selectedMmsi={visibleMmsi}
            focus={focus}
            onSelect={selectFromMap}
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden pt-5 pl-5 pr-8 lg:block">
          <div className="pointer-events-auto flex max-w-xl items-start justify-between gap-4 rounded-2xl bg-panel/92 px-4 py-3 shadow-[0_12px_40px_-16px_rgba(11,21,32,0.45)] ring-1 ring-bridge/10 backdrop-blur-md">
            <div className="min-w-0">
              <p className="font-display text-[11px] font-semibold tracking-[0.18em] text-muted uppercase">
                Cruise Terminal
              </p>
              <h1 className="mt-0.5 font-display text-[26px] leading-none font-bold tracking-tight text-ink">
                Ship Radar
              </h1>
              <p className="mt-1.5 text-[13px] text-muted">
                Holland Amerikakade · Rotterdam
              </p>
            </div>
            <div className="shrink-0 rounded-full bg-surface px-3 py-1.5 ring-1 ring-bridge/10">
              <LiveStatus status={feed.status} />
            </div>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-[5] hidden w-12 bg-gradient-to-l from-surface to-transparent lg:block"
        />
      </aside>

      <section className="relative flex min-h-0 flex-1 flex-col bg-surface lg:w-[min(440px,42vw)] lg:max-w-[480px] lg:shrink-0 lg:border-l lg:border-bridge/10">
        <header className="flex items-center justify-between gap-3 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2 lg:hidden">
          <div>
            <p className="font-display text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
              Cruise Terminal
            </p>
            <h1 className="font-display text-[20px] leading-tight font-bold tracking-tight">
              Ship Radar
            </h1>
          </div>
          <LiveStatus status={feed.status} />
        </header>

        {USE_MOCK_AIS ? (
          <div className="mx-4 mb-2 rounded-xl border border-wait/25 bg-[#fff6ea] px-3 py-2 text-[13px] text-[#7a4500]">
            Mode démo : bateaux fictifs. Passe{" "}
            <code className="font-mono text-[12px]">
              NEXT_PUBLIC_USE_MOCK_AIS=false
            </code>{" "}
            et lance{" "}
            <code className="font-mono text-[12px]">npm run dev:server</code>{" "}
            pour le quai réel.
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col px-4 pt-1 lg:px-5 lg:pt-5">
          <div className="mb-3 hidden lg:block">
            <p className="font-display text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
              Au quai
            </p>
            <p className="mt-1 text-[15px] text-muted">
              Mouvements live autour de Holland Amerikakade
            </p>
          </div>

          <div className="mb-2 flex min-h-11 items-center justify-between gap-3">
            <h2 className="min-w-0 text-[15px] font-semibold tracking-tight text-ink">
              {countLabel ?? (
                <span className="text-muted">
                  {feed.loading ? "Recherche…" : "Aucun paquebot"}
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-panel px-3 text-[14px] font-medium text-ink ring-1 ring-bridge/10 transition-colors hover:bg-bridge-soft/60 active:scale-[0.97]"
            >
              <SlidersHorizontal className="size-3.5" aria-hidden />
              Filtrer
              {filtersActive ? (
                <span
                  className="size-1.5 rounded-full bg-bridge"
                  aria-hidden
                />
              ) : null}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-24 [scrollbar-gutter:stable]">
          <ShipList
            vessels={vessels}
            selectedMmsi={visibleMmsi}
            loading={feed.loading}
            status={feed.status}
            onSelect={selectFromList}
          />
            <UpcomingCalls />
          </div>
        </div>

        <GoToBridgeButton />
        <Filters
          open={filtersOpen}
          filter={filter}
          hideSmall={hideSmall}
          onClose={() => setFiltersOpen(false)}
          onFilter={setFilter}
          onHideSmall={setHideSmall}
        />
      </section>
    </div>
  )
}
