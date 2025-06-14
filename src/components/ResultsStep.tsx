
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Mail, 
  MapPin, 
  Sun, 
  DollarSign, 
  FileCheck, 
  TrendingUp,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ResultsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const ResultsStep: React.FC<ResultsStepProps> = ({ data }) => {
  const [email, setEmail] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    // Simulate PDF generation
    setTimeout(() => {
      setIsGeneratingPDF(false);
      toast({
        title: "PDF Generated",
        description: "Your assessment report has been downloaded.",
      });
      
      // In a real app, this would trigger actual PDF download
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + 
        encodeURIComponent(generateReportText()));
      element.setAttribute('download', 'nigeriasolar-ppa-assessment.txt');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 2000);
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingEmail(true);
    
    // Simulate email sending
    setTimeout(() => {
      setIsSendingEmail(false);
      toast({
        title: "Email Sent",
        description: `Assessment report sent to ${email}`,
      });
    }, 1500);
  };

  const generateReportText = () => {
    return `
NIGERIASOLAR PPA VALIDATOR - ASSESSMENT REPORT
=============================================

SITE INFORMATION
Location: ${data.location?.address}
State: ${data.location?.state}
System Size: ${data.siteInfo?.systemSize} kW
Roof Area: ${data.siteInfo?.roofArea} m²
Panel Efficiency: ${data.siteInfo?.panelEfficiency}%

SOLAR POTENTIAL
Daily Output: ${data.solarData?.dailyOutput} kWh/day
Annual Output: ${data.solarData?.annualOutput} kWh/year
Solar Irradiance: ${data.solarData?.irradiance} kWh/m²/day

PPA SAVINGS
Monthly Savings: ₦${data.savings?.monthlySavings?.toLocaleString()}
Annual Savings: ₦${data.savings?.annualSavings?.toLocaleString()}
Current Usage: ${data.savings?.currentUsage} kWh/month

COMPLIANCE SCORE
Overall Score: ${data.compliance?.score}%
Completed Requirements: ${data.compliance?.completedItems}/${data.compliance?.totalItems}

Generated on: ${new Date().toLocaleDateString()}
    `;
  };

  const getViabilityStatus = () => {
    const solarScore = data.solarData?.irradiance >= 4.5 ? 25 : 
                     data.solarData?.irradiance >= 3.5 ? 15 : 5;
    const savingsScore = data.savings?.monthlySavings >= 50000 ? 25 :
                        data.savings?.monthlySavings >= 20000 ? 15 : 5;
    const complianceScore = (data.compliance?.score || 0) * 0.5;
    
    const totalScore = solarScore + savingsScore + complianceScore;
    
    if (totalScore >= 70) return { status: 'Highly Viable', color: 'green', icon: CheckCircle };
    if (totalScore >= 50) return { status: 'Viable', color: 'yellow', icon: CheckCircle };
    return { status: 'Needs Attention', color: 'red', icon: AlertCircle };
  };

  const viability = getViabilityStatus();
  const StatusIcon = viability.icon;

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className={`bg-${viability.color}-50 border-${viability.color}-200`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className={`h-6 w-6 text-${viability.color}-600`} />
            Project Viability Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className={`text-2xl font-bold text-${viability.color}-900`}>
              {viability.status}
            </div>
            <p className={`text-${viability.color}-700`}>
              {viability.status === 'Highly Viable' 
                ? 'This site shows excellent potential for a successful PPA project.'
                : viability.status === 'Viable'
                  ? 'This site has good potential with some considerations needed.'
                  : 'This site requires attention to key areas before proceeding.'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Location</div>
                <div className="font-semibold">{data.location?.state}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Sun className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Solar Output</div>
                <div className="font-semibold">{data.solarData?.dailyOutput} kWh/day</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Monthly Savings</div>
                <div className="font-semibold">₦{data.savings?.monthlySavings?.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Compliance</div>
                <div className="font-semibold">{data.compliance?.score}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solar Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Solar Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>System Size:</span>
              <span className="font-medium">{data.siteInfo?.systemSize} kW</span>
            </div>
            <div className="flex justify-between">
              <span>Solar Irradiance:</span>
              <span className="font-medium">{data.solarData?.irradiance} kWh/m²/day</span>
            </div>
            <div className="flex justify-between">
              <span>Annual Output:</span>
              <span className="font-medium">{data.solarData?.annualOutput?.toLocaleString()} kWh</span>
            </div>
            <Separator />
            <div className="text-sm text-gray-600">
              Performance rating: {
                data.solarData?.irradiance >= 5.5 ? 'Excellent' :
                data.solarData?.irradiance >= 4.5 ? 'Good' :
                data.solarData?.irradiance >= 3.5 ? 'Fair' : 'Poor'
              }
            </div>
          </CardContent>
        </Card>

        {/* Financial Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Financial Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Monthly Usage:</span>
              <span className="font-medium">{data.savings?.currentUsage} kWh</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Savings:</span>
              <span className="font-medium text-green-600">₦{data.savings?.monthlySavings?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Annual Savings:</span>
              <span className="font-medium text-green-600">₦{data.savings?.annualSavings?.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="text-sm text-gray-600">
              PPA Rate: ₦180/kWh vs Grid: ₦225/kWh
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label htmlFor="email">Email Report (Optional)</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                variant="outline"
              >
                <Mail className="h-4 w-4 mr-2" />
                {isSendingEmail ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {viability.status === 'Highly Viable' ? (
              <>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Proceed with detailed engineering assessment</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Begin regulatory application process</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Develop customer PPA proposal</span>
                </div>
              </>
            ) : viability.status === 'Viable' ? (
              <>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <span>Address compliance gaps before proceeding</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <span>Consider system optimization opportunities</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Prepare preliminary customer discussions</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <span>Focus on mandatory compliance requirements first</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <span>Consider alternative sites or system configurations</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <span>Review economic assumptions and projections</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsStep;
