import { WebSocketServer, WebSocket } from "ws"
import {
  AIS_MESSAGE_TYPES,
  AIS_SERVER_PORT,
  AISSTREAM_URL,
  toAisStreamBoundingBoxes,
} from "../lib/config"
import { VesselStore } from "../lib/ais/store"
import type { ConnectionStatus, RadarServerMessage } from "../types/stream"

const port = Number.isFinite(AIS_SERVER_PORT) ? AIS_SERVER_PORT : 3001
const apiKey = process.env.AISSTREAM_API_KEY?.trim()

const store = new VesselStore()
const clients = new Set<WebSocket>()
let aisStatus: ConnectionStatus = "connecting"
let aisSocket: WebSocket | null = null
let reconnectAttempt = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let broadcastTimer: ReturnType<typeof setInterval> | null = null

function send(socket: WebSocket, message: RadarServerMessage) {
  if (socket.readyState !== WebSocket.OPEN) return
  socket.send(JSON.stringify(message))
}

function broadcast(message: RadarServerMessage) {
  for (const client of clients) send(client, message)
}

function setStatus(status: ConnectionStatus) {
  if (aisStatus === status) return
  aisStatus = status
  broadcast({ type: "status", status })
  console.log(`[ais] status → ${status}`)
}

function publishVessels() {
  const vessels = store.listQuayVessels()
  broadcast({
    type: "vessels",
    vessels,
    updatedAt: Date.now(),
  })
}

function clearReconnectTimer() {
  if (!reconnectTimer) return
  clearTimeout(reconnectTimer)
  reconnectTimer = null
}

function scheduleReconnect() {
  clearReconnectTimer()
  const delay = Math.min(30_000, 1000 * 2 ** reconnectAttempt)
  reconnectAttempt += 1
  console.log(`[ais] reconnecting to AISStream in ${delay}ms`)
  reconnectTimer = setTimeout(() => {
    connectAisStream()
  }, delay)
}

function connectAisStream() {
  if (!apiKey) {
    setStatus("offline")
    console.error(
      "[ais] AISSTREAM_API_KEY is missing. Add it to .env and restart npm run dev:server.",
    )
    return
  }

  if (
    aisSocket &&
    (aisSocket.readyState === WebSocket.OPEN ||
      aisSocket.readyState === WebSocket.CONNECTING)
  ) {
    return
  }

  setStatus("connecting")
  console.log(`[ais] connecting to ${AISSTREAM_URL}`)

  const socket = new WebSocket(AISSTREAM_URL, {
    perMessageDeflate: true,
  })
  aisSocket = socket

  socket.on("open", () => {
    reconnectAttempt = 0
    const subscription = {
      APIKey: apiKey,
      BoundingBoxes: toAisStreamBoundingBoxes(),
      FilterMessageTypes: [...AIS_MESSAGE_TYPES],
    }
    socket.send(JSON.stringify(subscription))
    console.log("[ais] subscription sent for Rotterdam bounding box")
  })

  socket.on("message", (data) => {
    try {
      const text =
        typeof data === "string" ? data : Buffer.from(data as Buffer).toString("utf8")
      const payload = JSON.parse(text) as unknown
      const envelope = payload as { MessageType?: string }

      if (envelope.MessageType === "SubscriptionConfirmation") {
        setStatus("live")
        console.log("[ais] AISStream subscription confirmed")
        return
      }

      store.ingestRawMessage(payload)
    } catch (error) {
      console.error("[ais] failed to parse AIS message", error)
    }
  })

  socket.on("error", (error) => {
    console.error("[ais] AISStream socket error", error)
  })

  socket.on("close", (code, reason) => {
    console.warn(
      `[ais] AISStream closed (${code}) ${reason.toString() || ""}`.trim(),
    )
    if (aisSocket === socket) aisSocket = null
    setStatus("offline")
    scheduleReconnect()
  })
}

const wss = new WebSocketServer({ port })

wss.on("connection", (socket) => {
  clients.add(socket)
  send(socket, { type: "status", status: aisStatus })
  send(socket, {
    type: "vessels",
    vessels: store.listQuayVessels(),
    updatedAt: Date.now(),
  })
  console.log(`[ais] frontend client connected (${clients.size})`)

  socket.on("close", () => {
    clients.delete(socket)
    console.log(`[ais] frontend client disconnected (${clients.size})`)
  })
})

wss.on("error", (error) => {
  console.error("[ais] frontend websocket server failed", error)
  process.exit(1)
})

broadcastTimer = setInterval(() => {
  store.prune()
  publishVessels()
}, 2000)

connectAisStream()

console.log(`[ais] frontend websocket on ws://localhost:${port}`)
console.log(
  apiKey
    ? "[ais] AISSTREAM_API_KEY loaded — connecting to live stream"
    : "[ais] AISSTREAM_API_KEY missing",
)

function shutdown() {
  clearReconnectTimer()
  if (broadcastTimer) clearInterval(broadcastTimer)
  aisSocket?.close()
  wss.close()
  process.exit(0)
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
