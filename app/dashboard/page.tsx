import type { Metadata } from "next";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { countActiveAttendees, groupAttendeesByCity, type CityGroup } from "@/lib/db/attendees";
import { countPendingCities } from "@/lib/db/cities";

export const metadata: Metadata = { title: "Attendees" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let total = 0;
  let groups: CityGroup[] = [];
  let pending = 0;
  let failed = false;

  try {
    [total, groups, pending] = await Promise.all([
      countActiveAttendees(),
      groupAttendeesByCity(),
      countPendingCities(),
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
        <LogoutButton />
      </div>

      {failed && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-3 text-base text-red-700">
          Could not load the list right now. Please try again in a moment.
        </p>
      )}

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
          <li key={group.cityId ?? "none"}>
            {group.cityId ? (
              <Link
                href={`/dashboard/city/${group.cityId}`}
                className="flex items-center justify-between rounded-lg bg-white px-4 py-4 shadow-sm"
              >
                <span className="text-base font-medium">
                  {group.cityName}
                  {group.status === "pending" && (
                    <span className="ml-2 text-sm font-normal text-amber-700">
                      needs checking
                    </span>
                  )}
                </span>
                <span className="text-base text-stone-600">{group.count}</span>
              </Link>
            ) : (
              <div className="flex items-center justify-between rounded-lg bg-white px-4 py-4 shadow-sm">
                <span className="text-base font-medium text-stone-500">
                  {group.cityName}
                </span>
                <span className="text-base text-stone-600">{group.count}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
