
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GPSLocationButtonProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

const GPSLocationButton: React.FC<GPSLocationButtonProps> = ({ onLocationSelect }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS Not Available",
        description: "Your browser doesn't support location services.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Check if location is within Nigeria (approximate bounds)
        if (longitude < 2.5 || longitude > 15 || latitude < 4 || latitude > 14) {
          toast({
            title: "Location Outside Nigeria",
            description: "Your current location appears to be outside Nigeria. Please select a location within Nigeria.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        onLocationSelect(latitude, longitude, `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setIsLoading(false);
        
        toast({
          title: "Location Found!",
          description: "Using your current GPS location."
        });
      },
      (error) => {
        setIsLoading(false);
        let message = "Unable to get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }

        toast({
          title: "GPS Error",
          description: message,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <Button
      onClick={handleGPSLocation}
      disabled={isLoading}
      variant="outline"
      className="w-full"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Navigation className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Getting Location...' : 'Use My Current Location'}
    </Button>
  );
};

export default GPSLocationButton;
