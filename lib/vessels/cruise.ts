import { SETTINGS } from "@/lib/config"

/**
 * Known ferry / waterbus operators that also report AIS type "Passenger".
 * They must not appear as cruise ships at Holland Amerikakade.
 */
const FERRY_NAME_MARKERS = [
  "STENA",
  "DFDS",
  "P&O",
  "P AND O",
  "BRITTANY",
  "COLOR LINE",
  "FINNLINES",
  "TT-LINE",
  "TT LINE",
  "WASALINE",
  "TALLINK",
  "VIKING LINE",
  "SCANDLINES",
  "IRISH FERRIES",
  "WATERBUS",
  "WATER BUS",
  "SPIDO",
  "RET ",
  "FAST FERRY",
  "HOEK VAN HOLLAND",
  "HOOK OF HOLLAND",
] as const

/**
 * Name fragments typical of large cruise ships calling at Rotterdam.
 * Used when AIS length is not yet known.
 */
const CRUISE_NAME_MARKERS = [
  "STATENDAM",
  "EURODAM",
  "KONINGSDAM",
  "NOORDAM",
  "ZUIDERDAM",
  "OOSTERDAM",
  "WESTERDAM",
  "VOLENDAM",
  "ZAANDAM",
  "PRINSENDAM",
  "ROTTERDAM",
  "NIEUW AMSTERDAM",
  "NIEUW STATENDAM",
  "AIDAPERLA",
  "AIDAPRIMA",
  "AIDANOVA",
  "AIDABELLA",
  "AIDABLU",
  "AIDAMAR",
  "AIDASTELLA",
  "COSTA ",
  "CELEBRITY",
  "QUEEN ANNE",
  "QUEEN MARY",
  "QUEEN ELIZABETH",
  "QUEEN VICTORIA",
  "CUNARD",
  "MEIN SCHIFF",
  "MSC EURIBIA",
  "MSC GRANDIOSA",
  "MSC VIRTUOSA",
  "MSC MAGNIFICA",
  "MSC POESIA",
  "MSC PREZIOSA",
  "MSC SPLENDIDA",
  "MSC SEASIDE",
  "MSC SEAVIEW",
  "MSC MERAVIGLIA",
  "MSC BELLISSIMA",
  "MSC WORLD",
  "SKY PRINCESS",
  "REGAL PRINCESS",
  "CROWN PRINCESS",
  "ISLAND PRINCESS",
  "CARIBBEAN PRINCESS",
  "DISNEY ",
  "NORWEGIAN",
  "ROYAL CARIBBEAN",
  "ANTHEM OF THE",
  "ODYSSEY OF THE",
  "HARMONY OF THE",
  "WONDER OF THE",
  "ICON OF THE",
  "SYMPHONY OF THE",
  "SEABOURN",
  "SILVERSEA",
  "OCEANIA",
  "VIKING STAR",
  "VIKING ORION",
  "VIKING JUPITER",
  "VIKING MARS",
  "VIKING NEPTUNE",
  "VIKING SATURN",
  "VIKING VELA",
  "AZAMARA",
  "REGENT",
  "EXPLORA",
  "ARCADIA",
  "AURORA",
  "IONA",
  "BRITANNIA",
  "VENTURA",
  "AZURA",
] as const

function normalizeName(name?: string): string {
  return (name ?? "").trim().toUpperCase().replace(/\s+/g, " ")
}

export function matchesFerryName(name?: string): boolean {
  const normalized = normalizeName(name)
  if (!normalized) return false
  return FERRY_NAME_MARKERS.some((marker) => normalized.includes(marker))
}

export function matchesCruiseName(name?: string): boolean {
  const normalized = normalizeName(name)
  if (!normalized) return false
  if (matchesFerryName(normalized)) return false
  return CRUISE_NAME_MARKERS.some((marker) => normalized.includes(marker))
}

export type CruiseShipInput = {
  name?: string
  shipType?: number
  shipTypeLabel?: string
  lengthMeters?: number
}

/**
 * Large cruise ships only.
 * AIS type "Passenger" also covers ferries — those are excluded by name
 * and by minimum length when dimensions are available.
 */
export function isLargeCruiseShip(input: CruiseShipInput): boolean {
  const label =
    input.shipTypeLabel ??
    (input.shipType == null
      ? "Unknown"
      : input.shipType >= 60 && input.shipType <= 69
        ? "Passenger"
        : "Other")

  if (label !== "Passenger" && label !== "Unknown") return false
  if (matchesFerryName(input.name)) return false

  if (
    input.lengthMeters != null &&
    Number.isFinite(input.lengthMeters)
  ) {
    return input.lengthMeters >= SETTINGS.minimumCruiseLengthMeters
  }

  // Dimensions not received yet: keep only ships whose name looks like a cruise ship.
  return matchesCruiseName(input.name)
}
