import Link from "next/link";
import type { AttendeeRow } from "@/lib/db/attendee-list";

interface Props {
  query: string;
  people: AttendeeRow[];
}

export default function SearchResults({ query, people }: Props) {
  return (
    <section className="mt-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-base text-stone-600">
          {people.length === 0
            ? `Nobody found for "${query}".`
            : `${people.length} ${people.length === 1 ? "person" : "people"} found.`}
        </p>
        <Link href="/dashboard" className="shrink-0 text-sm text-stone-600 underline">
          Clear
        </Link>
      </div>

      <ul className="mt-4 space-y-2">
        {people.map((person) => (
          <li key={person.id}>
            <Link
              href={`/dashboard/person/${person.id}`}
              className="block rounded-lg bg-white px-4 py-3 shadow-sm"
            >
              <p className="text-base font-medium">{person.name}</p>
              <p className="text-sm text-stone-600">
                {person.phone || "No phone number"} · {person.cityName}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
