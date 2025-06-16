
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Sun, Loader2, Info, Target, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

interface SolarData {
  irradiance: number;
  coordinates: { lat: number; lng: number };
  address: string;
}

const InteractiveMapStep: React.FC<InteractiveMapStepProps> = ({ data, onUpdate, onNext }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  
  const [selectedLocation, setSelectedLocation] = useState<SolarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

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

    map.current = L.map(mapContainer.current, {
      zoomControl: false // We'll add custom zoom controls
    }).setView([9.0820, 8.6753], 6);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map.current);

    // Add custom zoom control
    L.control.zoom({
      position: 'topright'
    }).addTo(map.current);

    // Set bounds to Nigeria with padding
    const nigeriaBounds = L.latLngBounds(
      [4.240594, 2.676932], // Southwest
      [13.885645, 14.577222] // Northeast
    );
    map.current.fitBounds(nigeriaBounds, { padding: [20, 20] });

    // Add click handler for solar data
    map.current.on('click', handleMapClick);

    // Add interaction tracking
    map.current.on('movestart', () => setHasInteracted(true));
    map.current.on('zoomstart', () => setHasInteracted(true));

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
        description: "Please select a location within Nigeria for accurate solar data.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setHasInteracted(true);
    
    try {
      // Show immediate visual feedback
      if (marker.current) {
        map.current?.removeLayer(marker.current);
      }
      
      // Add temporary marker while loading
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
            parameters: 'ALLSKY_SFC_SW_DWN',
            format: 'JSON'
          }
        }
      );

      // Calculate average annual solar irradiance
      const irradianceData = solarResponse.data.properties.parameter.ALLSKY_SFC_SW_DWN;
      
      // Ensure we have valid numerical data
      const irradianceValues = Object.values(irradianceData).filter((val): val is number => 
        typeof val === 'number' && !isNaN(val) && val > 0
      );
      
      const avgIrradiance = irradianceValues.length > 0 
        ? irradianceValues.reduce((a, b) => a + b, 0) / irradianceValues.length 
        : 4.5; // fallback value

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
        coordinates: { lat, lng },
        address
      };

      setSelectedLocation(solarData);

      // Update parent component data
      onUpdate({
        location: {
          address: solarData.address,
          state: extractStateFromAddress(address),
          coordinates: solarData.coordinates
        },
        solarData: {
          irradiance: solarData.irradiance
        }
      });

      toast({
        title: "Location Selected Successfully!",
        description: `Solar potential: ${getSolarRating(solarData.irradiance)}`,
      });

    } catch (error) {
      console.error('Error fetching solar data:', error);
      toast({
        title: "Unable to Get Solar Data",
        description: "Please try selecting a different location or check your internet connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSolarRating = (irradiance: number): string => {
    if (irradiance >= 5.5) return 'Excellent (High solar potential)';
    if (irradiance >= 4.5) return 'Good (Suitable for solar)';
    if (irradiance >= 3.5) return 'Fair (Moderate potential)';
    return 'Low (Consider alternatives)';
  };

  const getSolarColor = (irradiance: number): string => {
    if (irradiance >= 5.5) return 'text-green-700';
    if (irradiance >= 4.5) return 'text-yellow-700';
    if (irradiance >= 3.5) return 'text-orange-700';
    return 'text-red-700';
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
      {/* Enhanced Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Select Your Project Location</h3>
              <p className="text-blue-700 text-sm mt-1">
                Click anywhere on the map to get real-time solar irradiance data for that location. 
                We'll automatically calculate the solar potential using NASA satellite data.
              </p>
              {!hasInteracted && (
                <div className="mt-2 text-xs text-blue-600 bg-blue-100 rounded px-2 py-1 inline-block">
                  💡 Tip: Zoom in for more precise location selection
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Container with Enhanced Loading */}
      <Card>
        <CardContent className="p-0 relative">
          <div 
            ref={mapContainer} 
            className="h-96 w-full rounded-lg relative cursor-crosshair"
          />
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-[1000]">
              <div className="bg-white p-6 rounded-lg flex flex-col items-center gap-3 shadow-lg">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <div className="text-center">
                  <div className="font-medium">Analyzing Solar Potential</div>
                  <div className="text-sm text-gray-600">Getting NASA satellite data...</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Map overlay instructions for first-time users */}
          {!hasInteracted && !selectedLocation && (
            <div className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-sm z-[500] max-w-xs">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Click on the map to select a location</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Location Data */}
      {selectedLocation && (
        <Card className="bg-gradient-to-r from-green-50 to-yellow-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 text-lg">Location Selected!</h3>
                <p className="text-green-800 text-sm mt-1 mb-4">{selectedLocation.address}</p>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Sun className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-gray-900">Solar Analysis Results</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Daily Solar Irradiance</div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedLocation.irradiance} kWh/m²
                      </div>
                      <div className={`text-sm font-medium ${getSolarColor(selectedLocation.irradiance)}`}>
                        {getSolarRating(selectedLocation.irradiance)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Annual Solar Energy</div>
                      <div className="text-2xl font-bold text-green-600">
                        {(selectedLocation.irradiance * 365).toLocaleString()} kWh/m²
                      </div>
                      <div className="text-sm text-gray-600">
                        Excellent for PPA projects
                      </div>
                    </div>
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
            className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
          >
            Continue with This Location →
          </Button>
        </div>
      )}
    </div>
  );
};

export default InteractiveMapStep;
