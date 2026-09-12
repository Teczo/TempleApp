import { NextResponse } from "next/server";
import { listApprovedCities } from "@/lib/db/cities";
import { findCountry } from "@/lib/utils/countries";

export const dynamic = "force-dynamic";

/** Used by the city box on the join page. Returns approved names only. */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("country") ?? "";
  const country = findCountry(code);
  if (!country) {
    return NextResponse.json({ cities: [] });
  }

  try {
    const cities = await listApprovedCities(country.code);
    return NextResponse.json({
      cities: cities.map((city) => ({
        id: city._id.toString(),
        name: city.name,
        region: city.region,
      })),
    });
  } catch {
    return NextResponse.json({ cities: [] });
  }
}
