import type { HalifaxNeighborhood } from '../types';

export interface AddressSuggestion {
  id: string;
  streetAddress: string;
  fullAddress: string;
  neighborhood?: HalifaxNeighborhood;
  city: string;
  postalCode?: string;
  lat?: number;
  lon?: number;
}

// Popular HRM Streets and their primary neighborhood mapping for instant 0ms suggestions
const POPULAR_HALIFAX_STREETS: Array<{ street: string; neighborhood: HalifaxNeighborhood; city: string; postalCodePrefix: string }> = [
  // South End (Dalhousie / SMU student corridor)
  { street: 'Robie Street', neighborhood: 'South End', city: 'Halifax', postalCodePrefix: 'B3H' },
  { street: 'Inglis Street', neighborhood: 'South End', city: 'Halifax', postalCodePrefix: 'B3H' },
  { street: 'South Street', neighborhood: 'South End', city: 'Halifax', postalCodePrefix: 'B3H' },
  { street: 'Coburg Road', neighborhood: 'South End', city: 'Halifax', postalCodePrefix: 'B3H' },
  { street: 'Morris Street', neighborhood: 'South End', city: 'Halifax', postalCodePrefix: 'B3J' },
  { street: 'South Park Street', neighborhood: 'South End', city: 'Halifax', postalCodePrefix: 'B3J' },
  { street: 'Tower Road', neighborhood: 'South End', city: 'Halifax', postalCodePrefix: 'B3H' },
  { street: 'Wellington Street', neighborhood: 'South End', city: 'Halifax', postalCodePrefix: 'B3H' },
  { street: 'University Avenue', neighborhood: 'South End', city: 'Halifax', postalCodePrefix: 'B3H' },
  { street: 'Barrington Street', neighborhood: 'South End', city: 'Halifax', postalCodePrefix: 'B3H' },
  { street: 'Fenwick Street', neighborhood: 'South End', city: 'Halifax', postalCodePrefix: 'B3H' },
  { street: 'College Street', neighborhood: 'South End', city: 'Halifax', postalCodePrefix: 'B3H' },
  { street: 'Spring Garden Road', neighborhood: 'South End', city: 'Halifax', postalCodePrefix: 'B3J' },

  // Downtown Halifax
  { street: 'Hollis Street', neighborhood: 'Downtown Halifax', city: 'Halifax', postalCodePrefix: 'B3J' },
  { street: 'Lower Water Street', neighborhood: 'Downtown Halifax', city: 'Halifax', postalCodePrefix: 'B3J' },
  { street: 'Upper Water Street', neighborhood: 'Downtown Halifax', city: 'Halifax', postalCodePrefix: 'B3J' },
  { street: 'Granville Street', neighborhood: 'Downtown Halifax', city: 'Halifax', postalCodePrefix: 'B3J' },
  { street: 'Sackville Street', neighborhood: 'Downtown Halifax', city: 'Halifax', postalCodePrefix: 'B3J' },
  { street: 'Duke Street', neighborhood: 'Downtown Halifax', city: 'Halifax', postalCodePrefix: 'B3J' },
  { street: 'Salter Street', neighborhood: 'Downtown Halifax', city: 'Halifax', postalCodePrefix: 'B3J' },
  { street: 'Prince Street', neighborhood: 'Downtown Halifax', city: 'Halifax', postalCodePrefix: 'B3J' },
  { street: 'George Street', neighborhood: 'Downtown Halifax', city: 'Halifax', postalCodePrefix: 'B3J' },
  { street: 'Brunswick Street', neighborhood: 'Downtown Halifax', city: 'Halifax', postalCodePrefix: 'B3K' },

  // North End (Trendy arts / dining district)
  { street: 'Agricola Street', neighborhood: 'North End', city: 'Halifax', postalCodePrefix: 'B3K' },
  { street: 'Gottingen Street', neighborhood: 'North End', city: 'Halifax', postalCodePrefix: 'B3K' },
  { street: 'Isleville Street', neighborhood: 'North End', city: 'Halifax', postalCodePrefix: 'B3K' },
  { street: 'Novalea Drive', neighborhood: 'North End', city: 'Halifax', postalCodePrefix: 'B3K' },
  { street: 'Young Street', neighborhood: 'North End', city: 'Halifax', postalCodePrefix: 'B3K' },
  { street: 'Almon Street', neighborhood: 'North End', city: 'Halifax', postalCodePrefix: 'B3K' },
  { street: 'North Street', neighborhood: 'North End', city: 'Halifax', postalCodePrefix: 'B3K' },
  { street: 'Lady Hammond Road', neighborhood: 'North End', city: 'Halifax', postalCodePrefix: 'B3K' },
  { street: 'Duffus Street', neighborhood: 'North End', city: 'Halifax', postalCodePrefix: 'B3K' },
  { street: 'Cunard Street', neighborhood: 'North End', city: 'Halifax', postalCodePrefix: 'B3K' },
  { street: 'Maynard Street', neighborhood: 'North End', city: 'Halifax', postalCodePrefix: 'B3K' },

  // West End / Quinpool
  { street: 'Quinpool Road', neighborhood: 'West End / Quinpool', city: 'Halifax', postalCodePrefix: 'B3L' },
  { street: 'Chebucto Road', neighborhood: 'West End / Quinpool', city: 'Halifax', postalCodePrefix: 'B3L' },
  { street: 'Oxford Street', neighborhood: 'West End / Quinpool', city: 'Halifax', postalCodePrefix: 'B3L' },
  { street: 'Connaught Avenue', neighborhood: 'West End / Quinpool', city: 'Halifax', postalCodePrefix: 'B3L' },
  { street: 'Windsor Street', neighborhood: 'West End / Quinpool', city: 'Halifax', postalCodePrefix: 'B3K' },
  { street: 'Bayers Road', neighborhood: 'West End / Quinpool', city: 'Halifax', postalCodePrefix: 'B3L' },
  { street: 'Mumford Road', neighborhood: 'West End / Quinpool', city: 'Halifax', postalCodePrefix: 'B3L' },

  // Clayton Park (MSVU corridor)
  { street: 'Lacewood Drive', neighborhood: 'Clayton Park', city: 'Halifax', postalCodePrefix: 'B3S' },
  { street: 'Dunbrack Street', neighborhood: 'Clayton Park', city: 'Halifax', postalCodePrefix: 'B3M' },
  { street: 'Parkland Drive', neighborhood: 'Clayton Park', city: 'Halifax', postalCodePrefix: 'B3S' },
  { street: 'Willett Street', neighborhood: 'Clayton Park', city: 'Halifax', postalCodePrefix: 'B3M' },
  { street: 'Regency Park Drive', neighborhood: 'Clayton Park', city: 'Halifax', postalCodePrefix: 'B3S' },
  { street: 'Farnham Gate Road', neighborhood: 'Clayton Park', city: 'Halifax', postalCodePrefix: 'B3M' },

  // Bedford
  { street: 'Bedford Highway', neighborhood: 'Bedford', city: 'Bedford', postalCodePrefix: 'B4A' },
  { street: 'Larry Uteck Boulevard', neighborhood: 'Bedford', city: 'Halifax', postalCodePrefix: 'B3M' },
  { street: 'Meadowbrook Drive', neighborhood: 'Bedford', city: 'Bedford', postalCodePrefix: 'B4A' },
  { street: 'Southgate Drive', neighborhood: 'Bedford', city: 'Bedford', postalCodePrefix: 'B4A' },
  { street: 'Gary Martin Drive', neighborhood: 'Bedford', city: 'Bedford', postalCodePrefix: 'B4B' },

  // Fairview
  { street: 'Dutch Village Road', neighborhood: 'Fairview', city: 'Halifax', postalCodePrefix: 'B3N' },
  { street: 'Titus Street', neighborhood: 'Fairview', city: 'Halifax', postalCodePrefix: 'B3N' },
  { street: 'Alma Crescent', neighborhood: 'Fairview', city: 'Halifax', postalCodePrefix: 'B3N' },
  { street: 'Main Avenue', neighborhood: 'Fairview', city: 'Halifax', postalCodePrefix: 'B3N' },

  // Downtown Dartmouth (Ferry Terminal / King's Wharf)
  { street: 'Portland Street', neighborhood: 'Downtown Dartmouth', city: 'Dartmouth', postalCodePrefix: 'B2Y' },
  { street: 'Alderney Drive', neighborhood: 'Downtown Dartmouth', city: 'Dartmouth', postalCodePrefix: 'B2Y' },
  { street: 'Ochterloney Street', neighborhood: 'Downtown Dartmouth', city: 'Dartmouth', postalCodePrefix: 'B2Y' },
  { street: 'Queen Street', neighborhood: 'Downtown Dartmouth', city: 'Dartmouth', postalCodePrefix: 'B2Y' },
  { street: 'King Street', neighborhood: 'Downtown Dartmouth', city: 'Dartmouth', postalCodePrefix: 'B2Y' },

  // North Dartmouth (NSCC Akerley corridor)
  { street: 'Wyse Road', neighborhood: 'North Dartmouth', city: 'Dartmouth', postalCodePrefix: 'B3A' },
  { street: 'Windmill Road', neighborhood: 'North Dartmouth', city: 'Dartmouth', postalCodePrefix: 'B3A' },
  { street: 'Victoria Road', neighborhood: 'North Dartmouth', city: 'Dartmouth', postalCodePrefix: 'B3A' },
  { street: 'Highfield Park Drive', neighborhood: 'North Dartmouth', city: 'Dartmouth', postalCodePrefix: 'B3A' },
  { street: 'Woodland Avenue', neighborhood: 'North Dartmouth', city: 'Dartmouth', postalCodePrefix: 'B3A' }
];

/**
 * Detects the closest Halifax neighborhood based on street name, suburb, or district.
 */
export const detectHalifaxNeighborhood = (text: string): HalifaxNeighborhood | undefined => {
  const lower = text.toLowerCase();

  if (lower.includes('south end') || lower.includes('dalhousie') || lower.includes('saint mary')) return 'South End';
  if (lower.includes('north end') || lower.includes('hydrostone')) return 'North End';
  if (lower.includes('downtown halifax') || lower.includes('waterfront') || lower.includes('scotia square')) return 'Downtown Halifax';
  if (lower.includes('quinpool') || lower.includes('west end') || lower.includes('chebucto') || lower.includes('connaught')) return 'West End / Quinpool';
  if (lower.includes('clayton park') || lower.includes('lacewood') || lower.includes('mount saint vincent')) return 'Clayton Park';
  if (lower.includes('bedford') || lower.includes('larry uteck')) return 'Bedford';
  if (lower.includes('fairview') || lower.includes('dutch village')) return 'Fairview';
  if (lower.includes('downtown dartmouth') || lower.includes('alderney') || lower.includes('ochterloney') || lower.includes('kings wharf')) return 'Downtown Dartmouth';
  if (lower.includes('north dartmouth') || lower.includes('highfield') || lower.includes('wyse') || lower.includes('akerley')) return 'North Dartmouth';

  // Check known streets
  for (const item of POPULAR_HALIFAX_STREETS) {
    if (lower.includes(item.street.toLowerCase())) {
      return item.neighborhood;
    }
  }

  // City-level fallback
  if (lower.includes('dartmouth')) return 'Downtown Dartmouth';
  if (lower.includes('bedford')) return 'Bedford';

  return undefined;
};

/**
 * Fetches real-time Halifax address suggestions with 0ms instant local cache + OpenStreetMap Nominatim.
 */
export const searchHalifaxAddresses = async (query: string): Promise<AddressSuggestion[]> => {
  const clean = query.trim();
  if (!clean || clean.length < 2) return [];

  const results: AddressSuggestion[] = [];
  const lowerQuery = clean.toLowerCase();

  // 1. Instant local street match (handles "1459 Robie" or just "Robie")
  const numberMatch = clean.match(/^(\d+)\s+(.*)/);
  const houseNumber = numberMatch ? numberMatch[1] : '';
  const searchPart = numberMatch ? numberMatch[2].toLowerCase() : lowerQuery;

  const matchedLocal = POPULAR_HALIFAX_STREETS.filter(s =>
    s.street.toLowerCase().includes(searchPart) ||
    s.neighborhood.toLowerCase().includes(searchPart)
  ).slice(0, 3);

  for (const loc of matchedLocal) {
    const streetAddress = houseNumber ? `${houseNumber} ${loc.street}` : loc.street;
    results.push({
      id: `local-${streetAddress}-${loc.neighborhood}`,
      streetAddress,
      fullAddress: `${streetAddress}, ${loc.city}, NS, Canada`,
      neighborhood: loc.neighborhood,
      city: loc.city,
      postalCode: `${loc.postalCodePrefix} 1A1`
    });
  }

  // 2. Fetch live geocoded results from OpenStreetMap Nominatim with Halifax bounding box
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800); // Fast 1.8s timeout

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      clean + ', Halifax, NS'
    )}&addressdetails=1&countrycodes=ca&limit=5`;

    const res = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'HfxRentals/1.0 (housing-app-address-autofill)'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const addr = item.address || {};
          const road = addr.road || addr.pedestrian || item.name || clean;
          const houseNo = addr.house_number || houseNumber || '';
          const streetAddress = houseNo ? `${houseNo} ${road}` : road;
          const city = addr.city || addr.town || addr.municipality || 'Halifax';
          const postcode = addr.postcode || '';

          // Determine neighborhood
          const detectedNeigh =
            detectHalifaxNeighborhood(addr.suburb || '') ||
            detectHalifaxNeighborhood(item.display_name || '') ||
            detectHalifaxNeighborhood(road);

          const fullAddress = `${streetAddress}, ${city}, NS ${postcode}`.trim();

          // Avoid duplicates
          if (!results.some(r => r.streetAddress.toLowerCase() === streetAddress.toLowerCase())) {
            results.push({
              id: `osm-${item.place_id || Math.random()}`,
              streetAddress,
              fullAddress,
              neighborhood: detectedNeigh,
              city,
              postalCode: postcode,
              lat: item.lat ? parseFloat(item.lat) : undefined,
              lon: item.lon ? parseFloat(item.lon) : undefined
            });
          }
        }
      }
    }
  } catch {
    // Gracefully ignore network / abort errors and return local matches
  }

  return results.slice(0, 5);
};
