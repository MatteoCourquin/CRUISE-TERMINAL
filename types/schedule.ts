export type CruiseCall = {
  id: string
  shipName: string
  /** ISO date YYYY-MM-DD in Europe/Amsterdam calendar day. */
  date: string
  arrivalTime: string
  departureTime: string
  venue: string
  status: "upcoming" | "past" | "unknown"
  url: string
  source: "cruise-port-rotterdam"
}

export type CruiseCallsResponse = {
  calls: CruiseCall[]
  fetchedAt: number
  sourceUrl: string
  warning?: string
}
