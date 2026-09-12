"use client";

import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";

export interface CityOption {
  id: string;
  name: string;
  region: string;
}

interface Props {
  countryCode: string;
  value: string;
  onChange: (typed: string, pickedId: string) => void;
}

const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-base outline-none focus:border-amber-700";

export default function CityBox({ countryCode, value, onChange }: Props) {
  const [options, setOptions] = useState<CityOption[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`/api/cities?country=${countryCode}`);
        const result = await response.json();
        if (!cancelled) setOptions(result.cities ?? []);
      } catch {
        if (!cancelled) setOptions([]);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // A low threshold still forgives typing mistakes such as "perht".
  const fuse = useMemo(
    () => new Fuse(options, { keys: ["name"], threshold: 0.45, ignoreLocation: true }),
    [options],
  );

  const suggestions = useMemo(() => {
    const typed = value.trim();
    if (!typed) return options.slice(0, 8);
    return fuse.search(typed, { limit: 8 }).map((hit) => hit.item);
  }, [value, options, fuse]);

  return (
    <div ref={boxRef} className="relative">
      <label htmlFor="city" className="text-sm font-medium text-stone-700">
        City
      </label>
      <input
        id="city"
        name="city"
        value={value}
        onChange={(e) => {
          onChange(e.target.value, "");
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        required
        autoComplete="off"
        className={FIELD_CLASS}
      />

      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-stone-300 bg-white shadow-lg">
          {suggestions.map((city) => (
            <li key={city.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(city.name, city.id);
                  setOpen(false);
                }}
                className="block w-full px-3 py-3 text-left text-base hover:bg-amber-50"
              >
                {city.name}
                {city.region && (
                  <span className="ml-2 text-sm text-stone-500">{city.region}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
