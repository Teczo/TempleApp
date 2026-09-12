import { COUNTRIES } from "./countries.ts";

/**
 * Spelling variants from the old spreadsheet, listed in the project
 * contract, Section 6, Phase 4. The key is the text after cleaning:
 * lower case, dots and commas turned into spaces, spaces squeezed.
 */
const VARIANTS: Record<string, string> = {
  "perth wa australia": "Perth",
  "perth wa": "Perth",
  "perth western australia": "Perth",
  "melbourne vic australia": "Melbourne",
  "melbourne australia": "Melbourne",
  "mlebourne australia": "Melbourne",
  "victoria australia": "Melbourne",
  "sydney nsw australia": "Sydney",
  "sydney australia": "Sydney",
  "chennai india": "Chennai",
  "chennai tamil nadu india": "Chennai",
  "coimbatore india": "Coimbatore",
  "madurai india": "Madurai",
  "salem india": "Salem",
  "puducherry india": "Puducherry",
};

export interface KnownCity {
  name: string;
  countryCode: string;
}

export interface CityMatch {
  /** Name of the known location, or empty when nothing matched. */
  name: string;
  /** Country worked out from the text, for example "AU". May be empty. */
  countryCode: string;
}

/** Lower case, punctuation removed, spaces squeezed. */
export function normaliseCityText(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[.,/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Works out which known location a typed line means. Tries the variant list
 * first, then the first word or words of the line, for lines such as
 * "Brisbane, QLD, Australia" that follow the usual shape.
 */
export function matchCity(raw: string, known: KnownCity[]): CityMatch {
  const cleaned = normaliseCityText(raw);
  if (!cleaned) return { name: "", countryCode: "" };

  const country = countryFromText(cleaned);

  const variant = VARIANTS[cleaned];
  if (variant) {
    const city = known.find((c) => c.name.toLowerCase() === variant.toLowerCase());
    if (city) return { name: city.name, countryCode: city.countryCode };
  }

  const firstPart = cleaned.split(" ")[0];
  const direct = known.find(
    (c) =>
      c.name.toLowerCase() === cleaned ||
      c.name.toLowerCase() === firstPart ||
      cleaned.startsWith(`${c.name.toLowerCase()} `),
  );
  if (direct) return { name: direct.name, countryCode: direct.countryCode };

  return { name: "", countryCode: country };
}

/**
 * Finds a country name inside the typed line, for example "Malaysia".
 * It matches whole words only. Without that, a short country name could be
 * found inside a longer word and give the wrong answer.
 */
export function countryFromText(cleanedText: string): string {
  const match = COUNTRIES.find((c) => hasWholeWords(cleanedText, c.name.toLowerCase()));
  return match ? match.code : "";
}

function hasWholeWords(text: string, phrase: string): boolean {
  const pattern = new RegExp(`(^|\\s)${escapeForRegex(phrase)}($|\\s)`);
  return pattern.test(text);
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
