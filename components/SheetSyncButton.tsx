"use client";

import { useState } from "react";

const TRY_AGAIN = "Could not update the sheet right now. Please try again.";

export default function SheetSyncButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleClick() {
    setBusy(true);
    setMessage("");
    try {
      const reply = await fetch("/api/sheet", { method: "POST" });
      const data = (await reply.json()) as { people?: number; error?: string };
      if (!reply.ok) {
        setMessage(data.error ?? TRY_AGAIN);
      } else {
        const people = data.people ?? 0;
        setMessage(
          people === 1 ? "Sheet updated. 1 person on it." : `Sheet updated. ${people} people on it.`,
        );
      }
    } catch {
      setMessage(TRY_AGAIN);
    }
    setBusy(false);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base font-medium disabled:opacity-60"
      >
        {busy ? "Updating…" : "Update the sheet now"}
      </button>
      {message && <p className="mt-2 text-sm text-stone-600">{message}</p>}
    </div>
  );
}
