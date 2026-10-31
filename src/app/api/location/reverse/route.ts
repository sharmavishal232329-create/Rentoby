import { NextResponse } from 'next/server';
import { findNearestLocation, IndianLocation } from '@/lib/location/indianLocationsData';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    if (!latStr || !lngStr) {
      return NextResponse.json({ error: 'Latitude and Longitude are required' }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'Invalid coordinate numbers' }, { status: 400 });
    }

    // Try reverse geocoding via Nominatim first
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
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
        const data = await res.json();
        const addr = data.address || {};

        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          addr.county ||
          addr.state_district ||
          '';
        const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.road || '';
        const district = addr.state_district || addr.county || city || '';
        const state = addr.state || '';
        const pincode = addr.postcode || '';

        const resolvedLocation: IndianLocation = {
          name: [locality, city, state].filter(Boolean).join(', ') || data.display_name.split(',').slice(0, 3).join(','),
          locality: locality || undefined,
          city: city || locality || 'Local Area',
          district: district || city,
          state: state || 'India',
          pincode: pincode || undefined,
          latitude: lat,
          longitude: lng,
          type: (addr.city ? 'CITY' : addr.suburb ? 'LOCALITY' : 'TOWN') as 'CITY' | 'LOCALITY' | 'TOWN',
        };

        return NextResponse.json({ location: resolvedLocation });
      }
    } catch (reverseError) {
      // Fallback below
    }

    // Fallback: Find closest known Indian city/town/locality from pre-indexed dataset
    const nearest = findNearestLocation(lat, lng);
    return NextResponse.json({
      location: {
        ...nearest,
        latitude: lat,
        longitude: lng,
      },
    });
  } catch (error: any) {
    console.error('Reverse geocode error:', error);
    return NextResponse.json({ error: 'Failed to reverse geocode location' }, { status: 500 });
  }
}
