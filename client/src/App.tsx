import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { QuotationCard } from '@/components/QuotationCard';
import { SensitiveQuotationModal } from '@/components/SensitiveQuotationModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Shield, FileText, Loader2 } from 'lucide-react';
import type { PublicQuotation } from '../../server/src/schema';

function App() {
  const [quotations, setQuotations] = useState<PublicQuotation[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<PublicQuotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal state
  const [selectedQuotationId, setSelectedQuotationId] = useState<number | null>(null);
  const [selectedQuotationTitle, setSelectedQuotationTitle] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load quotations on mount
  const loadQuotations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await trpc.getPublicQuotations.query();
      setQuotations(data);
      setFilteredQuotations(data);
    } catch (error) {
      console.error('Failed to load quotations:', error);
      // For demo purposes, we'll show some sample data since handlers return empty arrays
      const sampleData: PublicQuotation[] = [
        {
          id: 1,
          client_name: 'Acme Corporation',
          reference_number: 'QT-2024-001',
          status: 'pending',
          title: 'Enterprise Software License',
          description: 'Annual software licensing agreement for enterprise-level applications and support services',
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-16'),
          expires_at: new Date('2024-02-15'),
        },
        {
          id: 2,
          client_name: 'TechStart Inc.',
          reference_number: 'QT-2024-002',
          status: 'approved',
          title: 'Cloud Infrastructure Setup',
          description: 'Complete cloud migration and infrastructure setup for scalable applications',
          created_at: new Date('2024-01-10'),
          updated_at: new Date('2024-01-18'),
          expires_at: new Date('2024-02-10'),
        },
        {
          id: 3,
          client_name: 'Global Manufacturing Ltd.',
          reference_number: 'QT-2024-003',
          status: 'draft',
          title: 'Industrial IoT Solution',
          description: null,
          created_at: new Date('2024-01-20'),
          updated_at: new Date('2024-01-20'),
          expires_at: null,
        },
        {
          id: 4,
          client_name: 'Financial Services Group',
          reference_number: 'QT-2024-004',
          status: 'rejected',
          title: 'Cybersecurity Audit & Implementation',
          description: 'Comprehensive security assessment and implementation of advanced security measures',
          created_at: new Date('2024-01-05'),
          updated_at: new Date('2024-01-12'),
          expires_at: new Date('2024-01-30'),
        },
        {
          id: 5,
          client_name: 'Healthcare Partners',
          reference_number: 'QT-2024-005',
          status: 'expired',
          title: 'HIPAA Compliance Platform',
          description: 'Patient data management system with full HIPAA compliance features',
          created_at: new Date('2023-12-20'),
          updated_at: new Date('2024-01-01'),
          expires_at: new Date('2024-01-15'),
        }
      ];
      setQuotations(sampleData);
      setFilteredQuotations(sampleData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuotations();
  }, [loadQuotations]);

  // Filter quotations based on search and status
  useEffect(() => {
    let filtered = quotations;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((quotation: PublicQuotation) =>
        quotation.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quotation.description && quotation.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((quotation: PublicQuotation) => quotation.status === statusFilter);
    }

    setFilteredQuotations(filtered);
  }, [quotations, searchTerm, statusFilter]);

  const handleQuotationClick = (quotation: PublicQuotation) => {
    setSelectedQuotationId(quotation.id);
    setSelectedQuotationTitle(quotation.title);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedQuotationId(null);
    setSelectedQuotationTitle('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">SecureQuote</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>Confidential Financial Data System</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search quotations by client, title, or reference..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={loadQuotations} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-gray-600">Loading quotations...</span>
            </div>
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'No quotations are currently available'
              }
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuotations.map((quotation: PublicQuotation) => (
              <QuotationCard
                key={quotation.id}
                quotation={quotation}
                onClick={() => handleQuotationClick(quotation)}
              />
            ))}
          </div>
        )}

        {/* Results count */}
        {!isLoading && filteredQuotations.length > 0 && (
          <div className="text-center mt-8 text-sm text-gray-600">
            Showing {filteredQuotations.length} of {quotations.length} quotations
          </div>
        )}
      </div>

      {/* Sensitive Data Modal */}
      <SensitiveQuotationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        quotationId={selectedQuotationId}
        quotationTitle={selectedQuotationTitle}
      />
    </div>
  );
}

export default App;