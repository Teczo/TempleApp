import Link from "next/link";
import PersonRow from "./PersonRow";
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
          <PersonRow
            key={person.id}
            id={person.id}
            name={person.name}
            phone={person.phone}
            detail={person.cityName}
          />
        ))}
      </ul>
    </section>
  );
}
