
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { FileCheck, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

interface ComplianceStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const complianceRequirements = [
  {
    id: 1,
    category: 'NERC (Nigerian Electricity Regulatory Commission)',
    requirement: 'Embedded Generation License Application',
    description: 'Required for solar installations > 1MW or grid-connected systems',
    mandatory: true,
    link: 'https://nerc.gov.ng'
  },
  {
    id: 2,
    category: 'NERC',
    requirement: 'Grid Connection Agreement',
    description: 'Agreement with Distribution Company (DisCo) for grid interconnection',
    mandatory: true,
    link: 'https://nerc.gov.ng'
  },
  {
    id: 3,
    category: 'SON (Standards Organisation of Nigeria)',
    requirement: 'Equipment Standards Compliance',
    description: 'Solar panels and inverters must meet Nigerian Industrial Standards (NIS)',
    mandatory: true,
    link: 'https://son.gov.ng'
  },
  {
    id: 4,
    category: 'NESREA (Environmental Agency)',
    requirement: 'Environmental Impact Assessment',
    description: 'Required for large-scale installations (>10MW typically)',
    mandatory: false,
    link: 'https://nesrea.gov.ng'
  },
  {
    id: 5,
    category: 'Local Government',
    requirement: 'Building/Construction Permits',
    description: 'Local permits for structural modifications and installations',
    mandatory: true,
    link: '#'
  },
  {
    id: 6,
    category: 'Fire Safety',
    requirement: 'Fire Safety Compliance',
    description: 'Fire safety clearance for commercial installations',
    mandatory: true,
    link: '#'
  },
  {
    id: 7,
    category: 'Insurance',
    requirement: 'Project Insurance Coverage',
    description: 'Comprehensive insurance for PPA project assets',
    mandatory: false,
    link: '#'
  }
];

const ComplianceStep: React.FC<ComplianceStepProps> = ({ data, onUpdate, onNext }) => {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const completedItems = checkedItems.length;
    const totalItems = complianceRequirements.length;
    const calculatedScore = Math.round((completedItems / totalItems) * 100);
    
    setScore(calculatedScore);
    
    onUpdate({
      compliance: {
        score: calculatedScore,
        completedItems,
        totalItems,
        checkedRequirements: checkedItems
      }
    });
  }, [checkedItems, onUpdate]);

  const handleCheckboxChange = (requirementId: number, checked: boolean) => {
    setCheckedItems(prev => 
      checked 
        ? [...prev, requirementId]
        : prev.filter(id => id !== requirementId)
    );
  };

  const mandatoryRequirements = complianceRequirements.filter(req => req.mandatory);
  const mandatoryCompleted = mandatoryRequirements.filter(req => 
    checkedItems.includes(req.id)
  ).length;
  const mandatoryTotal = mandatoryRequirements.length;

  const canProceed = mandatoryCompleted >= mandatoryTotal * 0.6; // At least 60% of mandatory items

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Compliance Score */}
      <Card className={`${getScoreBackground(score)}`}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto">
              {score >= 80 ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : score >= 60 ? (
                <FileCheck className="h-8 w-8 text-yellow-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              )}
            </div>
            <div>
              <h3 className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}%</h3>
              <p className="text-gray-700">Compliance Score</p>
              <p className="text-sm text-gray-600 mt-1">
                {checkedItems.length} of {complianceRequirements.length} requirements completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-blue-900">Mandatory Requirements</span>
                <span className="text-blue-700">{mandatoryCompleted}/{mandatoryTotal}</span>
              </div>
              <Progress 
                value={(mandatoryCompleted / mandatoryTotal) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-purple-900">Overall Progress</span>
                <span className="text-purple-700">{checkedItems.length}/{complianceRequirements.length}</span>
              </div>
              <Progress 
                value={score} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Checklist */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Regulatory Compliance Checklist
        </h3>
        
        <div className="space-y-3">
          {complianceRequirements.map((requirement) => (
            <Card key={requirement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={`requirement-${requirement.id}`}
                    checked={checkedItems.includes(requirement.id)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(requirement.id, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label 
                        htmlFor={`requirement-${requirement.id}`}
                        className="text-base font-medium cursor-pointer"
                      >
                        {requirement.requirement}
                        {requirement.mandatory && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Mandatory
                          </span>
                        )}
                      </Label>
                      {requirement.link !== '#' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1"
                          onClick={() => window.open(requirement.link, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium text-blue-700">{requirement.category}</div>
                      <div>{requirement.description}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Compliance Status Message */}
      <div className={`rounded-lg p-4 ${
        score >= 80 
          ? 'bg-green-100 text-green-800 border border-green-200'
          : score >= 60
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        <div className="flex items-center gap-2">
          {score >= 80 ? (
            <CheckCircle className="h-5 w-5" />
          ) : score >= 60 ? (
            <FileCheck className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          <div className="font-medium">
            {score >= 80 
              ? 'Excellent Compliance Status!'
              : score >= 60
                ? 'Good Compliance Progress'
                : 'Compliance Attention Required'
            }
          </div>
        </div>
        <p className="text-sm mt-2">
          {score >= 80 
            ? 'Your project meets most regulatory requirements. You\'re ready to proceed with implementation.'
            : score >= 60
              ? 'You\'ve completed most requirements. Address remaining mandatory items before proceeding.'
              : 'Several mandatory requirements need attention. Focus on NERC and SON compliance first.'
          }
        </p>
      </div>

      {canProceed && (
        <div className="pt-4 border-t">
          <Button
            onClick={onNext}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Generate Assessment Report
          </Button>
        </div>
      )}
    </div>
  );
};

export default ComplianceStep;
