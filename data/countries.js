// data/countries.js
// Master file combining all country parts and compatible with regions.js

import { COUNTRIES_PART1 } from "./countries1";
import { COUNTRIES_PART2 } from "./countries2";
import { COUNTRIES_PART3 } from "./countries3";
import { COUNTRIES_PART4 } from "./countries4";
import { COUNTRIES_PART5 } from "./countries5";
import { REGIONS } from "./regions"; // regions.js contains subdivisions for US, CA, AU, etc.

// Combine all country parts into a single array
export const COUNTRY_CODES = [
  ...COUNTRIES_PART1,
  ...COUNTRIES_PART2,
  ...COUNTRIES_PART3,
  ...COUNTRIES_PART4,
  ...COUNTRIES_PART5
].map(country => {
  // Attach regions if available in regions.js
  const countryRegions = REGIONS[country.code];
  return countryRegions
    ? { ...country, regions: countryRegions }
    : country;
});

// Export just code + name for dropdowns
export const COUNTRIES = COUNTRY_CODES.map(({ code, name }) => ({ code, name }));

// Export US regions separately if needed
export const US_STATES = COUNTRY_CODES.find(c => c.code === "US")?.regions || [];
