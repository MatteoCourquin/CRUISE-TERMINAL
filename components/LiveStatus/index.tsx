"use client"

import type { ConnectionStatus } from "@/types/stream"

const STATUS = {
  live: { label: "LIVE", dot: "bg-live", pulse: true },
  connecting: { label: "Connexion…", dot: "bg-wait", pulse: false },
  offline: { label: "Hors ligne", dot: "bg-offline", pulse: false },
} as const

export function LiveStatus({ status }: { status: ConnectionStatus }) {
  const current = STATUS[status]

  return (
    <p className="flex items-center gap-2 text-[12px] font-semibold tracking-wide text-ink">
      <span
        className={`size-2 rounded-full ${current.dot} ${
          current.pulse ? "motion-safe:animate-pulse-live" : ""
        }`}
        aria-hidden
      />
      <span>{current.label}</span>
    </p>
  )
}
