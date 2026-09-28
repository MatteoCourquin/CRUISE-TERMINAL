"use client"

import { useEffect } from "react"
import {
  AdvancedMarker,
  APIProvider,
  Circle,
  ColorScheme,
  InfoWindow,
  Map as GoogleMap,
  useMap,
} from "@vis.gl/react-google-maps"
import {
  AIS_BOUNDING_BOX,
  ERASMUS_BRIDGE,
  GOOGLE_MAP_ID,
  GOOGLE_MAPS_API_KEY,
  HOLLAND_AMERIKAKADE,
  SETTINGS,
} from "@/lib/config"
import {
  formatSpeed,
  primaryTimeLabel,
  quayActivityLabel,
  shipTypeDisplay,
  vesselName,
} from "@/lib/vessels"
import type { Vessel } from "@/types/vessel"
import { ShipChevron } from "@/components/ShipMarker"

function project(latitude: number, longitude: number) {
  const { southWest, northEast } = AIS_BOUNDING_BOX
  const x =
    ((longitude - southWest.lng) / (northEast.lng - southWest.lng)) * 100
  const y =
    (1 - (latitude - southWest.lat) / (northEast.lat - southWest.lat)) * 100

  return {
    left: `${Math.min(92, Math.max(8, x))}%`,
    top: `${Math.min(84, Math.max(16, y))}%`,
  }
}

function QuayPin({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex flex-col items-center">
      {!compact ? (
        <span className="mb-1 rounded-full bg-panel/95 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-bridge shadow-[0_4px_14px_-4px_rgba(11,21,32,0.35)] ring-1 ring-bridge/10 backdrop-blur-sm">
          Holland Amerikakade
        </span>
      ) : null}
      <span className="relative flex size-4 items-center justify-center">
        <span className="absolute size-4 rounded-full bg-bridge/25 motion-safe:animate-pulse-live" />
        <span className="size-3 rounded-full border-2 border-white bg-bridge shadow-sm" />
      </span>
    </span>
  )
}

function SchematicMap({
  vessels,
  selected,
  onSelect,
}: {
  vessels: Vessel[]
  selected: Vessel | null
  onSelect: (mmsi: string) => void
}) {
  const quay = project(HOLLAND_AMERIKAKADE.lat, HOLLAND_AMERIKAKADE.lng)
  const bridge = project(ERASMUS_BRIDGE.lat, ERASMUS_BRIDGE.lng)

  return (
    <div className="relative h-full overflow-hidden bg-[#b9c8d4]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,#d5e2ec_0%,transparent_55%),linear-gradient(180deg,#a8bcd0_0%,#c5d4e0_48%,#d8e0e6_100%)]"
      />
      <div className="absolute inset-x-0 top-[42%] h-24 -translate-y-1/2 bg-[#8fadc2]/80 blur-[1px]" />
      <div
        className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        style={quay}
      >
        <QuayPin />
      </div>
      <div
        className="absolute z-[5] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center opacity-80"
        style={bridge}
      >
        <span className="rounded-full bg-panel/90 px-1.5 py-0.5 text-[10px] font-medium text-muted shadow-sm ring-1 ring-bridge/10">
          Erasmusbrug
        </span>
      </div>
      {vessels.map((vessel) => {
        const position = project(vessel.latitude, vessel.longitude)
        const isSelected = vessel.mmsi === selected?.mmsi
        return (
          <button
            key={vessel.mmsi}
            type="button"
            onClick={() => onSelect(vessel.mmsi)}
            className="absolute z-10 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={position}
            aria-label={vesselName(vessel)}
          >
            <ShipChevron course={vessel.course} selected={isSelected} />
          </button>
        )
      })}
      {selected ? (
        <div className="absolute top-3 right-3 left-3 z-20 rounded-2xl bg-panel/95 px-3.5 py-2.5 shadow-[0_12px_30px_-12px_rgba(11,21,32,0.4)] ring-1 ring-bridge/10 backdrop-blur-md lg:left-auto lg:w-72">
          <p className="font-display text-[15px] font-bold tracking-tight">
            {vesselName(selected)}
          </p>
          <p className="text-[13px] font-semibold text-bridge">
            {quayActivityLabel(selected.quayActivity)}
          </p>
          <p className="text-[13px] text-muted">
            {shipTypeDisplay(selected)} · {formatSpeed(selected.speed)} ·{" "}
            {primaryTimeLabel(selected)}
          </p>
        </div>
      ) : null}
      <p className="absolute bottom-3 left-3 rounded-full bg-panel/90 px-2.5 py-1 text-[11px] text-muted shadow-sm ring-1 ring-bridge/10 backdrop-blur-sm">
        Aperçu local, en attente de la clé Google Maps
      </p>
    </div>
  )
}

function FocusSelected({
  focus,
}: {
  focus: { token: number; latitude: number; longitude: number } | null
}) {
  const map = useMap()

  useEffect(() => {
    if (!map || !focus || focus.token === 0) return
    map.panTo({ lat: focus.latitude, lng: focus.longitude })
    const zoom = map.getZoom() ?? SETTINGS.defaultMapZoom
    if (zoom < 14) map.setZoom(14)
  }, [map, focus])

  return null
}

function GoogleRadarMap({
  vessels,
  selected,
  focus,
  onSelect,
}: {
  vessels: Vessel[]
  selected: Vessel | null
  focus: { token: number; latitude: number; longitude: number } | null
  onSelect: (mmsi: string) => void
}) {
  return (
    <GoogleMap
      defaultCenter={{
        lat: HOLLAND_AMERIKAKADE.lat,
        lng: HOLLAND_AMERIKAKADE.lng,
      }}
      defaultZoom={SETTINGS.defaultMapZoom}
      mapId={GOOGLE_MAP_ID}
      colorScheme={ColorScheme.LIGHT}
      gestureHandling="greedy"
      disableDefaultUI
      clickableIcons={false}
      style={{ width: "100%", height: "100%" }}
    >
      <Circle
        center={{
          lat: HOLLAND_AMERIKAKADE.lat,
          lng: HOLLAND_AMERIKAKADE.lng,
        }}
        radius={SETTINGS.maxTrajectoryDistanceMeters}
        strokeColor="#0b3a5b"
        strokeOpacity={0.45}
        strokeWeight={1}
        fillColor="#0b3a5b"
        fillOpacity={0.06}
        clickable={false}
      />
      <AdvancedMarker
        position={{
          lat: HOLLAND_AMERIKAKADE.lat,
          lng: HOLLAND_AMERIKAKADE.lng,
        }}
        title={HOLLAND_AMERIKAKADE.label}
        anchorLeft="-50%"
        anchorTop="-100%"
        zIndex={3}
      >
        <QuayPin />
      </AdvancedMarker>
      <AdvancedMarker
        position={{ lat: ERASMUS_BRIDGE.lat, lng: ERASMUS_BRIDGE.lng }}
        title={ERASMUS_BRIDGE.label}
        anchorLeft="-50%"
        anchorTop="-100%"
        zIndex={2}
      >
        <span className="rounded-full bg-panel/95 px-1.5 py-0.5 text-[10px] font-medium text-muted shadow-sm ring-1 ring-bridge/10">
          Erasmusbrug
        </span>
      </AdvancedMarker>
      {vessels.map((vessel) => (
        <AdvancedMarker
          key={vessel.mmsi}
          position={{ lat: vessel.latitude, lng: vessel.longitude }}
          title={vesselName(vessel)}
          anchorLeft="-50%"
          anchorTop="-50%"
          zIndex={vessel.mmsi === selected?.mmsi ? 5 : 1}
          onClick={() => onSelect(vessel.mmsi)}
        >
          <ShipChevron
            course={vessel.course}
            selected={vessel.mmsi === selected?.mmsi}
          />
        </AdvancedMarker>
      ))}
      {selected ? (
        <InfoWindow
          position={{ lat: selected.latitude, lng: selected.longitude }}
          pixelOffset={[0, -18]}
          onCloseClick={() => onSelect("")}
          headerDisabled
        >
          <div className="min-w-36 pr-1 text-ink">
            <p className="font-display text-[15px] font-bold tracking-tight">
              {vesselName(selected)}
            </p>
            <p className="text-[13px] font-semibold text-bridge">
              {quayActivityLabel(selected.quayActivity)}
            </p>
            <p className="text-[13px] text-muted">
              {shipTypeDisplay(selected)}
              {selected.lengthMeters
                ? ` · ${Math.round(selected.lengthMeters)} m`
                : ""}
            </p>
            <p className="font-mono text-[12px] tabular-nums">
              {formatSpeed(selected.speed)}
            </p>
            <p className="font-mono text-[12px] tabular-nums">
              {primaryTimeLabel(selected)}
            </p>
          </div>
        </InfoWindow>
      ) : null}
      <FocusSelected focus={focus} />
    </GoogleMap>
  )
}

export function Map({
  vessels,
  selectedMmsi,
  focus,
  onSelect,
}: {
  vessels: Vessel[]
  selectedMmsi: string | null
  focus: { token: number; latitude: number; longitude: number } | null
  onSelect: (mmsi: string | null) => void
}) {
  const selected = vessels.find((vessel) => vessel.mmsi === selectedMmsi) ?? null

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <SchematicMap
        vessels={vessels}
        selected={selected}
        onSelect={(mmsi) => onSelect(mmsi)}
      />
    )
  }

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      libraries={["marker"]}
      language="fr"
      region="NL"
    >
      <GoogleRadarMap
        vessels={vessels}
        selected={selected}
        focus={focus}
        onSelect={(mmsi) => onSelect(mmsi)}
      />
    </APIProvider>
  )
}
