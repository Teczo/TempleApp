import type { Metadata } from "next";
import { listActiveAttendees, type Attendee } from "@/lib/db/attendees";
import LogoutButton from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "Attendees",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let people: Attendee[] = [];
  let failed = false;

  try {
    people = await listActiveAttendees();
  } catch {
    failed = true;
  }

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold">
          {failed ? "Attendees" : `${people.length} ${people.length === 1 ? "attendee" : "attendees"}`}
        </h1>
        <LogoutButton />
      </div>

      {failed && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-3 text-base text-red-700">
          Could not load the list right now. Please try again in a moment.
        </p>
      )}

      {!failed && people.length === 0 && (
        <p className="mt-4 text-base text-stone-600">No one has joined yet.</p>
      )}

      <ul className="mt-5 space-y-2">
        {people.map((person) => (
          <li
            key={person._id.toString()}
            className="rounded-lg bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-base font-medium">{person.name}</p>
            <p className="text-sm text-stone-600">{person.phone}</p>
            <p className="text-sm text-stone-500">{person.cityRaw}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
