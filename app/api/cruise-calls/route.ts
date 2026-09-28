import { fetchCruiseCalls } from "@/lib/schedule/fetchCruiseCalls"

export const dynamic = "force-dynamic"

export async function GET() {
  const payload = await fetchCruiseCalls()
  return Response.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  })
}
