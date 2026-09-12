import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listAttendeesByCity } from "@/lib/db/attendees";
import { findCityById } from "@/lib/db/cities";

export const metadata: Metadata = { title: "City" };
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CityPage({ params }: Props) {
  const { id } = await params;

  const city = await findCityById(id).catch(() => null);
  if (!city) notFound();

  const people = await listAttendeesByCity(id).catch(() => []);

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <Link href="/dashboard" className="text-sm text-stone-600 underline">
        Back to all cities
      </Link>

      <h1 className="mt-3 text-2xl font-semibold">{city.name}</h1>
      <p className="text-base text-stone-600">
        {people.length} {people.length === 1 ? "person" : "people"}
        {city.region ? ` · ${city.region}` : ""}
      </p>

      {people.length === 0 && (
        <p className="mt-5 text-base text-stone-600">Nobody is in this city yet.</p>
      )}

      <ul className="mt-5 space-y-2">
        {people.map((person) => (
          <li
            key={person._id.toString()}
            className="rounded-lg bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-base font-medium">{person.name}</p>
            <p className="text-sm text-stone-600">{person.phone || "No phone number"}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
