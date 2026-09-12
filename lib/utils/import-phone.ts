import { COUNTRIES } from "./countries.ts";

export interface CleanedPhone {
  /** E.164 form, for example "+61432807888". Empty when no rule fitted. */
  phone: string;
  /** Country the number belongs to, for example "AU". Empty when unknown. */
  countryCode: string;
}

/**
 * Cleans a phone number from the old spreadsheet.
 *
 * The first three rules come from the project contract, Section 6, Phase 4.
 * The rest cover shapes that appear in the real file: a number written with
 * its country code in front, or an Australian mobile written with a 0.
 */
export function cleanImportedPhone(raw: string): CleanedPhone {
  let digits = raw.replace(/\D/g, "");
  digits = digits.replace(/^00/, "");
  if (!digits) return { phone: "", countryCode: "" };

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

function withCountry(dialCode: string, local: string): CleanedPhone {
  const country = COUNTRIES.find((c) => c.dialCode === dialCode);
  return {
    phone: `+${dialCode}${local}`,
    countryCode: country ? country.code : "",
  };
}
