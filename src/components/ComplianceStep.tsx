import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, FileCheck, AlertTriangle, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ComplianceStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const complianceItems = [
  {
    id: 'nerc_license',
    category: 'NERC',
    title: 'Electricity Generation License',
    description: 'Valid license from Nigerian Electricity Regulatory Commission',
    mandatory: true,
    status: false
  },
  {
    id: 'environmental_impact',
    category: 'NESREA',
    title: 'Environmental Impact Assessment',
    description: 'Environmental compliance clearance from NESREA',
    mandatory: true,
    status: false
  },
  {
    id: 'son_standards',
    category: 'SON',
    title: 'Standards Organization Compliance',
    description: 'Solar equipment meets SON certification standards',
    mandatory: true,
    status: false
  },
  {
    id: 'grid_connection',
    category: 'DisCo',
    title: 'Grid Connection Agreement',
    description: 'Signed interconnection agreement with Distribution Company',
    mandatory: true,
    status: false
  },
  {
    id: 'land_use',
    category: 'State Govt',
    title: 'Land Use Certificate',
    description: 'Valid certificate of occupancy or land use permit',
    mandatory: true,
    status: false
  },
  {
    id: 'fire_safety',
    category: 'Fire Service',
    title: 'Fire Safety Certificate',
    description: 'Fire safety clearance for solar installation',
    mandatory: false,
    status: false
  },
  {
    id: 'insurance',
    category: 'Insurance',
    title: 'Equipment Insurance',
    description: 'Comprehensive insurance coverage for solar assets',
    mandatory: false,
    status: false
  }
];

const ComplianceStep: React.FC<ComplianceStepProps> = ({ data, onUpdate, onNext }) => {
  const [checklist, setChecklist] = useState(complianceItems);
  const [notes, setNotes] = useState(data.compliance?.notes || '');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    calculateCompliance();
  }, [checklist]);

  const calculateCompliance = () => {
    const completedItems = checklist.filter(item => item.status).length;
    const mandatoryItems = checklist.filter(item => item.mandatory);
    const completedMandatory = mandatoryItems.filter(item => item.status).length;
    
    const score = Math.round((completedItems / checklist.length) * 100);
    const mandatoryScore = Math.round((completedMandatory / mandatoryItems.length) * 100);
    
    const canProceed = mandatoryScore >= 80; // At least 80% of mandatory items
    
    setIsCompleted(canProceed);
    
    onUpdate({
      compliance: {
        score,
        mandatoryScore,
        completedItems,
        totalItems: checklist.length,
        completedMandatory,
        totalMandatory: mandatoryItems.length,
        canProceed,
        checklist,
        notes
      }
    });
  };

  const toggleItem = (id: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: !item.status } : item
      )
    );
    
    toast({
      title: "Compliance Updated",
      description: "Checklist item status updated.",
    });
  };

  const mandatoryItems = checklist.filter(item => item.mandatory);
  const optionalItems = checklist.filter(item => !item.mandatory);
  const completedCount = checklist.filter(item => item.status).length;
  const completionPercentage = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-blue-900 flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Compliance Progress
            </h3>
            <span className="text-2xl font-bold text-blue-700">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-3 mb-2" />
          <div className="text-sm text-blue-700">
            {completedCount} of {checklist.length} requirements completed
          </div>
        </CardContent>
      </Card>

      {/* Mandatory Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Mandatory Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mandatoryItems.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                item.status 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50 hover:bg-red-100'
              }`}
              onClick={() => toggleItem(item.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {item.status ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${item.status ? 'text-green-900' : 'text-red-900'}`}>
                      {item.title}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.status ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${item.status ? 'text-green-700' : 'text-red-700'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Optional Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Info className="h-5 w-5" />
            Optional Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {optionalItems.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                item.status 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => toggleItem(item.id)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {item.status ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${item.status ? 'text-green-900' : 'text-gray-900'}`}>
                      {item.title}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.status ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${item.status ? 'text-green-700' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="compliance-notes">Compliance Notes & Action Items</Label>
          <Textarea
            id="compliance-notes"
            placeholder="Add any notes about compliance status, pending actions, or regulatory contacts..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card className={isCompleted ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}>
        <CardContent className="p-4">
          <div className="text-center">
            {isCompleted ? (
              <div>
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-green-900">Ready to Proceed</h3>
                <p className="text-sm text-green-700 mt-1">
                  Minimum compliance requirements met for PPA project
                </p>
              </div>
            ) : (
              <div>
                <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-medium text-yellow-900">Action Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Complete mandatory requirements before proceeding
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isCompleted && (
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
