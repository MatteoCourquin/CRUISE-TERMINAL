import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  filterUpcomingCalls,
  parseCruiseCallsHtml,
} from "@/lib/schedule/cruiseCalls"

const SAMPLE = `
<li class="grid-item">
  <div class="grid-item-content">
    <div class="event-time">
      <span class="date">29</span>
      <span class="month">sep<span>, 26</span></span>
    </div>
    <span class="label label-success">Upcoming</span>
    <h3><a href="https://www.cruiseportrotterdam.nl/events/29092026/?event_date=2026-09-29">Sky Princess</a></h3>
    <div class="meta-data grid-item-meta alt">
      <div><i class="fa fa-map-marker"></i> <a href="https://www.cruiseportrotterdam.nl/venue/cruise-terminal-rotterdam/" rel="tag">Cruise Terminal Rotterdam</a></div>
      <div>dinsdag, 08:00 - 21:00</div>
    </div>
    <div class="post-actions"></div>
  </div>
</li>
<li class="grid-item">
  <div class="grid-item-content">
    <span class="label label-success">Upcoming</span>
    <h3><a href="https://www.cruiseportrotterdam.nl/events/03102026/?event_date=2026-10-03">Nieuw Statendam</a></h3>
    <div class="meta-data grid-item-meta alt">
      <div><a href="https://www.cruiseportrotterdam.nl/venue/cruise-terminal-rotterdam/" rel="tag">Cruise Terminal Rotterdam</a></div>
      <div>zaterdag, 07:00 - 15:00</div>
    </div>
    <div class="post-actions"></div>
  </div>
</li>
`

describe("parseCruiseCallsHtml", () => {
  it("extracts ship name, date and berth window", () => {
    const calls = parseCruiseCallsHtml(SAMPLE)
    assert.equal(calls.length, 2)
    assert.equal(calls[0]?.shipName, "Sky Princess")
    assert.equal(calls[0]?.date, "2026-09-29")
    assert.equal(calls[0]?.arrivalTime, "08:00")
    assert.equal(calls[0]?.departureTime, "21:00")
    assert.equal(calls[1]?.shipName, "Nieuw Statendam")
  })
})

describe("filterUpcomingCalls", () => {
  it("keeps only calls on or after today", () => {
    const calls = parseCruiseCallsHtml(SAMPLE)
    const filtered = filterUpcomingCalls(
      calls,
      new Date("2026-09-30T10:00:00+02:00"),
      10,
    )
    assert.deepEqual(
      filtered.map((call) => call.shipName),
      ["Nieuw Statendam"],
    )
  })
})
