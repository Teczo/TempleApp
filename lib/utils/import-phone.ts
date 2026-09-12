import { COUNTRIES, findCountry, type Country } from "./countries.ts";

export interface CleanedPhone {
  /** E.164 form, for example "+61432807888". Empty when no rule fitted. */
  phone: string;
  /** Country the number belongs to, for example "AU". Empty when unknown. */
  countryCode: string;
}

/**
 * Cleans a phone number from the old spreadsheet.
 *
 * `hintCountryCode` is the country worked out from the "City and Country"
 * column. It is tried first, because it settles numbers the plain rules read
 * wrongly. A Singapore number such as 6591851764 has ten digits and starts
 * with a 6, so the India rule below would otherwise claim it.
 *
 * The three plain rules come from the project contract, Section 6, Phase 4.
 * The rest cover shapes that appear in the real file: a number written with
 * its country code in front, or an Australian mobile written with a 0.
 */
export function cleanImportedPhone(
  raw: string,
  hintCountryCode = "",
): CleanedPhone {
  let digits = raw.replace(/\D/g, "");
  digits = digits.replace(/^00/, "");
  if (!digits) return { phone: "", countryCode: "" };

  const fromHint = useHint(digits, hintCountryCode);
  if (fromHint) return fromHint;

  // Contract rules.
  if (digits.length === 11 && digits.startsWith("61")) {
    return withCountry("61", digits.slice(2));
  }
  if (digits.length === 9 && digits.startsWith("4")) {
    return withCountry("61", digits);
  }
  if (digits.length === 10 && /^[6789]/.test(digits)) {
    return withCountry("91", digits);
  }

  // Extra shapes found in the file.
  if (digits.length === 12 && digits.startsWith("610")) {
    return withCountry("61", digits.slice(3));
  }
  if (digits.length === 10 && digits.startsWith("04")) {
    return withCountry("61", digits.slice(1));
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return withCountry("91", digits.slice(2));
  }
  if (digits.length === 11 && digits.startsWith("60")) {
    return withCountry("60", digits.slice(2));
  }

  return { phone: "", countryCode: "" };
}

/**
 * Uses the country from the location column, but only when the number really
 * starts with that country's dialling code and the rest is the right length.
 * Being strict stops it from chopping the front off a local number.
 */
function useHint(digits: string, hintCountryCode: string): CleanedPhone | null {
  const country = hintCountryCode ? findCountry(hintCountryCode) : undefined;
  if (!country || !digits.startsWith(country.dialCode)) return null;

  const rest = digits.slice(country.dialCode.length).replace(/^0+/, "");
  if (!fitsLocalLength(rest, country)) return null;

  return { phone: `+${country.dialCode}${rest}`, countryCode: country.code };
}

/** True when the local part is the right length for that country. */
function fitsLocalLength(local: string, country: Country): boolean {
  if (country.localDigits.length > 0) {
    return country.localDigits.includes(local.length);
  }
  return local.length >= 6 && local.length <= 12;
}

function withCountry(dialCode: string, local: string): CleanedPhone {
  const country = COUNTRIES.find((c) => c.dialCode === dialCode);
  return {
    phone: `+${dialCode}${local}`,
    countryCode: country ? country.code : "",
  };
}
