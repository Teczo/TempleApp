import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import PersonRow from "@/components/PersonRow";
import { listAttendeesByCity } from "@/lib/db/attendees";
import { findCityById } from "@/lib/db/cities";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const city = await findCityById(id).catch(() => null);
  return { title: city ? city.name : "City" };
}

export default async function CityPage({ params }: Props) {
  const { id } = await params;

  const city = await findCityById(id).catch(() => null);
  if (!city) notFound();

  const people = await listAttendeesByCity(id).catch(() => []);
  const numbers = people.map((person) => person.phone).filter(Boolean).join(", ");

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

      {people.length > 0 && (
        <CopyButton
          text={numbers}
          label="Copy all numbers"
          doneLabel="All numbers copied."
          emptyMessage="Nobody in this city has a phone number yet."
          className="mt-4"
        />
      )}

      <ul className="mt-5 space-y-2">
        {people.map((person) => (
          <PersonRow
            key={person._id.toString()}
            id={person._id.toString()}
            name={person.name}
            phone={person.phone}
          />
        ))}
      </ul>
    </main>
  );
}
