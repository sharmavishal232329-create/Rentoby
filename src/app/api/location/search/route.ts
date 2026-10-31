import { NextResponse } from 'next/server';
import { searchIndianLocations, IndianLocation } from '@/lib/location/indianLocationsData';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // 1. First, search high-speed indexed dataset
    const localMatches = searchIndianLocations(query, limit);

    // 2. If query is specific and local matches are few, augment with OpenStreetMap Nominatim (India-specific)
    if (query.trim().length >= 3 && localMatches.length < 5) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query
          )}&countrycodes=in&format=json&addressdetails=1&limit=6`,
          {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Rentoby-Hyperlocal-Marketplace/1.0 (support@rentoby.com)',
              'Accept-Language': 'en-IN,en;q=0.9',
            },
          }
        );
        clearTimeout(timeout);

        if (res.ok) {
          const externalResults = await res.json();
          const mappedExternal: IndianLocation[] = externalResults
            .filter((item: any) => item.lat && item.lon)
            .map((item: any) => {
              const addr = item.address || {};
              const city =
                addr.city ||
                addr.town ||
                addr.village ||
                addr.municipality ||
                addr.county ||
                addr.state_district ||
                '';
              const district = addr.state_district || addr.county || city;
              const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.road || '';
              const state = addr.state || '';
              const pincode = addr.postcode || '';

              const displayName = [locality, city, state].filter(Boolean).join(', ') || item.display_name.split(',').slice(0, 3).join(',');

              return {
                name: displayName,
                locality: locality || undefined,
                city: city || locality || 'Local Area',
                district: district || city,
                state: state || 'India',
                pincode: pincode || undefined,
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
                type: (addr.city ? 'CITY' : addr.suburb ? 'LOCALITY' : 'TOWN') as 'CITY' | 'LOCALITY' | 'TOWN',
              };
            });

          // Merge local and external deduplicated by city & locality
          const seen = new Set<string>(
            localMatches.map((l) => `${l.city.toLowerCase()}-${(l.locality || '').toLowerCase()}-${l.pincode || ''}`)
          );

          const combined = [...localMatches];
          for (const ext of mappedExternal) {
            const key = `${ext.city.toLowerCase()}-${(ext.locality || '').toLowerCase()}-${ext.pincode || ''}`;
            if (!seen.has(key)) {
              seen.add(key);
              combined.push(ext);
            }
          }

          return NextResponse.json({ locations: combined.slice(0, limit) });
        }
      } catch (extError) {
        // Fallback to local matches safely if external geocoding times out
      }
    }

    return NextResponse.json({ locations: localMatches });
  } catch (error: any) {
    console.error('Location search API error:', error);
    return NextResponse.json({ error: 'Failed to search locations' }, { status: 500 });
  }
}
