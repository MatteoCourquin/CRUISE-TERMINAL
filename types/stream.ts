import type { Vessel } from "./vessel"

export type ConnectionStatus = "live" | "connecting" | "offline"

export type RadarServerMessage =
  | {
      type: "status"
      status: ConnectionStatus
    }
  | {
      type: "vessels"
      vessels: Vessel[]
      updatedAt: number
    }
