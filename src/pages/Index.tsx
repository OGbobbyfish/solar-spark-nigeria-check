import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import LocationStep from '@/components/LocationStep';
import InteractiveMapStep from '@/components/InteractiveMapStep';
import SiteInfoStep from '@/components/SiteInfoStep';
import SolarCalculatorStep from '@/components/SolarCalculatorStep';
import SavingsStep from '@/components/SavingsStep';
import ComplianceStep from '@/components/ComplianceStep';
import ResultsStep from '@/components/ResultsStep';
import { ChevronLeft, ChevronRight, Sun, Zap, FileCheck, MapPin, Calculator, DollarSign } from 'lucide-react';

interface AssessmentData {
  location: {
    address: string;
    state: string;
    coordinates?: { lat: number; lng: number };
  };
  siteInfo: {
    roofArea: number;
    panelEfficiency: number;
    systemSize: number;
  };
  solarData: {
    dailyOutput: number;
    annualOutput: number;
    irradiance: number;
  };
  savings: {
    currentUsage: number;
    currentBill: number;
    ppaRate: number;
    monthlySavings: number;
    annualSavings: number;
  };
  compliance: {
    score: number;
    completedItems: number;
    totalItems: number;
  };
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    location: { address: '', state: '' },
    siteInfo: { roofArea: 0, panelEfficiency: 20, systemSize: 0 },
    solarData: { dailyOutput: 0, annualOutput: 0, irradiance: 0 },
    savings: { currentUsage: 0, currentBill: 0, ppaRate: 180, monthlySavings: 0, annualSavings: 0 },
    compliance: { score: 0, completedItems: 0, totalItems: 7 }
  });

  const steps = [
    { 
      title: 'Location', 
      description: 'Select location on interactive map',
      icon: MapPin,
      component: InteractiveMapStep 
    },
    { 
      title: 'Site Info', 
      description: 'Enter site specifications',
      icon: Sun,
      component: SiteInfoStep 
    },
    { 
      title: 'Solar Potential', 
      description: 'Calculate solar output',
      icon: Zap,
      component: SolarCalculatorStep 
    },
    { 
      title: 'Savings', 
      description: 'Estimate PPA savings',
      icon: DollarSign,
      component: SavingsStep 
    },
    { 
      title: 'Compliance', 
      description: 'Check regulatory requirements',
      icon: FileCheck,
      component: ComplianceStep 
    },
    { 
      title: 'Results', 
      description: 'View assessment report',
      icon: Calculator,
      component: ResultsStep 
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateAssessmentData = (stepData: Partial<AssessmentData>) => {
    setAssessmentData(prev => ({ ...prev, ...stepData }));
  };

  const CurrentStepComponent = steps[currentStep].component;
  const IconComponent = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2">
                <Sun className="h-8 w-8 text-yellow-500" />
                NigeriaSolar PPA Validator
              </h1>
              <p className="text-green-600 mt-1">Solar site viability assessment tool</p>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-green-700">
              <span>Step {currentStep + 1} of {steps.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Progress</span>
            <span className="text-sm text-green-600">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="flex space-x-2 md:space-x-4 min-w-max px-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center space-y-2 ${
                    index === currentStep 
                      ? 'text-green-600' 
                      : index < currentStep 
                        ? 'text-green-500' 
                        : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      index === currentStep
                        ? 'bg-green-100 border-green-600'
                        : index < currentStep
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <StepIcon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{step.title}</div>
                    <div className="text-xs text-gray-500 hidden md:block">{step.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Step Content */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <IconComponent className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{steps[currentStep].title}</h2>
                <p className="text-gray-600">{steps[currentStep].description}</p>
              </div>
            </div>

            <CurrentStepComponent
              data={assessmentData}
              onUpdate={updateAssessmentData}
              onNext={nextStep}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {currentStep < steps.length - 1 && (
            <Button
              onClick={nextStep}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
