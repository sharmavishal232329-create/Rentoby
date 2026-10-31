'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface LocationState {
  name?: string;
  city: string;
  localArea: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  radiusKm?: number; // Distance filter in km (e.g. 1, 3, 5, 10, 25, or undefined for all)
  isCustom: boolean;
}

interface LocationContextType {
  location: LocationState;
  recentLocations: LocationState[];
  setLocation: (city: string, localArea?: string, lat?: number, lng?: number) => void;
  selectLocation: (loc: Partial<LocationState> & { city: string }) => void;
  setRadiusKm: (radius: number | undefined) => void;
  detectCurrentLocation: () => Promise<{ success: boolean; location?: LocationState; error?: string }>;
  availableCities: string[];
}

const DEFAULT_LOCATION: LocationState = {
  name: 'Bengaluru, Karnataka',
  city: 'Bengaluru',
  localArea: 'All Bengaluru',
  district: 'Bengaluru Urban',
  state: 'Karnataka',
  pincode: '560001',
  latitude: 12.9716,
  longitude: 77.5946,
  isCustom: false,
};

const POPULAR_CITY_COORDINATES: Record<string, { lat: number; lng: number; state: string; district: string }> = {
  Gorakhpur: { lat: 26.7606, lng: 83.3732, state: 'Uttar Pradesh', district: 'Gorakhpur' },
  Lucknow: { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh', district: 'Lucknow' },
  Deoria: { lat: 26.5024, lng: 83.7791, state: 'Uttar Pradesh', district: 'Deoria' },
  Bengaluru: { lat: 12.9716, lng: 77.5946, state: 'Karnataka', district: 'Bengaluru Urban' },
  'Delhi-NCR': { lat: 28.6139, lng: 77.2090, state: 'Delhi', district: 'New Delhi' },
  Mumbai: { lat: 19.0760, lng: 72.8777, state: 'Maharashtra', district: 'Mumbai' },
  Patna: { lat: 25.5941, lng: 85.1376, state: 'Bihar', district: 'Patna' },
  Hyderabad: { lat: 17.3850, lng: 78.4867, state: 'Telangana', district: 'Hyderabad' },
  Pune: { lat: 18.5204, lng: 73.8567, state: 'Maharashtra', district: 'Pune' },
  Varanasi: { lat: 25.3176, lng: 82.9739, state: 'Uttar Pradesh', district: 'Varanasi' },
  Kolkata: { lat: 22.5726, lng: 88.3639, state: 'West Bengal', district: 'Kolkata' },
  Chennai: { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu', district: 'Chennai' },
  Ahmedabad: { lat: 23.0225, lng: 72.5714, state: 'Gujarat', district: 'Ahmedabad' },
  Chandigarh: { lat: 30.7333, lng: 76.7794, state: 'Chandigarh', district: 'Chandigarh' },
  Jaipur: { lat: 26.9124, lng: 75.7873, state: 'Rajasthan', district: 'Jaipur' },
  Bhopal: { lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh', district: 'Bhopal' },
  Indore: { lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh', district: 'Indore' },
  Ranchi: { lat: 23.3441, lng: 85.3096, state: 'Jharkhand', district: 'Ranchi' },
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<LocationState>(DEFAULT_LOCATION);
  const [recentLocations, setRecentLocations] = useState<LocationState[]>([]);

  useEffect(() => {
    // Load persisted location if available
    const saved = localStorage.getItem('rentoby_user_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.city && parsed.latitude && parsed.longitude) {
          setLocationState(parsed);
        }
      } catch (e) {
        // Fallback
      }
    }

    // Load recent locations
    const savedRecents = localStorage.getItem('rentoby_recent_locations');
    if (savedRecents) {
      try {
        const parsed = JSON.parse(savedRecents);
        if (Array.isArray(parsed)) {
          setRecentLocations(parsed.slice(0, 5));
        }
      } catch (e) {
        // Fallback
      }
    }
  }, []);

  const saveToRecents = (newLoc: LocationState) => {
    setRecentLocations((prev) => {
      const filtered = prev.filter(
        (l) => l.city.toLowerCase() !== newLoc.city.toLowerCase() || (l.localArea || '').toLowerCase() !== (newLoc.localArea || '').toLowerCase()
      );
      const updated = [newLoc, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('rentoby_recent_locations', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const selectLocation = (loc: Partial<LocationState> & { city: string }) => {
    const fallback = POPULAR_CITY_COORDINATES[loc.city] || { lat: 12.9716, lng: 77.5946, state: 'India', district: loc.city };
    const newLoc: LocationState = {
      name: loc.name || `${loc.localArea ? `${loc.localArea}, ` : ''}${loc.city}`,
      city: loc.city,
      localArea: loc.localArea || `All ${loc.city}`,
      district: loc.district || fallback.district,
      state: loc.state || fallback.state,
      pincode: loc.pincode,
      latitude: loc.latitude || fallback.lat,
      longitude: loc.longitude || fallback.lng,
      radiusKm: loc.radiusKm !== undefined ? loc.radiusKm : location.radiusKm,
      isCustom: true,
    };

    setLocationState(newLoc);
    try {
      localStorage.setItem('rentoby_user_location', JSON.stringify(newLoc));
    } catch (e) {}
    saveToRecents(newLoc);
  };

  const setLocation = (city: string, localArea?: string, lat?: number, lng?: number) => {
    selectLocation({
      city,
      localArea: localArea || `All ${city}`,
      latitude: lat,
      longitude: lng,
    });
  };

  const setRadiusKm = (radius: number | undefined) => {
    setLocationState((prev) => {
      const updated = { ...prev, radiusKm: radius };
      try {
        localStorage.setItem('rentoby_user_location', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const detectCurrentLocation = async (): Promise<{ success: boolean; location?: LocationState; error?: string }> => {
    if (!navigator.geolocation) {
      return { success: false, error: 'Geolocation is not supported by your browser.' };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            // Call our reverse geocoding API
            const res = await fetch(`/api/location/reverse?lat=${lat}&lng=${lng}`);
            if (res.ok) {
              const data = await res.json();
              if (data.location) {
                const detectedLoc: LocationState = {
                  name: data.location.name,
                  city: data.location.city,
                  localArea: data.location.locality || `Near ${data.location.city}`,
                  district: data.location.district,
                  state: data.location.state,
                  pincode: data.location.pincode,
                  latitude: lat,
                  longitude: lng,
                  radiusKm: location.radiusKm || 10,
                  isCustom: true,
                };
                setLocationState(detectedLoc);
                try {
                  localStorage.setItem('rentoby_user_location', JSON.stringify(detectedLoc));
                } catch (e) {}
                saveToRecents(detectedLoc);
                return resolve({ success: true, location: detectedLoc });
              }
            }
          } catch (e) {
            // Fallback to basic location below
          }

          // Fallback if reverse geocode fails
          const fallbackLoc: LocationState = {
            name: 'Current Device Location',
            city: 'Near You',
            localArea: 'Nearby GPS Coordinates',
            latitude: lat,
            longitude: lng,
            radiusKm: 10,
            isCustom: true,
          };
          setLocationState(fallbackLoc);
          resolve({ success: true, location: fallbackLoc });
        },
        (geoError) => {
          let msg = 'Failed to retrieve location.';
          if (geoError.code === geoError.PERMISSION_DENIED) {
            msg = 'Location permission was denied. Please allow location access in your browser or search your city.';
          } else if (geoError.code === geoError.TIMEOUT) {
            msg = 'Location request timed out. Please try again or select manually.';
          }
          resolve({ success: false, error: msg });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        recentLocations,
        setLocation,
        selectLocation,
        setRadiusKm,
        detectCurrentLocation,
        availableCities: Object.keys(POPULAR_CITY_COORDINATES),
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
