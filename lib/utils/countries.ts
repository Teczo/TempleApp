export interface Country {
  code: string;
  name: string;
  dialCode: string;
  /** How many digits the local part normally has. Used to spot a pasted
   *  number that already includes the dialling code. */
  localDigits: number[];
}

/** Australia and India first. Most attendees are in those two. */
export const COUNTRIES: Country[] = [
  { code: "AU", name: "Australia", dialCode: "61", localDigits: [9] },
  { code: "IN", name: "India", dialCode: "91", localDigits: [10] },
  { code: "MY", name: "Malaysia", dialCode: "60", localDigits: [9, 10] },
  { code: "SG", name: "Singapore", dialCode: "65", localDigits: [8] },
  { code: "GB", name: "United Kingdom", dialCode: "44", localDigits: [10] },
  { code: "US", name: "United States", dialCode: "1", localDigits: [10] },
  { code: "CA", name: "Canada", dialCode: "1", localDigits: [10] },
  { code: "NZ", name: "New Zealand", dialCode: "64", localDigits: [8, 9] },
  { code: "AE", name: "United Arab Emirates", dialCode: "971", localDigits: [9] },
  { code: "LK", name: "Sri Lanka", dialCode: "94", localDigits: [9] },
];

export const DEFAULT_COUNTRY_CODE = "AU";

export function findCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code.trim().toUpperCase());
}
