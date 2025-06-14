
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Sun, Loader2, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import 'mapbox-gl/dist/mapbox-gl.css';

interface InteractiveMapStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

interface SolarData {
  irradiance: number;
  temperature: number;
  coordinates: { lat: number; lng: number };
  address: string;
}

const InteractiveMapStep: React.FC<InteractiveMapStepProps> = ({ data, onUpdate, onNext }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SolarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize map when token is provided
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      setIsTokenValid(true);
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [8.6753, 9.0820], // Center of Nigeria
        zoom: 5.5,
        projection: 'mercator'
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add click handler for solar data
      map.current.on('click', handleMapClick);

      // Add Nigeria bounds
      map.current.fitBounds([
        [2.676932, 4.240594], // Southwest coordinates
        [14.577222, 13.885645] // Northeast coordinates
      ]);

    } catch (error) {
      setIsTokenValid(false);
      toast({
        title: "Invalid Mapbox Token",
        description: "Please check your Mapbox access token.",
        variant: "destructive"
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  const handleMapClick = async (e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    
    // Check if click is within Nigeria bounds (approximate)
    if (lng < 2.5 || lng > 15 || lat < 4 || lat > 14) {
      toast({
        title: "Location Outside Nigeria",
        description: "Please select a location within Nigeria.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Fetch solar irradiance data from NASA POWER API
      const solarResponse = await axios.get(
        `https://power.larc.nasa.gov/api/temporal/daily/point`,
        {
          params: {
            start: '20230101',
            end: '20231231',
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
            community: 'SB',
            parameters: 'ALLSKY_SFC_SW_DWN,T2M',
            format: 'JSON'
          }
        }
      );

      // Calculate average annual solar irradiance
      const irradianceData = solarResponse.data.properties.parameter.ALLSKY_SFC_SW_DWN;
      const tempData = solarResponse.data.properties.parameter.T2M;
      
      const avgIrradiance = Object.values(irradianceData).reduce((a: any, b: any) => a + b, 0) / Object.values(irradianceData).length;
      const avgTemp = Object.values(tempData).reduce((a: any, b: any) => a + b, 0) / Object.values(tempData).length;

      // Get address using reverse geocoding
      const geocodeResponse = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`,
        {
          params: {
            access_token: mapboxToken,
            country: 'NG'
          }
        }
      );

      const address = geocodeResponse.data.features[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

      const solarData: SolarData = {
        irradiance: Number((avgIrradiance / 1000 * 24).toFixed(2)), // Convert to kWh/m²/day
        temperature: Number((avgTemp - 273.15).toFixed(1)), // Convert from Kelvin to Celsius
        coordinates: { lat, lng },
        address
      };

      setSelectedLocation(solarData);

      // Update marker
      if (marker.current) {
        marker.current.remove();
      }
      
      marker.current = new mapboxgl.Marker({ color: '#059669' })
        .setLngLat([lng, lat])
        .addTo(map.current!);

      // Update parent component data
      onUpdate({
        location: {
          address: solarData.address,
          state: extractStateFromAddress(address),
          coordinates: solarData.coordinates
        },
        solarData: {
          irradiance: solarData.irradiance,
          temperature: solarData.temperature
        }
      });

      toast({
        title: "Location Selected",
        description: `Solar irradiance: ${solarData.irradiance} kWh/m²/day`,
      });

    } catch (error) {
      console.error('Error fetching solar data:', error);
      toast({
        title: "Error Fetching Data",
        description: "Unable to get solar data for this location. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractStateFromAddress = (address: string): string => {
    const nigerianStates = [
      'Lagos', 'Kano', 'Rivers', 'FCT', 'Kaduna', 'Oyo', 'Ogun', 'Imo', 'Delta', 'Sokoto',
      'Plateau', 'Anambra', 'Borno', 'Niger', 'Akwa Ibom', 'Ondo', 'Osun', 'Cross River',
      'Abia', 'Adamawa', 'Bauchi', 'Bayelsa', 'Benue', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
      'Gombe', 'Jigawa', 'Kebbi', 'Kogi', 'Kwara', 'Nasarawa', 'Taraba', 'Yobe', 'Zamfara',
      'Katsina'
    ];
    
    const foundState = nigerianStates.find(state => 
      address.toLowerCase().includes(state.toLowerCase())
    );
    
    return foundState || 'FCT';
  };

  const validateToken = () => {
    if (!mapboxToken) {
      toast({
        title: "Token Required",
        description: "Please enter your Mapbox access token.",
        variant: "destructive"
      });
      return;
    }
    // Token validation happens in useEffect
  };

  if (!isTokenValid) {
    return (
      <div className="space-y-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Interactive Solar Map</h3>
                <p className="text-blue-700 mt-2">
                  Click anywhere on the map to get real-time solar potential data for that location in Nigeria.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="mapbox-token">Mapbox Access Token</Label>
              <Input
                id="mapbox-token"
                type="password"
                placeholder="pk.ey..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-gray-600 mt-2">
                Get your free token at{' '}
                <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  mapbox.com
                </a>
              </p>
            </div>
            <Button onClick={validateToken} className="w-full">
              Initialize Map
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900">How to Use</h3>
              <p className="text-green-700 text-sm mt-1">
                Click anywhere on the map to select a location and get real-time solar irradiance data from NASA's database.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapContainer} 
            className="h-96 w-full rounded-lg relative"
          />
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="bg-white p-4 rounded-lg flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Fetching solar data...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Location Data */}
      {selectedLocation && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sun className="h-6 w-6 text-yellow-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">Selected Location</h3>
                <p className="text-yellow-800 text-sm mt-1">{selectedLocation.address}</p>
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <span className="font-medium text-yellow-900">Solar Irradiance:</span>
                    <br />
                    <span className="text-yellow-700">{selectedLocation.irradiance} kWh/m²/day</span>
                  </div>
                  <div>
                    <span className="font-medium text-yellow-900">Avg Temperature:</span>
                    <br />
                    <span className="text-yellow-700">{selectedLocation.temperature}°C</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedLocation && (
        <div className="pt-4 border-t">
          <Button
            onClick={onNext}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Continue with Selected Location
          </Button>
        </div>
      )}
    </div>
  );
};

export default InteractiveMapStep;
