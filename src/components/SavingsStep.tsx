
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calculator, Zap } from 'lucide-react';

interface SavingsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const SavingsStep: React.FC<SavingsStepProps> = ({ data, onUpdate, onNext }) => {
  const [currentUsage, setCurrentUsage] = useState(data.savings?.currentUsage || 0);
  const [currentBill, setCurrentBill] = useState(data.savings?.currentBill || 0);
  const [ppaRate] = useState(180); // Fixed PPA rate in NGN per kWh
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [annualSavings, setAnnualSavings] = useState(0);
  const [isCalculated, setIsCalculated] = useState(false);

  // Nigerian electricity tariff (Band A as reference)
  const gridTariff = 225; // NGN per kWh

  useEffect(() => {
    if (currentUsage > 0 && currentBill > 0) {
      calculateSavings();
    }
  }, [currentUsage, currentBill, data.solarData?.dailyOutput]);

  const calculateSavings = () => {
    const dailySolarOutput = data.solarData?.dailyOutput || 0;
    const monthlySolarOutput = dailySolarOutput * 30;
    
    // Calculate how much of the current usage can be covered by solar
    const solarCoverage = Math.min(monthlySolarOutput, currentUsage);
    
    // Calculate savings: (Grid rate - PPA rate) × Solar coverage
    const monthlySavingsAmount = solarCoverage * (gridTariff - ppaRate);
    const annualSavingsAmount = monthlySavingsAmount * 12;
    
    setMonthlySavings(Math.round(monthlySavingsAmount));
    setAnnualSavings(Math.round(annualSavingsAmount));
    setIsCalculated(true);
    
    onUpdate({
      savings: {
        currentUsage,
        currentBill,
        ppaRate,
        monthlySavings: Math.round(monthlySavingsAmount),
        annualSavings: Math.round(annualSavingsAmount)
      }
    });
  };

  const handleQuickFill = (preset: 'residential' | 'commercial' | 'industrial') => {
    const presets = {
      residential: { usage: 500, bill: 112500 }, // 500 kWh at ₦225/kWh
      commercial: { usage: 2000, bill: 450000 }, // 2000 kWh
      industrial: { usage: 10000, bill: 2250000 } // 10000 kWh
    };
    
    setCurrentUsage(presets[preset].usage);
    setCurrentBill(presets[preset].bill);
  };

  const solarCoveragePercent = data.solarData?.dailyOutput 
    ? Math.min((data.solarData.dailyOutput * 30 / currentUsage) * 100, 100)
    : 0;

  const canProceed = isCalculated && monthlySavings >= 0;

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Quick Setup - Typical Usage Patterns
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => handleQuickFill('residential')}
            className="h-auto p-3 hover:bg-green-100"
          >
            <div className="text-center">
              <div className="font-medium">Residential</div>
              <div className="text-sm text-gray-600">500 kWh • ₦112,500/month</div>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickFill('commercial')}
            className="h-auto p-3 hover:bg-green-100"
          >
            <div className="text-center">
              <div className="font-medium">Commercial</div>
              <div className="text-sm text-gray-600">2,000 kWh • ₦450,000/month</div>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickFill('industrial')}
            className="h-auto p-3 hover:bg-green-100"
          >
            <div className="text-center">
              <div className="font-medium">Industrial</div>
              <div className="text-sm text-gray-600">10,000 kWh • ₦2.25M/month</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Current Usage Input */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="currentUsage" className="text-base font-medium">
            Monthly Electricity Usage (kWh)
          </Label>
          <Input
            id="currentUsage"
            type="number"
            value={currentUsage}
            onChange={(e) => setCurrentUsage(Number(e.target.value))}
            className="mt-2"
            placeholder="e.g., 500"
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="currentBill" className="text-base font-medium">
            Monthly Electricity Bill (₦)
          </Label>
          <Input
            id="currentBill"
            type="number"
            value={currentBill}
            onChange={(e) => setCurrentBill(Number(e.target.value))}
            className="mt-2"
            placeholder="e.g., 112,500"
            min="0"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">PPA Rate Information</h4>
          <div className="text-sm text-blue-800">
            <div className="flex justify-between items-center mb-1">
              <span>Current Grid Rate (Band A):</span>
              <span className="font-medium">₦{gridTariff}/kWh</span>
            </div>
            <div className="flex justify-between items-center">
              <span>PPA Rate:</span>
              <span className="font-medium text-green-600">₦{ppaRate}/kWh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Calculation Results */}
      {isCalculated && (
        <div className="space-y-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-900">₦{monthlySavings.toLocaleString()}</h3>
                  <p className="text-green-700">Estimated Monthly Savings</p>
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
                    <div className="text-xl font-bold text-yellow-900">₦{annualSavings.toLocaleString()}</div>
                    <div className="text-sm text-yellow-700">Annual Savings</div>
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
                    <div className="text-xl font-bold text-orange-900">{Math.round(solarCoveragePercent)}%</div>
                    <div className="text-sm text-orange-700">Solar Coverage</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Savings Breakdown */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Savings Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Solar Output (Monthly):</span>
                <span>{data.solarData?.dailyOutput ? (data.solarData.dailyOutput * 30).toFixed(1) : 0} kWh</span>
              </div>
              <div className="flex justify-between">
                <span>Rate Difference:</span>
                <span>₦{gridTariff - ppaRate}/kWh saved</span>
              </div>
              <div className="flex justify-between">
                <span>Coverage:</span>
                <span>{Math.round(solarCoveragePercent)}% of monthly usage</span>
              </div>
              <div className="flex justify-between font-medium text-green-600 pt-2 border-t">
                <span>Monthly Savings:</span>
                <span>₦{monthlySavings.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {canProceed && (
        <div className="pt-4 border-t">
          <Button
            onClick={onNext}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Check Compliance Requirements
          </Button>
        </div>
      )}
    </div>
  );
};

export default SavingsStep;
