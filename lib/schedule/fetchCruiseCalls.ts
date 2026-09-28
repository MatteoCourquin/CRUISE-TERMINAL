import {
  CRUISE_CALLS_URL,
  filterUpcomingCalls,
  parseCruiseCallsHtml,
} from "@/lib/schedule/cruiseCalls"
import type { CruiseCallsResponse } from "@/types/schedule"

export async function fetchCruiseCalls(): Promise<CruiseCallsResponse> {
  const response = await fetch(CRUISE_CALLS_URL, {
    headers: {
      "User-Agent": "RotterdamShipRadar/0.1 (local MVP; schedule mirror)",
      Accept: "text/html",
    },
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    return {
      calls: [],
      fetchedAt: Date.now(),
      sourceUrl: CRUISE_CALLS_URL,
      warning: `Impossible de lire le planning (${response.status}).`,
    }
  }

  const html = await response.text()
  const parsed = parseCruiseCallsHtml(html)
  const calls = filterUpcomingCalls(parsed)

  return {
    calls,
    fetchedAt: Date.now(),
    sourceUrl: CRUISE_CALLS_URL,
    warning:
      calls.length === 0
        ? "Aucune escale à venir trouvée sur Cruise Port Rotterdam."
        : undefined,
  }
}
