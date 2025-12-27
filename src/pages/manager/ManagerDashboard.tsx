import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { categories } from '@/lib/constants';
import type { FundRequest, Distribution } from "@/lib/constants"
import { Send, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/supabase-client';
import { toast } from 'sonner';

export const ManagerDashboard = () => {
  const { session } = useAuth();
  const [stats, setStats] = useState({
    totalRequested: 0,
    pendingRequests: 0,
    approvedFunds: 0,
    distributedAmount: 0,
    myRequests: [] as FundRequest[],
    myDistributions: [] as Distribution[],
  });

  useEffect(() => {
    if (!session) return;

    const getAllFundsDash = async () => {
      const { data, error } = await supabase.from("funds").select("*");

      if (error) {
        toast.error("Error Fetching Funds");
        return;
      }

      if (data) {
        const totalRequested = data.reduce((sum, r) => sum + r.amount, 0);
        const approvedFunds = data
          .filter(r => r.status === 'approved')
          .reduce((sum, r) => sum + r.amount, 0);

        setStats((prev) => ({
          ...prev,
          totalRequested: totalRequested,
          pendingRequests: data.filter(r => r.status === 'pending').length,
          approvedFunds: approvedFunds,
          myRequests: data.slice(-5).reverse(),
        }))
      }
    }

    const getAllDistributionsDash = async () => {
      const { data, error } = await supabase.from("distributions").select("*").eq("distributedBy", session.user.email);

      if (error) {
        toast.error("Eror Fetching Distributions");
        return;
      }
      
      if (data) {
        const distributedAmount = data.reduce(
          (sum, d) => sum + d.beneficiaries.reduce((s: number, b: any) => s + Number(b.amount), 0), 
          0
        );
        setStats((prev) => ({
          ...prev,
          distributedAmount: distributedAmount,
          myDistributions: data,
        }))
      }

    }
    getAllFundsDash();
    getAllDistributionsDash();
  }, [session]);

  const getCategoryTitle = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.title || categoryId;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Program Manager Dashboard</h1>
          <p className="text-muted-foreground">Request and distribute funds for programs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Requested"
            value={`Rs${stats.totalRequested.toLocaleString()}`}
            icon={<Send size={24} />}
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            icon={<Clock size={24} />}
          />
          <StatCard
            title="Recieved Funds"
            value={`Rs${stats.approvedFunds.toLocaleString()}`}
            icon={<CheckCircle size={24} />}
          />
          <StatCard
            title="Distributed"
            value={`Rs${stats.distributedAmount.toLocaleString()}`}
            icon={<DollarSign size={24} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.myRequests.length > 0 ? (
                <div className="space-y-3">
                  {stats.myRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          Rs{request.amount.toLocaleString()} - {getCategoryTitle(request.category)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          request.status === 'approved' ? 'default' :
                            request.status === 'rejected' ? 'destructive' :
                              'secondary'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No requests yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Distributions</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.myDistributions.length > 0 ? (
                <div className="space-y-3">
                  {stats.myDistributions.map((dist) => (
                    <div
                      key={dist.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {getCategoryTitle(dist.category)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dist.beneficiaries.length} beneficiaries
                        </p>
                      </div>
                      <p className="font-bold text-primary">
                        Rs{dist.beneficiaries.reduce((s, b) => s + b.amount, 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No distributions yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
