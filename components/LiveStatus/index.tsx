"use client"

import type { ConnectionStatus } from "@/types/stream"

const STATUS = {
  live: { label: "LIVE", dot: "bg-live" },
  connecting: { label: "Connexion…", dot: "bg-wait" },
  offline: { label: "Hors ligne", dot: "bg-offline" },
} as const

export function LiveStatus({ status }: { status: ConnectionStatus }) {
  const current = STATUS[status]

  return (
    <p className="flex items-center gap-2 text-[13px] font-medium text-ink">
      <span className={`size-2 rounded-full ${current.dot}`} aria-hidden />
      <span>{current.label}</span>
    </p>
  )
}
