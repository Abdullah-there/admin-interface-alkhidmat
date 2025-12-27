import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { categories } from '@/lib/constants';
import type { FundRequest } from '@/lib/constants';
import { toast } from 'sonner';
import { CheckCircle, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '@/supabase-client';

export const ManagerApproved = () => {
  const { session } = useAuth();
  const [approvedRequests, setApprovedRequests] = useState<FundRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!session) return;
    const getApprovedRequests = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from("funds").select("*").eq("status", "approved").eq("requestedBy", session.user.email);

      if (error)  {
        toast.error("Error Fetching requests");
        setIsLoading(false);
        return;
      }

      setApprovedRequests(data);
      setIsLoading(false);
    }
    getApprovedRequests();
  }, [])

  const getCategoryTitle = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.title || categoryId;
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || '#3b82f6';
  };

  const totalApproved = approvedRequests.reduce((sum, r) => sum + r.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recieved Funds</h1>
          <p className="text-muted-foreground">View your approved recieved fund requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Recieved</p>
                  <p className="text-3xl font-bold">Rs{totalApproved.toLocaleString()}</p>
                </div>
                <DollarSign size={40} className="opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recieved Requests</p>
                  <p className="text-3xl font-bold">{approvedRequests.length}</p>
                </div>
                <CheckCircle size={40} className="text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Request</p>
                  <p className="text-3xl font-bold">
                    Rs{approvedRequests.length > 0 
                      ? Math.round(totalApproved / approvedRequests.length).toLocaleString()
                      : 0}
                  </p>
                </div>
                <Calendar size={40} className="text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} />
              Recieved Fund Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {approvedRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="p-4 border border-border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge 
                        style={{ 
                          backgroundColor: getCategoryColor(request.category),
                          color: 'white'
                        }}
                      >
                        {getCategoryTitle(request.category)}
                      </Badge>
                      <Badge variant="default" className="bg-success">
                        Approved
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign size={24} className="text-primary" />
                      <span className="text-2xl font-bold">{request.amount.toLocaleString()}</span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {request.reason}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar size={14} />
                      <span>Approved: {request.approvedAt 
                        ? new Date(request.approvedAt).toLocaleDateString() 
                        : 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>No approved funds yet</p>
                <p className="text-sm">Loading Data ...</p>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>No approved funds yet</p>
                <p className="text-sm">Submit fund requests to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
