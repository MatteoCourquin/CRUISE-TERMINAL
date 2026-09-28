"use client"

import { useEffect, useState } from "react"
import {
  AIS_SERVER_URL,
  USE_MOCK_AIS,
} from "@/lib/config"
import {
  advanceTracks,
  createMockTracks,
  vesselsFromTracks,
} from "@/lib/ais"
import { removeStaleVessels, sortByQuayRelevance } from "@/lib/vessels"
import type { Vessel } from "@/types/vessel"
import type { ConnectionStatus, RadarServerMessage } from "@/types/stream"

const MOCK_TICK_MS = 3000

export function useVesselFeed() {
  const [status, setStatus] = useState<ConnectionStatus>(
    USE_MOCK_AIS ? "live" : "connecting",
  )
  const [vessels, setVessels] = useState<Vessel[]>(() =>
    USE_MOCK_AIS ? vesselsFromTracks(createMockTracks()) : [],
  )
  const [hasReceived, setHasReceived] = useState(USE_MOCK_AIS)

  useEffect(() => {
    if (!USE_MOCK_AIS) return

    let tracks = createMockTracks()
    const timer = window.setInterval(() => {
      tracks = advanceTracks(tracks, MOCK_TICK_MS / 1000)
      setVessels(vesselsFromTracks(tracks))
    }, MOCK_TICK_MS)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (USE_MOCK_AIS) return

    const socket = new WebSocket(AIS_SERVER_URL)

    socket.onmessage = (event) => {
      const message = JSON.parse(String(event.data)) as RadarServerMessage
      if (message.type === "status") {
        setStatus(message.status)
        if (message.status === "offline") setHasReceived(true)
      }
      if (message.type === "vessels") {
        setVessels(
          sortByQuayRelevance(
            removeStaleVessels(message.vessels).filter(
              (vessel) => vessel.quayActivity != null,
            ),
          ),
        )
        setHasReceived(true)
        setStatus("live")
      }
    }

    socket.onerror = () => {
      setStatus("offline")
      setHasReceived(true)
    }

    socket.onclose = () => {
      setStatus("offline")
      setHasReceived(true)
    }

    return () => socket.close()
  }, [])

  return {
    status,
    vessels,
    loading: !hasReceived && status === "connecting",
  }
}
