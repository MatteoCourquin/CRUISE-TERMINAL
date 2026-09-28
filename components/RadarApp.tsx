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

  return (
    <div className="relative flex h-full flex-col">
      <header className="flex items-center justify-between gap-3 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
        <h1 className="text-[17px] font-semibold tracking-tight">
          Rotterdam Ship Radar
        </h1>
        <LiveStatus status={feed.status} />
      </header>
      {USE_MOCK_AIS ? (
        <div className="mx-4 mb-2 rounded-xl bg-[#fff4e5] px-3 py-2 text-[13px] text-[#8a4b00]">
          Mode démo : bateaux fictifs. Passe{" "}
          <code className="font-mono">NEXT_PUBLIC_USE_MOCK_AIS=false</code> et
          lance <code className="font-mono">npm run dev:server</code> pour le
          quai réel.
        </div>
      ) : null}
      <div className="h-[50dvh] shrink-0">
        <Map
          vessels={vessels}
          selectedMmsi={visibleMmsi}
          focus={focus}
          onSelect={selectFromMap}
        />
      </div>
      <section className="flex min-h-0 flex-1 flex-col px-4 pt-3">
        <div className="mb-2 flex min-h-11 items-center justify-between gap-3">
          <h2 className="text-[15px] font-medium">
            {feed.loading || vessels.length === 0
              ? ""
              : vessels.length === 1
                ? "1 paquebot au quai"
                : `${vessels.length} paquebots au quai`}
          </h2>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex min-h-11 shrink-0 items-center gap-1.5 px-1 text-[15px] text-ink"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filtrer
            {filtersActive ? (
              <span className="size-1.5 rounded-full bg-bridge" aria-hidden />
            ) : null}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pb-24">
          <ShipList
            vessels={vessels}
            selectedMmsi={visibleMmsi}
            loading={feed.loading}
            onSelect={selectFromList}
          />
          <UpcomingCalls />
        </div>
      </section>
      <GoToBridgeButton />
      <Filters
        open={filtersOpen}
        filter={filter}
        hideSmall={hideSmall}
        onClose={() => setFiltersOpen(false)}
        onFilter={setFilter}
        onHideSmall={setHideSmall}
      />
    </div>
  )
}
