import { findCountry, type Country } from "./countries.ts";

/**
 * Turns what the user typed into E.164 form, for example "+61432807888".
 * Returns an empty string when the number cannot be read.
 */
export function toE164(rawLocal: string, countryCode: string): string {
  const country = findCountry(countryCode);
  if (!country) return "";

  let digits = rawLocal.replace(/\D/g, "");
  if (!digits) return "";

  digits = stripInternationalPrefix(digits, country);
  digits = digits.replace(/^0+/, "");
  if (!digits) return "";

  return `+${country.dialCode}${digits}`;
}

/**
 * People often paste a full number such as "0061432..." or "61432..." into a
 * box that only wants the local part. Remove the country code when what is
 * left is a plausible local number.
 */
function stripInternationalPrefix(digits: string, country: Country): string {
  const withoutZeros = digits.replace(/^00/, "");
  if (!withoutZeros.startsWith(country.dialCode)) {
    return digits.startsWith("00") ? withoutZeros : digits;
  }

  const rest = withoutZeros.slice(country.dialCode.length).replace(/^0+/, "");
  const fits = country.localDigits.includes(rest.length);
  return fits ? rest : digits.replace(/^00/, "");
}

/** True when the number has enough digits to be worth saving. */
export function looksLikeAPhoneNumber(e164: string): boolean {
  const digits = e164.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}
