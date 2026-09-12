/** The starting locations from the project contract, Section 4. */
export interface CitySeed {
  name: string;
  region: string;
  country: string;
  countryCode: string;
}

export const CITY_SEEDS: CitySeed[] = [
  { name: "Perth", region: "WA", country: "Australia", countryCode: "AU" },
  { name: "Melbourne", region: "VIC", country: "Australia", countryCode: "AU" },
  { name: "Sydney", region: "NSW", country: "Australia", countryCode: "AU" },
  { name: "Brisbane", region: "QLD", country: "Australia", countryCode: "AU" },
  { name: "Canberra", region: "ACT", country: "Australia", countryCode: "AU" },
  { name: "Adelaide", region: "SA", country: "Australia", countryCode: "AU" },

  { name: "Chennai", region: "Tamil Nadu", country: "India", countryCode: "IN" },
  { name: "Coimbatore", region: "Tamil Nadu", country: "India", countryCode: "IN" },
  { name: "Madurai", region: "Tamil Nadu", country: "India", countryCode: "IN" },
  { name: "Salem", region: "Tamil Nadu", country: "India", countryCode: "IN" },
  { name: "Puducherry", region: "Puducherry", country: "India", countryCode: "IN" },
  { name: "Bengaluru", region: "Karnataka", country: "India", countryCode: "IN" },

  { name: "Kuala Lumpur", region: "", country: "Malaysia", countryCode: "MY" },
  { name: "Penang", region: "", country: "Malaysia", countryCode: "MY" },
  { name: "Johor Bahru", region: "", country: "Malaysia", countryCode: "MY" },

  { name: "Singapore", region: "", country: "Singapore", countryCode: "SG" },
];
