
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Zap, Calculator } from 'lucide-react';

interface SiteInfoStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const SiteInfoStep: React.FC<SiteInfoStepProps> = ({ data, onUpdate, onNext }) => {
  const [roofArea, setRoofArea] = useState(data.siteInfo?.roofArea || 100);
  const [panelEfficiency, setPanelEfficiency] = useState(data.siteInfo?.panelEfficiency || 20);
  const [systemSize, setSystemSize] = useState(0);

  useEffect(() => {
    // Calculate system size based on roof area and panel efficiency
    // Assuming 1 kW per 6-8 sq meters with given efficiency
    const calculatedSize = Math.round((roofArea * panelEfficiency / 100 * 0.15) * 10) / 10;
    setSystemSize(calculatedSize);
    
    onUpdate({
      siteInfo: {
        roofArea,
        panelEfficiency,
        systemSize: calculatedSize
      }
    });
  }, [roofArea, panelEfficiency, onUpdate]);

  const handleQuickFill = (preset: 'small' | 'medium' | 'large') => {
    const presets = {
      small: { area: 50, efficiency: 18 },
      medium: { area: 150, efficiency: 20 },
      large: { area: 300, efficiency: 22 }
    };
    
    setRoofArea(presets[preset].area);
    setPanelEfficiency(presets[preset].efficiency);
  };

  const canProceed = roofArea > 0 && systemSize > 0;

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
          <Home className="h-4 w-4" />
          Quick Setup - Common Configurations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => handleQuickFill('small')}
            className="h-auto p-3 hover:bg-green-100"
          >
            <div className="text-center">
              <div className="font-medium">Small Residential</div>
              <div className="text-sm text-gray-600">50 m² • 18% efficiency</div>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickFill('medium')}
            className="h-auto p-3 hover:bg-green-100"
          >
            <div className="text-center">
              <div className="font-medium">Medium Commercial</div>
              <div className="text-sm text-gray-600">150 m² • 20% efficiency</div>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickFill('large')}
            className="h-auto p-3 hover:bg-green-100"
          >
            <div className="text-center">
              <div className="font-medium">Large Industrial</div>
              <div className="text-sm text-gray-600">300 m² • 22% efficiency</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Site Specifications */}
      <div className="space-y-6">
        <div>
          <Label htmlFor="roofArea" className="text-base font-medium">
            Available Roof Area (square meters)
          </Label>
          <Input
            id="roofArea"
            type="number"
            value={roofArea}
            onChange={(e) => setRoofArea(Number(e.target.value))}
            className="mt-2"
            min="1"
            max="10000"
          />
          <p className="text-sm text-gray-600 mt-1">
            Enter the total roof area available for solar panel installation
          </p>
        </div>

        <div>
          <Label className="text-base font-medium">
            Solar Panel Efficiency: {panelEfficiency}%
          </Label>
          <div className="mt-2 px-2">
            <Slider
              value={[panelEfficiency]}
              onValueChange={(value) => setPanelEfficiency(value[0])}
              min={15}
              max={25}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>15% (Standard)</span>
            <span>25% (Premium)</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Higher efficiency panels generate more power per square meter
          </p>
        </div>
      </div>

      {/* Calculated System Size */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-blue-900">Estimated System Size</div>
                <div className="text-sm text-blue-700">Based on your specifications</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">{systemSize} kW</div>
              <div className="text-sm text-blue-700">Solar capacity</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">💡 Did you know?</h4>
        <p className="text-sm text-yellow-800">
          A typical 1 kW solar system in Nigeria can generate 4-5 kWh per day, 
          enough to power LED lights, fans, and small appliances for a household.
        </p>
      </div>

      {canProceed && (
        <div className="pt-4 border-t">
          <Button
            onClick={onNext}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            Calculate Solar Potential
          </Button>
        </div>
      )}
    </div>
  );
};

export default SiteInfoStep;
