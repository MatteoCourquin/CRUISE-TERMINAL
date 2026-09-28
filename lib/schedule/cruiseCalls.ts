import type { CruiseCall } from "@/types/schedule"

export const CRUISE_CALLS_URL =
  "https://www.cruiseportrotterdam.nl/cruise-calls/"

const TIME_RANGE =
  /(?:maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag)\s*,\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/i

const ITEM_BLOCK =
  /<div class="grid-item-content">([\s\S]*?)<\/div>\s*(?:<p>&hellip;<\/p>)?\s*<div class="post-actions">/gi

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .trim()
}

function stripTags(value: string): string {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
}

/**
 * Parse Cruise Port Rotterdam cruise-calls HTML.
 * Includes all lines calling at Cruise Terminal Rotterdam (HAL, AIDA, MSC…).
 */
export function parseCruiseCallsHtml(html: string): CruiseCall[] {
  const calls: CruiseCall[] = []
  const seen = new Set<string>()

  for (const match of html.matchAll(ITEM_BLOCK)) {
    const block = match[1] ?? ""
    const linkMatch = block.match(
      /<h3>\s*<a href="([^"]+event_date=(\d{4}-\d{2}-\d{2})[^"]*)"[^>]*>([\s\S]*?)<\/a>\s*<\/h3>/i,
    )
    if (!linkMatch) continue

    const url = decodeHtml(linkMatch[1] ?? "")
    const date = linkMatch[2] ?? ""
    const shipName = stripTags(linkMatch[3] ?? "")
    if (!date || !shipName) continue

    const venueMatch = block.match(
      /venue\/[^"]+"[^>]*rel="tag">([\s\S]*?)<\/a>/i,
    )
    const venue = stripTags(venueMatch?.[1] ?? "Cruise Terminal Rotterdam")
    if (!/cruise terminal/i.test(venue)) continue

    const timeMatch = block.match(TIME_RANGE)
    const arrivalTime = timeMatch?.[1] ?? "—"
    const departureTime = timeMatch?.[2] ?? "—"

    const status = /label-success[^>]*>\s*Upcoming/i.test(block)
      ? "upcoming"
      : /label-default|Past/i.test(block)
        ? "past"
        : "unknown"

    const id = `${date}-${shipName.toLowerCase().replace(/\s+/g, "-")}`
    if (seen.has(id)) continue
    seen.add(id)

    calls.push({
      id,
      shipName,
      date,
      arrivalTime,
      departureTime,
      venue,
      status,
      url,
      source: "cruise-port-rotterdam",
    })
  }

  return calls.sort((a, b) => {
    const left = `${a.date}T${a.arrivalTime}`
    const right = `${b.date}T${b.arrivalTime}`
    return left.localeCompare(right)
  })
}

export function filterUpcomingCalls(
  calls: CruiseCall[],
  now = new Date(),
  limit = 12,
): CruiseCall[] {
  const today = now.toLocaleDateString("en-CA", {
    timeZone: "Europe/Amsterdam",
  })

  return calls
    .filter((call) => call.status !== "past")
    .filter((call) => call.date >= today)
    .slice(0, limit)
}

export function formatCallDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00+02:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Europe/Amsterdam",
  }).format(parsed)
}

export function formatCallWindow(call: CruiseCall): string {
  if (call.arrivalTime === "—" || call.departureTime === "—") return "Horaires à confirmer"
  return `${call.arrivalTime} → ${call.departureTime}`
}
