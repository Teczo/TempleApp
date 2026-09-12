import { COUNTRY_TABLE, PINNED_COUNTRY_CODES } from "./country-data.ts";

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  /** How many digits the local part normally has. Used to spot a pasted
   *  number that already includes the dialling code. Empty when unknown. */
  localDigits: number[];
}

/** Australia and India first. Then the rest in name order. */
export const COUNTRIES: Country[] = buildList();

/** The few countries almost everybody picks. Shown first in the dropdown. */
export const COMMON_COUNTRIES: Country[] = COUNTRIES.filter((c) =>
  PINNED_COUNTRY_CODES.includes(c.code),
);

/** Everybody else, in name order. */
export const OTHER_COUNTRIES: Country[] = COUNTRIES.filter(
  (c) => !PINNED_COUNTRY_CODES.includes(c.code),
);

export const DEFAULT_COUNTRY_CODE = "AU";

export function findCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code.trim().toUpperCase());
}

export function findCountryByName(name: string): Country | undefined {
  const wanted = name.trim().toLowerCase();
  return COUNTRIES.find((c) => c.name.toLowerCase() === wanted);
}

function buildList(): Country[] {
  const all = COUNTRY_TABLE.map(readEntry).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const pinned = PINNED_COUNTRY_CODES.map((code) =>
    all.find((c) => c.code === code),
  ).filter((c): c is Country => Boolean(c));

  const rest = all.filter((c) => !PINNED_COUNTRY_CODES.includes(c.code));
  return [...pinned, ...rest];
}

function readEntry(entry: string): Country {
  const [code, name, dialCode, digits] = entry.split("|");
  return {
    code,
    name,
    dialCode,
    localDigits: digits ? digits.split(",").map(Number) : [],
  };
}
