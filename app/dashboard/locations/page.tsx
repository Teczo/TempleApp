import type { Metadata } from "next";
import Link from "next/link";
import PendingLocation from "@/components/PendingLocation";
import { countAttendeesInCity } from "@/lib/db/attendees";
import { listAllApprovedCities, listPendingCities } from "@/lib/db/cities";

export const metadata: Metadata = { title: "New locations" };
export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const [pending, approved] = await Promise.all([
    listPendingCities().catch(() => []),
    listAllApprovedCities().catch(() => []),
  ]);

  const rows = await Promise.all(
    pending.map(async (city) => ({
      id: city._id.toString(),
      name: city.name,
      country: city.country,
      count: await countAttendeesInCity(city._id.toString()).catch(() => 0),
    })),
  );

  const options = approved.map((city) => ({
    id: city._id.toString(),
    name: city.name,
    region: city.region,
  }));

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <Link href="/dashboard" className="text-sm text-stone-600 underline">
        Back to all cities
      </Link>

      <h1 className="mt-3 text-2xl font-semibold">New locations</h1>
      <p className="mt-1 text-base text-stone-600">
        Someone typed these. Add each one, or say it is the same as a location
        you already have.
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 text-base text-stone-600">
          Nothing to check right now.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {rows.map((city) => (
            <PendingLocation key={city.id} city={city} approved={options} />
          ))}
        </ul>
      )}
    </main>
  );
}
