import type { Metadata } from "next";
import Link from "next/link";
import CityRow from "@/components/CityRow";
import LogoutButton from "@/components/LogoutButton";
import SearchBox from "@/components/SearchBox";
import SearchResults from "@/components/SearchResults";
import { countActiveAttendees, groupAttendeesByCity, type CityGroup } from "@/lib/db/attendees";
import { searchAttendees, type AttendeeRow } from "@/lib/db/attendee-list";
import { countPendingCities } from "@/lib/db/cities";

export const metadata: Metadata = { title: "Attendees" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const query = ((await searchParams).q ?? "").trim();

  let total = 0;
  let groups: CityGroup[] = [];
  let pending = 0;
  let found: AttendeeRow[] = [];
  let failed = false;

  try {
    [total, groups, pending, found] = await Promise.all([
      countActiveAttendees(),
      groupAttendeesByCity(),
      countPendingCities(),
      query ? searchAttendees(query) : Promise.resolve([]),
    ]);
  } catch {
    failed = true;
  }

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold">
          {failed ? "Attendees" : `${total} ${total === 1 ? "attendee" : "attendees"}`}
        </h1>
        <div className="flex shrink-0 items-baseline gap-3">
          <Link
            href="/dashboard/settings"
            className="text-sm font-medium text-stone-600 underline"
          >
            Settings
          </Link>
          <LogoutButton />
        </div>
      </div>

      <SearchBox query={query} />

      {failed && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-3 text-base text-red-700">
          Could not load the list right now. Please try again in a moment.
        </p>
      )}

      {query ? (
        <SearchResults query={query} people={found} />
      ) : (
        <CityList groups={groups} pending={pending} failed={failed} />
      )}
    </main>
  );
}

function CityList({
  groups,
  pending,
  failed,
}: {
  groups: CityGroup[];
  pending: number;
  failed: boolean;
}) {
  return (
    <>
      {pending > 0 && (
        <Link
          href="/dashboard/locations"
          className="mt-4 block rounded-lg bg-amber-100 px-4 py-3 text-base font-medium text-amber-900"
        >
          {pending === 1 ? "1 new location to check" : `${pending} new locations to check`}
        </Link>
      )}

      {!failed && groups.length === 0 && (
        <p className="mt-4 text-base text-stone-600">No one has joined yet.</p>
      )}

      <ul className="mt-5 space-y-2">
        {groups.map((group) => (
          <CityRow key={group.cityId ?? "none"} {...group} />
        ))}
      </ul>
    </>
  );
}
