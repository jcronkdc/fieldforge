/**
 * Location Service for FieldForge
 * Integrates with Google Places API for location autocomplete and tracking
 */

interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

interface PlaceResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  location?: Location;
  types?: string[];
}

interface SubstationLocation {
  id: string;
  name: string;
  voltageClass: string;
  location: Location;
  owner: string;
  type: 'substation' | 'switchyard' | 'generation';
}

interface TLineSegment {
  id: string;
  lineName: string;
  fromStructure: string;
  toStructure: string;
  milePoint: number;
  location: Location;
}

class LocationService {
  private googleMapsLoaded = false;
  private googlePlacesService: google.maps.places.PlacesService | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private geocoder: google.maps.Geocoder | null = null;
  private watchId: number | null = null;

  constructor() {
    this.loadGoogleMaps();
  }

  /**
   * Load Google Maps JavaScript API
   */
  private async loadGoogleMaps(): Promise<void> {
    if (this.googleMapsLoaded) return;

    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.error('Google Places API key not configured');
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.googleMapsLoaded = true;
        this.initializeServices();
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize Google services
   */
  private initializeServices(): void {
    if (!window.google) return;

    // Create a hidden div for the PlacesService
    const mapDiv = document.createElement('div');
    mapDiv.style.display = 'none';
    document.body.appendChild(mapDiv);
    
    const map = new google.maps.Map(mapDiv);
    this.googlePlacesService = new google.maps.places.PlacesService(map);
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder();
  }

  /**
   * Get current device location
   */
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  }

  /**
   * Start watching device location for real-time tracking
   */
  startLocationTracking(callback: (location: Location) => void): void {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }

  /**
   * Stop watching device location
   */
  stopLocationTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Search for places using Google Places Autocomplete
   */
  async searchPlaces(query: string, location?: Location): Promise<PlaceResult[]> {
    if (!this.autocompleteService) {
      await this.loadGoogleMaps();
    }

    return new Promise((resolve, reject) => {
      if (!this.autocompleteService) {
        reject(new Error('Google Places service not initialized'));
        return;
      }

      const request: google.maps.places.AutocompletionRequest = {
        input: query,
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'us' }, // Restrict to US for T&D projects
      };

      // Add location bias if provided
      if (location) {
        request.location = new google.maps.LatLng(location.lat, location.lng);
        request.radius = 50000; // 50km radius
      }

      this.autocompleteService.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          const results: PlaceResult[] = predictions.map((prediction) => ({
            placeId: prediction.place_id,
            description: prediction.description,
            mainText: prediction.structured_formatting.main_text,
            secondaryText: prediction.structured_formatting.secondary_text,
            types: prediction.types,
          }));
          resolve(results);
        } else {
          resolve([]);
        }
      });
    });
  }

  /**
   * Get detailed place information including coordinates
   */
  async getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    if (!this.googlePlacesService) {
      await this.loadGoogleMaps();
    }

    return new Promise((resolve, reject) => {
      if (!this.googlePlacesService) {
        reject(new Error('Google Places service not initialized'));
        return;
      }

      const request = {
        placeId,
        fields: ['name', 'formatted_address', 'geometry', 'types'],
      };

      this.googlePlacesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve({
            placeId,
            description: place.formatted_address || '',
            mainText: place.name || '',
            secondaryText: place.formatted_address || '',
            location: place.geometry?.location ? {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            } : undefined,
            types: place.types,
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(location: Location): Promise<string> {
    if (!this.geocoder) {
      await this.loadGoogleMaps();
    }

    return new Promise((resolve, reject) => {
      if (!this.geocoder) {
        reject(new Error('Geocoder not initialized'));
        return;
      }

      this.geocoder.geocode(
        { location: { lat: location.lat, lng: location.lng } },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve('Unknown location');
          }
        }
      );
    });
  }

  /**
   * Calculate distance between two points in miles
   */
  calculateDistance(point1: Location, point2: Location): number {
    const R = 3958.8; // Earth's radius in miles
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * 
      Math.cos(this.toRadians(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Search for nearby substations
   */
  async searchNearbySubstations(location: Location, radius: number = 10): Promise<SubstationLocation[]> {
    // This would typically query your backend database
    // For now, returning mock data
    return [
      {
        id: 'sub-001',
        name: 'Main Street Substation',
        voltageClass: '138kV',
        location: {
          lat: location.lat + 0.01,
          lng: location.lng + 0.01,
        },
        owner: 'Local Utility Co',
        type: 'substation',
      },
    ];
  }

  /**
   * Get transmission line segment by mile point
   */
  async getTLineSegmentByMilePoint(
    lineName: string, 
    milePoint: number
  ): Promise<TLineSegment | null> {
    // This would query your backend for the specific line segment
    // Mock implementation for now
    return {
      id: 'seg-001',
      lineName,
      fromStructure: `${Math.floor(milePoint)}-1`,
      toStructure: `${Math.floor(milePoint)}-2`,
      milePoint,
      location: await this.getCurrentLocation(),
    };
  }

  /**
   * Validate if location is within project boundary
   */
  isLocationInProjectBounds(
    location: Location,
    projectBounds: Location[]
  ): boolean {
    // Simple point-in-polygon test
    let inside = false;
    const x = location.lat;
    const y = location.lng;

    for (let i = 0, j = projectBounds.length - 1; i < projectBounds.length; j = i++) {
      const xi = projectBounds[i].lat;
      const yi = projectBounds[i].lng;
      const xj = projectBounds[j].lat;
      const yj = projectBounds[j].lng;

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * Format location for display
   */
  formatLocation(location: Location): string {
    return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
  }

  /**
   * Format location as DMS (Degrees Minutes Seconds)
   */
  formatLocationDMS(location: Location): string {
    const latDMS = this.toDMS(location.lat, 'lat');
    const lngDMS = this.toDMS(location.lng, 'lng');
    return `${latDMS} ${lngDMS}`;
  }

  /**
   * Convert decimal degrees to DMS
   */
  private toDMS(decimal: number, type: 'lat' | 'lng'): string {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesDecimal = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = ((minutesDecimal - minutes) * 60).toFixed(1);

    const direction = type === 'lat' 
      ? (decimal >= 0 ? 'N' : 'S')
      : (decimal >= 0 ? 'E' : 'W');

    return `${degrees}°${minutes}'${seconds}"${direction}`;
  }

  /**
   * Get structure location from project database
   */
  async getStructureLocation(structureNumber: string): Promise<Location | null> {
    // This would query your backend database
    // Mock implementation for demonstration
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/structures/${structureNumber}/location`
      );
      if (response.ok) {
        const data = await response.json();
        return data.location;
      }
    } catch (error) {
      console.error('Error fetching structure location:', error);
    }
    return null;
  }

  /**
   * Create a shareable location link
   */
  createLocationLink(location: Location, label?: string): string {
    const url = new URL('https://www.google.com/maps');
    url.searchParams.append('q', `${location.lat},${location.lng}`);
    if (label) {
      url.searchParams.append('label', label);
    }
    return url.toString();
  }
}

// Export singleton instance
export const locationService = new LocationService();

// Export types
export type { Location, PlaceResult, SubstationLocation, TLineSegment };
