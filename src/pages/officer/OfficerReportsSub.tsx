import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { categories } from '@/lib/constants';
import type { FundReport } from '@/lib/constants';
import { FileText, DollarSign, Receipt } from 'lucide-react';
import { supabase } from '@/supabase-client';
import { toast } from 'sonner';

export const OfficerReportSub = () => {
  const [reports, setReports] = useState<FundReport[]>([]);
  const [reportLoading, setReportLoading] = useState<boolean>(false);

  useEffect(() => {
    const getAllReports = async () => {
      setReportLoading(true);
      const { data, error } = await supabase.from("fundReports").select("*");

      if (error) {
        toast.error("Error getting Reports");
        setReportLoading(false);
      } else {
        const filterData = data.filter((d) => d.sharedWith.includes("Finance Officer"));
        setReports(filterData);
        setReportLoading(false);

      }
    }
    getAllReports();
  }, []);

  const getCategoryTitle = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.title || categoryId;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance Reports</h1>
          <p className="text-muted-foreground">Review reports from Program Manager</p>
        </div>

        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText size={20} />
                        {report.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-2">
                          Period:{" "}
                          <span className="font-medium">
                            {report.periods?.from ?? 'Start'}
                          </span>
                          {" → "}
                          <span className="font-medium">
                            {report.periods?.to ?? 'Today'}
                          </span>
                        </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Created by {report.createdBy} on {new Date(report.created_at as string).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary">
                      From Program Manager
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <DollarSign size={16} />
                        <span className="text-sm">Total Funds Amount</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        Rs{report.totalFunds.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Receipt size={16} />
                        <span className="text-sm">Total Funds Transactions</span>
                      </div>
                      <p className="text-2xl font-bold">{report.transactionCount}</p>
                    </div>
                    
                  <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <DollarSign size={16} />
                        <span className="text-sm">Total Funds Distributed</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        Rs{report.totalDistributed.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Breakdown by Category:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                      {Object.entries(report.FundsByCategory).map(([catId, amount]) => (
                        <div key={catId} className="p-3 bg-secondary/50 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">{getCategoryTitle(catId)}</p>
                          <p className="font-bold">Rs{amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm font-medium mb-2 mt-2">Breakdown by Status:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                      {Object.entries(report.FundsByStatus).map(([catId, amount]) => (
                        <div key={catId} className="p-3 bg-secondary/50 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">{catId.charAt(0).toUpperCase() + catId.slice(1)}</p>
                          <p className="font-bold">Rs{amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reportLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">Loading reports ...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">No reports received yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};