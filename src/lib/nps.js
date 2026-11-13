// All NPS API calls live here so the components stay simple.
const API = "https://developer.nps.gov/api/v1";

// ⚠️ Because this runs in the BROWSER, this key ends up in the JS bundle
// and in every request URL. Open DevTools → Network and you'll see it.
// (The Astro version of this project fixes that. See 03-astro-nps-vue.)
const KEY = import.meta.env.VITE_NPS_API_KEY;

async function npsFetch(endpoint, params = {}) {
  if (!KEY)
    throw new Error(
      "Missing VITE_NPS_API_KEY. Copy .env.example to .env and restart npm run dev.",
    );
  const url = new URL(`${API}/${endpoint}`);
  url.search = new URLSearchParams({ api_key: KEY, ...params });
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`NPS API error: ${response.status} ${response.statusText}`);
  const json = await response.json();
  return json.data;
}

/** Keep only what our components need, and turn lat/long strings into numbers. */
export function slimPark(p) {
  return {
    parkCode: p.parkCode,
    fullName: p.fullName,
    designation: p.designation,
    states: p.states,
    url: p.url,
    latitude: Number(p.latitude),
    longitude: Number(p.longitude),
  };
}

// Simple in-memory cache: navigating between routes won't re-download ~470 parks.
let allParksPromise = null;

/** Every NPS site that has coordinates, slimmed down. */
export function getAllParks() {
  // Only start a download if one hasn't been started yet.
  // We save the *promise* (not the parks) so that if two components ask
  // at the same time, they both wait on the same single request.
  if (allParksPromise === null) {
    allParksPromise = fetchAllParks();
  }
  // Shorter version of the if statement above, using the ES2021
  // "nullish coalescing assignment" operator (assign only if null/undefined):
  //   allParksPromise ??= fetchAllParks()
  return allParksPromise;
}

async function fetchAllParks() {
  try {
    const parks = await npsFetch("parks", { limit: 500 });
    return parks.filter((p) => p.latitude && p.longitude).map(slimPark);
  } catch (err) {
    allParksPromise = null; // let the next call try again
    throw err;
  }
}

/** One park, with all the details (description, images, ...). */
export async function getPark(parkCode) {
  const [park] = await npsFetch("parks", { parkCode });
  if (!park) throw new Error(`No park found with code "${parkCode}"`);
  return park;
}
