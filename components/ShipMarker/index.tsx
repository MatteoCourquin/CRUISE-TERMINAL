"use client"

export function ShipChevron({
  course = 0,
  selected = false,
}: {
  course?: number
  selected?: boolean
}) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      aria-hidden
      style={{ transform: `rotate(${course}deg)` }}
      className={selected ? "drop-shadow-sm" : undefined}
    >
      <path
        d="M11 2.2 19.2 18.4 11 14.6 2.8 18.4Z"
        fill={selected ? "#0b3a5b" : "#1c1c1e"}
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}
