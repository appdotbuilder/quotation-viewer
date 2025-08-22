import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, DollarSign, TrendingUp, Shield, Eye, FileX, Loader2 } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { SensitiveQuotation } from '../../../server/src/schema';

interface SensitiveQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationId: number | null;
  quotationTitle?: string;
}

export function SensitiveQuotationModal({ 
  isOpen, 
  onClose, 
  quotationId, 
  quotationTitle 
}: SensitiveQuotationModalProps) {
  const [sensitiveData, setSensitiveData] = useState<SensitiveQuotation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !quotationId) {
      setSensitiveData(null);
      setError(null);
      return;
    }

    const loadSensitiveData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await trpc.getSensitiveQuotationData.query({ id: quotationId });
        
        // Since backend handlers are stubs returning null, we'll use sample sensitive data
        // STUB: This should be replaced when real backend handlers are implemented
        if (!data) {
          // Demo sensitive data - this would normally come from the backend
          const getSampleSensitiveData = (id: number): SensitiveQuotation => {
            const sensitiveDataMap: Record<number, SensitiveQuotation> = {
              1: {
                id: 1,
                buy_price: 125000.00,
                sale_price: 187500.00,
                margin: 62500.00,
                profit: 60000.00,
                cost_basis: 120000.00,
                markup_percentage: 56.25,
                internal_notes: "High-priority client with enterprise-level requirements. Board approval required for contracts over $150K. Volume discount negotiated for multi-year commitment. Executive sponsor: CEO directly involved.",
                risk_level: 'low',
                confidentiality_level: 'top_secret'
              },
              2: {
                id: 2,
                buy_price: 89500.00,
                sale_price: 134250.00,
                margin: 44750.00,
                profit: 42000.00,
                cost_basis: 85000.00,
                markup_percentage: 58.07,
                internal_notes: "Technical requirements verified with client's existing AWS infrastructure. Additional migration costs may apply. Client has budget approval secured through Q2.",
                risk_level: 'low',
                confidentiality_level: 'confidential'
              },
              3: {
                id: 3,
                buy_price: 78000.00,
                sale_price: 117000.00,
                margin: 39000.00,
                profit: 36500.00,
                cost_basis: 76500.00,
                markup_percentage: 52.94,
                internal_notes: "Draft pending final IoT sensor specifications from engineering team. Manufacturing client requires 24/7 uptime SLA. Consider extended warranty options.",
                risk_level: 'medium',
                confidentiality_level: 'confidential'
              },
              4: {
                id: 4,
                buy_price: 156000.00,
                sale_price: 234000.00,
                margin: 78000.00,
                profit: 72000.00,
                cost_basis: 150000.00,
                markup_percentage: 56.00,
                internal_notes: "Client rejected initial proposal citing budget constraints. Alternative phased implementation approach proposed at 30% reduced cost. Compliance audit required.",
                risk_level: 'medium',
                confidentiality_level: 'restricted'
              },
              5: {
                id: 5,
                buy_price: 94750.00,
                sale_price: 142125.00,
                margin: 47375.00,
                profit: 44500.00,
                cost_basis: 92000.00,
                markup_percentage: 54.48,
                internal_notes: "HIPAA compliance critical - no room for errors. Legal review completed. Client relationship expired due to procurement delays on their end.",
                risk_level: 'high',
                confidentiality_level: 'restricted'
              },
              6: {
                id: 6,
                buy_price: 245000.00,
                sale_price: 367500.00,
                margin: 122500.00,
                profit: 115000.00,
                cost_basis: 238000.00,
                markup_percentage: 54.40,
                internal_notes: "Large-scale retail implementation across 150 locations. Hardware procurement lead time 8-10 weeks. Training program for 300+ staff members included in scope.",
                risk_level: 'medium',
                confidentiality_level: 'confidential'
              },
              7: {
                id: 7,
                buy_price: 189000.00,
                sale_price: 283500.00,
                margin: 94500.00,
                profit: 88750.00,
                cost_basis: 182500.00,
                markup_percentage: 55.34,
                internal_notes: "Energy sector client with critical infrastructure requirements. Security clearance may be required for development team. Approved for implementation.",
                risk_level: 'low',
                confidentiality_level: 'top_secret'
              },
              8: {
                id: 8,
                buy_price: 67500.00,
                sale_price: 101250.00,
                margin: 33750.00,
                profit: 32000.00,
                cost_basis: 65500.00,
                markup_percentage: 54.58,
                internal_notes: "Educational sector pricing with non-profit discount applied. Summer deployment window critical due to academic calendar. Teacher training workshops scheduled.",
                risk_level: 'low',
                confidentiality_level: 'restricted'
              },
              9: {
                id: 9,
                buy_price: 134000.00,
                sale_price: 201000.00,
                margin: 67000.00,
                profit: 62500.00,
                cost_basis: 129000.00,
                markup_percentage: 55.81,
                internal_notes: "Fleet tracking solution for 200+ vehicles. Client concerns about driver privacy regulations. Rejected due to competitors offering integrated telematics at lower cost.",
                risk_level: 'high',
                confidentiality_level: 'restricted'
              },
              10: {
                id: 10,
                buy_price: 198500.00,
                sale_price: 297750.00,
                margin: 99250.00,
                profit: 93000.00,
                cost_basis: 192000.00,
                markup_percentage: 55.21,
                internal_notes: "FDA validation requirements add complexity. Clinical trials data integration critical for regulatory compliance. Approved with accelerated timeline for Q2 go-live.",
                risk_level: 'low',
                confidentiality_level: 'top_secret'
              },
              11: {
                id: 11,
                buy_price: 175000.00,
                sale_price: 262500.00,
                margin: 87500.00,
                profit: 82000.00,
                cost_basis: 170000.00,
                markup_percentage: 54.41,
                internal_notes: "Construction project management for $2B+ infrastructure projects. Integration with existing SAP systems required. Expired due to client budget freeze.",
                risk_level: 'high',
                confidentiality_level: 'confidential'
              },
              12: {
                id: 12,
                buy_price: 112000.00,
                sale_price: 168000.00,
                margin: 56000.00,
                profit: 52500.00,
                cost_basis: 108000.00,
                markup_percentage: 55.56,
                internal_notes: "Multi-property hotel chain implementation. PCI compliance for payment processing mandatory. Revenue management algorithms proprietary - additional IP licensing fees may apply.",
                risk_level: 'medium',
                confidentiality_level: 'confidential'
              }
            };
            
            return sensitiveDataMap[id] || {
              id: id,
              buy_price: 50000 + (id * 7500),
              sale_price: 75000 + (id * 11250),
              margin: 25000 + (id * 3750),
              profit: 23500 + (id * 3500),
              cost_basis: 48000 + (id * 7200),
              markup_percentage: 50 + (id * 2),
              internal_notes: `Quotation ${id} - Standard commercial engagement with baseline requirements. Further analysis pending client specifications.`,
              risk_level: id % 3 === 0 ? 'high' : id % 2 === 0 ? 'medium' : 'low',
              confidentiality_level: id % 4 === 1 ? 'top_secret' : id % 3 === 0 ? 'confidential' : 'restricted'
            };
          };
          
          setSensitiveData(getSampleSensitiveData(quotationId));
        } else {
          setSensitiveData(data);
        }
      } catch (err) {
        console.error('Failed to load sensitive data:', err);
        setError('Failed to load quotation details');
      } finally {
        setIsLoading(false);
      }
    };

    loadSensitiveData();
  }, [isOpen, quotationId]);

  // Security: Disable context menu, key combinations, and print
  useEffect(() => {
    if (!isOpen) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable common copy/save/print shortcuts
      if (
        (e.ctrlKey || e.metaKey) && 
        (e.key === 'c' || e.key === 's' || e.key === 'p' || e.key === 'a' || 
         e.key === 'u' || e.key === 'i' || e.key === 'j')
      ) {
        e.preventDefault();
        return false;
      }
      // Disable F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Disable Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
    };

    const handleVisibilityChange = () => {
      // Close modal if user switches tabs (potential screenshot attempt)
      if (document.hidden && isOpen) {
        onClose();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen, onClose]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case 'low': return 'risk-low border';
      case 'medium': return 'risk-medium border';
      case 'high': return 'risk-high border';
      default: return 'risk-medium border';
    }
  };

  const getConfidentialityBadgeClass = (level: string) => {
    switch (level) {
      case 'restricted': return 'confidentiality-restricted border';
      case 'confidential': return 'confidentiality-confidential border';
      case 'top_secret': return 'confidentiality-top_secret border';
      default: return 'confidentiality-restricted border';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden secure-content no-select">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span>Sensitive Financial Data</span>
            </DialogTitle>
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <Eye className="h-4 w-4" />
              <span>Confidential</span>
            </div>
          </div>
          {quotationTitle && (
            <p className="text-sm text-gray-600 mt-1">{quotationTitle}</p>
          )}
        </DialogHeader>

        <div className="overflow-y-auto hide-scrollbar max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading sensitive data...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2 text-red-600">
                <FileX className="h-6 w-6" />
                <span>{error}</span>
              </div>
            </div>
          ) : sensitiveData ? (
            <div className="space-y-6 p-1">
              {/* Security Classification */}
              <div className="flex items-center justify-center space-x-4 py-2">
                <Badge className={getRiskBadgeClass(sensitiveData.risk_level)}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Risk: {sensitiveData.risk_level.toUpperCase()}
                </Badge>
                <Badge className={getConfidentialityBadgeClass(sensitiveData.confidentiality_level)}>
                  <Shield className="h-3 w-3 mr-1" />
                  {sensitiveData.confidentiality_level.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              {/* Financial Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>Financial Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium">Buy Price</div>
                        <div className="text-2xl font-bold text-blue-900">
                          {formatCurrency(sensitiveData.buy_price)}
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-600 font-medium">Sale Price</div>
                        <div className="text-2xl font-bold text-green-900">
                          {formatCurrency(sensitiveData.sale_price)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 font-medium">Profit</div>
                        <div className="text-2xl font-bold text-purple-900">
                          {formatCurrency(sensitiveData.profit)}
                        </div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-sm text-orange-600 font-medium">Margin</div>
                        <div className="text-2xl font-bold text-orange-900">
                          {formatCurrency(sensitiveData.margin)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    <span>Cost Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Cost Basis</span>
                        <span className="font-semibold">{formatCurrency(sensitiveData.cost_basis)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Markup Percentage</span>
                        <span className="font-semibold text-green-600">
                          {formatPercentage(sensitiveData.markup_percentage)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Total Value</div>
                        <div className="text-3xl font-bold text-gray-900">
                          {formatCurrency(sensitiveData.sale_price)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Internal Notes */}
              {sensitiveData.internal_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Internal Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {sensitiveData.internal_notes}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Warning Footer */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">CONFIDENTIAL INFORMATION</p>
                    <p>
                      This financial data is strictly confidential and proprietary. 
                      Unauthorized disclosure, reproduction, or distribution is prohibited 
                      and may result in legal action.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}