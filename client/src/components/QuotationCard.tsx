import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, User, Hash } from 'lucide-react';
import type { PublicQuotation } from '../../../server/src/schema';

interface QuotationCardProps {
  quotation: PublicQuotation;
  onClick: () => void;
}

export function QuotationCard({ quotation, onClick }: QuotationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'status-draft';
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'expired': return 'status-expired';
      default: return 'status-draft';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card 
      className="quotation-card cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900 leading-none">
              {quotation.title}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{quotation.client_name}</span>
            </div>
          </div>
          <Badge className={`status-badge ${getStatusColor(quotation.status)}`}>
            {quotation.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {quotation.description && (
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 line-clamp-2">
                {quotation.description}
              </p>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Hash className="h-4 w-4" />
            <span className="font-mono">{quotation.reference_number}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Created: {formatDate(quotation.created_at)}</span>
            </div>
            
            {quotation.expires_at && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Expires: {formatDate(quotation.expires_at)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}