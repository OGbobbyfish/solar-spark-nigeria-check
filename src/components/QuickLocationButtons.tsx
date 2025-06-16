
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface QuickLocation {
  name: string;
  state: string;
  coordinates: { lat: number; lng: number };
}

interface QuickLocationButtonsProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

const popularLocations: QuickLocation[] = [
  { name: 'Lagos', state: 'Lagos', coordinates: { lat: 6.5244, lng: 3.3792 } },
  { name: 'Abuja', state: 'FCT', coordinates: { lat: 9.0765, lng: 7.3986 } },
  { name: 'Kano', state: 'Kano', coordinates: { lat: 12.0022, lng: 8.5920 } },
  { name: 'Port Harcourt', state: 'Rivers', coordinates: { lat: 4.8156, lng: 7.0498 } },
  { name: 'Ibadan', state: 'Oyo', coordinates: { lat: 7.3775, lng: 3.9470 } },
  { name: 'Kaduna', state: 'Kaduna', coordinates: { lat: 10.5105, lng: 7.4165 } }
];

const QuickLocationButtons: React.FC<QuickLocationButtonsProps> = ({ onLocationSelect }) => {
  const handleLocationClick = (location: QuickLocation) => {
    onLocationSelect(
      location.coordinates.lat,
      location.coordinates.lng,
      `${location.name}, ${location.state} State, Nigeria`
    );
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Popular Cities</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {popularLocations.map((location) => (
          <Button
            key={location.name}
            variant="outline"
            size="sm"
            onClick={() => handleLocationClick(location)}
            className="justify-start text-xs h-8 px-3"
          >
            <MapPin className="h-3 w-3 mr-1.5" />
            {location.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickLocationButtons;
