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
      width="24"
      height="24"
      viewBox="0 0 22 22"
      aria-hidden
      style={{ transform: `rotate(${course}deg)` }}
      className={
        selected
          ? "drop-shadow-[0_2px_6px_rgba(10,61,92,0.45)]"
          : "drop-shadow-[0_1px_2px_rgba(11,21,32,0.25)]"
      }
    >
      <path
        d="M11 2.2 19.2 18.4 11 14.6 2.8 18.4Z"
        fill={selected ? "#0a3d5c" : "#0b1520"}
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
