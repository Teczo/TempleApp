"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface ApprovedOption {
  id: string;
  name: string;
  region: string;
}

interface Props {
  city: { id: string; name: string; country: string; count: number };
  approved: ApprovedOption[];
}

export default function PendingLocation({ city, approved }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [error, setError] = useState("");

  async function send(body: Record<string, string>) {
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/cities/${city.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result?.error ?? "Could not save that change. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not save that change. Please check your internet.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-lg bg-white px-4 py-4 shadow-sm">
      <p className="text-base font-medium">{city.name}</p>
      <p className="text-sm text-stone-600">
        {city.country} · {city.count} {city.count === 1 ? "person" : "people"}
      </p>

      {error && <p className="mt-2 text-base text-red-700">{error}</p>}

      {!choosing ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => send({ action: "approve" })}
            className="rounded-lg bg-amber-700 px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Please wait…" : "Add as new location"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setChoosing(true)}
            className="rounded-lg border border-stone-300 px-4 py-3 text-base font-medium disabled:opacity-60"
          >
            Same as…
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <p className="mb-2 text-sm text-stone-600">
            Which location is this the same as?
          </p>
          <ul className="space-y-1">
            {approved.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => send({ action: "merge", intoCityId: option.id })}
                  className="w-full rounded-lg border border-stone-200 px-3 py-3 text-left text-base hover:bg-amber-50 disabled:opacity-60"
                >
                  {option.name}
                  {option.region && (
                    <span className="ml-2 text-sm text-stone-500">{option.region}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setChoosing(false)}
            className="mt-2 text-sm text-stone-600 underline"
          >
            Cancel
          </button>
        </div>
      )}
    </li>
  );
}
