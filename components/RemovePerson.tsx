"use client";

import { useState } from "react";

interface Props {
  name: string;
  busy: boolean;
  removing: boolean;
  onRemove: () => void;
}

/** Two taps, so nobody is taken off the list by accident. */
export default function RemovePerson({ name, busy, removing, onRemove }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => setConfirming(true)}
        className="w-full rounded-lg border border-red-300 px-4 py-3 text-base font-medium text-red-700 disabled:opacity-60"
      >
        Take off the list
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-red-300 px-4 py-4">
      <p className="text-base">Take {name} off the list?</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onRemove}
          className="flex-1 rounded-lg bg-red-700 px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
        >
          {removing ? "Please wait…" : "Yes, take off"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setConfirming(false)}
          className="flex-1 rounded-lg border border-stone-300 px-4 py-3 text-base font-medium"
        >
          Keep
        </button>
      </div>
    </div>
  );
}
