
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Sun, Loader2, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import 'leaflet/dist/leaflet.css';

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
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  
  const [selectedLocation, setSelectedLocation] = useState<SolarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Fix for default markers in Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    map.current = L.map(mapContainer.current).setView([9.0820, 8.6753], 6);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Set bounds to Nigeria
    const nigeriaBounds = L.latLngBounds(
      [4.240594, 2.676932], // Southwest
      [13.885645, 14.577222] // Northeast
    );
    map.current.fitBounds(nigeriaBounds);

    // Add click handler for solar data
    map.current.on('click', handleMapClick);

    return () => {
      map.current?.remove();
    };
  }, []);

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    
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

      // Calculate average annual solar irradiance with proper type checking
      const irradianceData = solarResponse.data.properties.parameter.ALLSKY_SFC_SW_DWN;
      const tempData = solarResponse.data.properties.parameter.T2M;
      
      // Ensure we have valid numerical data
      const irradianceValues = Object.values(irradianceData).filter((val): val is number => typeof val === 'number' && !isNaN(val));
      const tempValues = Object.values(tempData).filter((val): val is number => typeof val === 'number' && !isNaN(val));
      
      const avgIrradiance = irradianceValues.length > 0 
        ? irradianceValues.reduce((a, b) => a + b, 0) / irradianceValues.length 
        : 4.5; // fallback value
        
      const avgTemp = tempValues.length > 0 
        ? tempValues.reduce((a, b) => a + b, 0) / tempValues.length 
        : 25; // fallback value

      // Get address using Nominatim (OpenStreetMap's geocoding service)
      const geocodeResponse = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: {
            lat: lat.toFixed(6),
            lon: lng.toFixed(6),
            format: 'json',
            countrycodes: 'ng'
          }
        }
      );

      const address = geocodeResponse.data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

      const solarData: SolarData = {
        irradiance: Number((avgIrradiance / 1000 * 24).toFixed(2)), // Convert to kWh/m²/day
        temperature: Number((avgTemp - 273.15).toFixed(1)), // Convert from Kelvin to Celsius
        coordinates: { lat, lng },
        address
      };

      setSelectedLocation(solarData);

      // Update marker
      if (marker.current) {
        map.current?.removeLayer(marker.current);
      }
      
      marker.current = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(map.current!);

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
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-[1000]">
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
