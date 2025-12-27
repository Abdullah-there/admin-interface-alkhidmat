import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Report, FundRequest } from '@/lib/constants';
import { FileText, ClipboardList, Share2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/supabase-client';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    reportsCount: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    externalShares: 0,
    recentReports: [] as Report[],
    recentRequests: [] as FundRequest[],
  });

  useEffect(() => {
    const getAllReportsDash = async () => {
      const { data, error } = await supabase.from("reports").select("*");

      if (error) {
        toast.error("Error Fetching Reports");
        return;
      }

      setStats((prev) => ({
        ...prev, 
        reportsCount: data.length,
        recentReports: data.slice(-5).reverse()
      }))
    }

    const getAllFundsRequestDash = async () => {
      const { data, error } = await supabase.from("funds").select("*");

      if (error) {
        toast.error("Error Fetching Reports");
        return;
      }

      const pendingReq = data.filter((d) => d.status === "pending");
      const approvedReq = data.filter((d) => d.status === "approved");
      setStats((prev) => ({
        ...prev, 
        pendingRequests: pendingReq.length,
        approvedRequests: approvedReq.length,
        recentRequests: data.slice(-5).reverse()
      }))
    }

    const getAllExternalReportsDash = async () => {
      const { data, error } = await supabase.from("externalReports").select("*");

      if (error) {
        toast.error("Error Fetching Reports");
        return;
      }

      setStats((prev) => ({
        ...prev,
        externalShares: data.length
      }))
    }
    getAllReportsDash();
    getAllFundsRequestDash();
    getAllExternalReportsDash();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance Administrator Dashboard</h1>
          <p className="text-muted-foreground">Review reports and manage fund requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Incoming Reports"
            value={stats.reportsCount}
            icon={<FileText size={24} />}
            description="From Finance Officer"
          />
          <StatCard
            title="Pending Budget Requests"
            value={stats.pendingRequests}
            icon={<Clock size={24} />}
            description="Awaiting review"
          />
          <StatCard
            title="Approved Budget Funds"
            value={stats.approvedRequests}
            icon={<ClipboardList size={24} />}
          />
          <StatCard
            title="External Reports Shared"
            value={stats.externalShares}
            icon={<Share2 size={24} />}
            description="To auditors/govt"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentReports.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentReports.map((report) => (
                    <div 
                      key={report.id} 
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{report.title}</p>
                        <p className="text-xs text-muted-foreground">
                          By {report.createdBy}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">Rs{report.totalDonations.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.created_at as string).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No reports yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Fund Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentRequests.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">Rs{request.amount} - {request.category}</p>
                        <p className="text-xs text-muted-foreground">
                          By {request.requestedBy}
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
        </div>
      </div>
    </DashboardLayout>
  );
};
