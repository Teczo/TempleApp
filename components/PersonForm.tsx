"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CityBox from "./CityBox";
import RemovePerson from "./RemovePerson";
import { COUNTRIES, findCountry } from "@/lib/utils/countries";

const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:border-amber-700";

export interface PersonValues {
  id: string;
  name: string;
  phoneLocal: string;
  countryCode: string;
  city: string;
  cityId: string;
  backHref: string;
}

export default function PersonForm({ person }: { person: PersonValues }) {
  const router = useRouter();
  const [name, setName] = useState(person.name);
  const [countryCode, setCountryCode] = useState(person.countryCode);
  const [phone, setPhone] = useState(person.phoneLocal);
  const [city, setCity] = useState(person.city);
  const [cityId, setCityId] = useState(person.cityId);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const dialCode = findCountry(countryCode)?.dialCode ?? "";
  const busy = saving || removing;

  async function send(method: "PATCH" | "DELETE") {
    setError("");
    setSaved(false);
    const body =
      method === "PATCH"
        ? JSON.stringify({ name, countryCode, phone, city, cityId })
        : undefined;
    const response = await fetch(`/api/attendees/${person.id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result?.error ?? "Could not save that change. Please try again.");
      return false;
    }
    return true;
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      if (await send("PATCH")) {
        setSaved(true);
        router.refresh();
      }
    } catch {
      setError("Could not save. Please check your internet and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      if (await send("DELETE")) {
        router.push(person.backHref);
        router.refresh();
      }
    } catch {
      setError("Could not save. Please check your internet and try again.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="mt-5 space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-stone-700">
          Full name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="country" className="text-sm font-medium text-stone-700">
          Country
        </label>
        <select
          id="country"
          value={countryCode}
          onChange={(e) => {
            setCountryCode(e.target.value);
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
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="Local number"
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
      {saved && !error && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-base text-green-800">
          Saved.
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-amber-700 px-4 py-4 text-lg font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Please wait…" : "Save changes"}
      </button>

      <RemovePerson
        name={person.name}
        busy={busy}
        removing={removing}
        onRemove={handleRemove}
      />
    </form>
  );
}
