"use client";

import { useState } from "react";

const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:border-amber-700";

export default function JoinForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [joinedName, setJoinedName] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, city }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result?.error ?? "Could not save. Please try again.");
        return;
      }
      setJoinedName(result.name);
    } catch {
      setError("Could not save. Please check your internet and try again.");
    } finally {
      setSaving(false);
    }
  }

  if (joinedName) {
    return (
      <div className="rounded-lg bg-white p-6 text-center shadow-sm">
        <p className="text-xl font-semibold">Thank you, {joinedName}.</p>
        <p className="mt-2 text-base text-stone-600">You have joined the class.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-stone-700">
          Full name
        </label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="phone" className="text-sm font-medium text-stone-700">
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          inputMode="tel"
          autoComplete="tel"
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="city" className="text-sm font-medium text-stone-700">
          City
        </label>
        <input
          id="city"
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className={FIELD_CLASS}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-base text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-amber-700 px-4 py-4 text-lg font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Please wait…" : "Join"}
      </button>
    </form>
  );
}
