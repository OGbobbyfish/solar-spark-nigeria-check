
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sun, Zap, TrendingUp, MapPin } from 'lucide-react';

interface SolarCalculatorStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

// Sample Nigerian solar irradiance data by state
const solarIrradianceData = {
  'Lagos': 4.2,
  'FCT': 5.1,
  'Rivers': 4.0,
  'Kaduna': 5.3,
  'Kano': 5.8,
  'Ogun': 4.3,
  'Oyo': 4.7,
  'Plateau': 5.4,
  'Delta': 3.9,
  'Imo': 4.1,
  'Cross River': 3.8,
  'Enugu': 4.4,
  'Anambra': 4.2,
  'Edo': 4.0,
  'Ondo': 4.5,
  'Osun': 4.6,
  'Ekiti': 4.8,
  'Kwara': 5.0,
  'Niger': 5.2,
  'Benue': 4.9,
  'Nasarawa': 5.0,
  'Taraba': 4.7,
  'Adamawa': 5.1,
  'Bauchi': 5.4,
  'Gombe': 5.6,
  'Yobe': 5.9,
  'Borno': 6.1,
  'Jigawa': 5.7,
  'Katsina': 5.8,
  'Kebbi': 6.0,
  'Sokoto': 6.2,
  'Zamfara': 5.9,
  'Abia': 4.0,
  'Akwa Ibom': 3.7,
  'Bayelsa': 3.5,
  'Ebonyi': 4.3
};

const SolarCalculatorStep: React.FC<SolarCalculatorStepProps> = ({ data, onUpdate, onNext }) => {
  const [dailyOutput, setDailyOutput] = useState(0);
  const [annualOutput, setAnnualOutput] = useState(0);
  const [irradiance, setIrradiance] = useState(0);
  const [isCalculated, setIsCalculated] = useState(false);

  useEffect(() => {
    if (data.location?.state && data.siteInfo?.systemSize) {
      calculateSolarOutput();
    }
  }, [data.location?.state, data.siteInfo?.systemSize]);

  const calculateSolarOutput = () => {
    const state = data.location?.state;
    const systemSize = data.siteInfo?.systemSize || 0;
    
    // Get irradiance for the state (default to 4.5 if state not found)
    const stateIrradiance = solarIrradianceData[state as keyof typeof solarIrradianceData] || 4.5;
    
    // Calculate daily output (kWh/day) = System Size (kW) × Solar Irradiance (kWh/m²/day)
    const daily = systemSize * stateIrradiance;
    
    // Calculate annual output
    const annual = daily * 365;
    
    setDailyOutput(Math.round(daily * 10) / 10);
    setAnnualOutput(Math.round(annual));
    setIrradiance(stateIrradiance);
    setIsCalculated(true);
    
    onUpdate({
      solarData: {
        dailyOutput: Math.round(daily * 10) / 10,
        annualOutput: Math.round(annual),
        irradiance: stateIrradiance
      }
    });
  };

  const handleRecalculate = () => {
    calculateSolarOutput();
  };

  const canProceed = isCalculated && dailyOutput > 0;

  return (
    <div className="space-y-6">
      {/* Location & System Info Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Site Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-blue-700 font-medium">Location</div>
            <div className="text-blue-600">{data.location?.address}</div>
            <div className="text-blue-600">{data.location?.state} State</div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">System Size</div>
            <div className="text-blue-600">{data.siteInfo?.systemSize} kW</div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">Solar Irradiance</div>
            <div className="text-blue-600">{irradiance} kWh/m²/day</div>
          </div>
        </div>
      </div>

      {/* Solar Output Results */}
      {isCalculated ? (
        <div className="space-y-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Sun className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-900">{dailyOutput} kWh/day</h3>
                  <p className="text-green-700">Estimated Daily Solar Output</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-yellow-900">{annualOutput.toLocaleString()} kWh</div>
                    <div className="text-sm text-yellow-700">Annual Output</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Zap className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-orange-900">{irradiance}</div>
                    <div className="text-sm text-orange-700">Solar Irradiance (kWh/m²/day)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Indicator */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Solar Performance Rating</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
              <Progress 
                value={Math.min((irradiance / 6.5) * 100, 100)} 
                className="h-3"
              />
              <p className="text-sm text-gray-600 mt-2">
                {irradiance >= 5.5 ? 'Excellent solar conditions for PPA projects!' :
                 irradiance >= 4.5 ? 'Good solar potential for commercial viability.' :
                 irradiance >= 3.5 ? 'Moderate solar conditions, feasible with optimization.' :
                 'Lower solar irradiance, consider site improvements.'}
              </p>
            </div>
          </div>

          <Button
            onClick={handleRecalculate}
            variant="outline"
            className="w-full"
          >
            Recalculate Solar Output
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sun className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">Ready to calculate solar potential</p>
          <Button onClick={calculateSolarOutput} className="bg-green-600 hover:bg-green-700">
            <Zap className="h-4 w-4 mr-2" />
            Calculate Solar Output
          </Button>
        </div>
      )}

      {canProceed && (
        <div className="pt-4 border-t">
          <Button
            onClick={onNext}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Calculate PPA Savings
          </Button>
        </div>
      )}
    </div>
  );
};

export default SolarCalculatorStep;
