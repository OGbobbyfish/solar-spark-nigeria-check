
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Navigation, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LocationStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
];

const sampleLocations = [
  { address: '123 Victoria Island, Lagos', state: 'Lagos' },
  { address: '456 Garki District, Abuja', state: 'FCT' },
  { address: '789 GRA, Port Harcourt', state: 'Rivers' },
  { address: '321 Independence Way, Kaduna', state: 'Kaduna' }
];

const LocationStep: React.FC<LocationStepProps> = ({ data, onUpdate, onNext }) => {
  const [address, setAddress] = useState(data.location?.address || '');
  const [selectedState, setSelectedState] = useState(data.location?.state || '');
  const [isValidated, setIsValidated] = useState(false);

  const handleValidateLocation = () => {
    if (!address.trim() || !selectedState) {
      toast({
        title: "Incomplete Information",
        description: "Please enter both address and state.",
        variant: "destructive"
      });
      return;
    }

    // Simulate location validation
    setIsValidated(true);
    onUpdate({
      location: {
        address: address.trim(),
        state: selectedState,
        coordinates: { lat: 6.5244 + Math.random() * 4, lng: 3.3792 + Math.random() * 8 }
      }
    });

    toast({
      title: "Location Validated",
      description: "Your location has been successfully validated.",
    });
  };

  const handleUseSampleLocation = (sample: typeof sampleLocations[0]) => {
    setAddress(sample.address);
    setSelectedState(sample.state);
    setIsValidated(false);
  };

  const canProceed = isValidated && address && selectedState;

  return (
    <div className="space-y-6">
      {/* Sample Locations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
          <Navigation className="h-4 w-4" />
          Quick Test - Sample Locations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sampleLocations.map((sample, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleUseSampleLocation(sample)}
              className="justify-start text-left h-auto p-2 hover:bg-blue-100"
            >
              <div>
                <div className="font-medium text-sm">{sample.address}</div>
                <div className="text-xs text-gray-600">{sample.state} State</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Manual Entry */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="address" className="text-base font-medium">Site Address</Label>
          <Input
            id="address"
            type="text"
            placeholder="Enter your site address (e.g., 123 Main Street, Victoria Island)"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setIsValidated(false);
            }}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="state" className="text-base font-medium">State</Label>
          <Select 
            value={selectedState} 
            onValueChange={(value) => {
              setSelectedState(value);
              setIsValidated(false);
            }}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent>
              {nigerianStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleValidateLocation}
          disabled={!address.trim() || !selectedState}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Validate Location
        </Button>

        {isValidated && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Location validated successfully!</span>
          </div>
        )}
      </div>

      {canProceed && (
        <div className="pt-4 border-t">
          <Button
            onClick={onNext}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Continue to Site Information
          </Button>
        </div>
      )}
    </div>
  );
};

export default LocationStep;
