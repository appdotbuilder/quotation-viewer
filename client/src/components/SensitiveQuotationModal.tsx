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
          const sampleSensitiveData: SensitiveQuotation = {
            id: quotationId,
            buy_price: 45000 + (quotationId * 5000), // Varying prices based on ID
            sale_price: 67500 + (quotationId * 7500),
            margin: 22500 + (quotationId * 2500),
            profit: 22500 + (quotationId * 2500),
            cost_basis: 42000 + (quotationId * 4800),
            markup_percentage: 50 + (quotationId * 5),
            internal_notes: quotationId === 1 
              ? "High-priority client. Requires expedited processing and executive approval. Consider volume discount for future contracts."
              : quotationId === 2
              ? "Technical requirements verified. Client has existing infrastructure that may require additional integration costs."
              : quotationId === 3
              ? "Draft quotation pending cost analysis from engineering team. Await specifications from client before finalizing."
              : quotationId === 4
              ? "Client rejected initial proposal due to budget constraints. Alternative solution proposed at lower price point."
              : "Expired due to client non-response. Maintain relationship for future opportunities.",
            risk_level: quotationId <= 2 ? 'low' : quotationId <= 4 ? 'medium' : 'high',
            confidentiality_level: quotationId === 1 ? 'top_secret' : quotationId <= 3 ? 'confidential' : 'restricted'
          };
          setSensitiveData(sampleSensitiveData);
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