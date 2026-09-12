"use client";

import { useFormStatus } from "react-dom";

/** The button says "Please wait…" while the list is being fetched. */
function FindButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-lg bg-amber-700 px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Please wait…" : "Find"}
    </button>
  );
}

export default function SearchBox({ query }: { query: string }) {
  return (
    <form action="/dashboard" method="get" className="mt-4 flex gap-2">
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Search a name or number"
        aria-label="Search a name or number"
        className="w-full min-w-0 rounded-lg border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:border-amber-700"
      />
      <FindButton />
    </form>
  );
}
