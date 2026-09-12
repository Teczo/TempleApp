"use client";

import { useState } from "react";
import CityBox from "./CityBox";
import { COUNTRIES, DEFAULT_COUNTRY_CODE, findCountry } from "@/lib/utils/countries";

const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:border-amber-700";

export default function JoinForm() {
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [cityId, setCityId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [joinedName, setJoinedName] = useState("");

  const dialCode = findCountry(countryCode)?.dialCode ?? "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, countryCode, phone, city, cityId }),
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
        <label htmlFor="country" className="text-sm font-medium text-stone-700">
          Country
        </label>
        <select
          id="country"
          name="country"
          value={countryCode}
          onChange={(e) => {
            setCountryCode(e.target.value);
            setCity("");
            setCityId("");
          }}
          className={FIELD_CLASS}
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="phone" className="text-sm font-medium text-stone-700">
          Phone number
        </label>
        <div className="mt-1 flex items-stretch">
          <span className="flex items-center rounded-l-lg border border-r-0 border-stone-300 bg-stone-100 px-3 text-base text-stone-700">
            +{dialCode}
          </span>
          <input
            id="phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="Your local number"
            className="w-full rounded-r-lg border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:border-amber-700"
          />
        </div>
      </div>

      <CityBox
        countryCode={countryCode}
        value={city}
        onChange={(typed, pickedId) => {
          setCity(typed);
          setCityId(pickedId);
        }}
      />

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
