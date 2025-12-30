import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { categories } from '@/lib/constants';
import type { FundReport } from '@/lib/constants';
import { toast } from 'sonner';
import { FileText, BarChart3, Share2 } from 'lucide-react';
import { supabase } from '@/supabase-client';

export const ManagerReports = () => {
  const { session } = useAuth();
  const [reports, setReports] = useState<FundReport[]>([]);
  const [reportTitle, setReportTitle] = useState('');
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>(''); 

  useEffect(() => {
    if (!session) return;
    const getAllFunds = async () => {
      setReportLoading(true);
      const { data, error } = await supabase.from("fundReports").select("*").eq("createdBy", session?.user.email);

      if (error) {
        toast.error("Error getting Funds");
        setReportLoading(false);
      } else {
        console.log(data);
        setReports(data);
        setReportLoading(false);
      }
    }
    getAllFunds();
  }, [session]);

  const GenerateReport = async () => {
    if (!reportTitle.trim()) {
      toast.error('Please enter a report title');
      return;
    }

    try {
      setLoading(true)

      let query = supabase.from("funds").select("*").eq("requestedBy", session?.user.email);

      if (fromDate) {
        query = query.gte("created_at", fromDate);
      }

      if (toDate) {
        query = query.lte("created_at", toDate);
      }

      console.log(query)
      const { data, error } = await query;

      if (error) {
        toast.error('Error getting Funds');
        setLoading(false)
        return;
      }

      let query2 = supabase.from("distributions").select("*").eq("distributedBy", session?.user.email);

      if (fromDate) {
        query = query.gte("created_at", fromDate);
      }

      if (toDate) {
        query = query.lte("created_at", toDate);
      }

      const { data: dis, error: err } = await query2;

      if (err) {
        toast.error("Error Getting Distributions");
        return;
      }

      const totalFunds = data.reduce((sum, d) => sum + d.amount, 0);

      const FundsByCategory: Record<string, number> = {};
      data.forEach(d => {
        FundsByCategory[d.category] = (FundsByCategory[d.category] || 0) + d.amount;
      });

      const FundsByStatus: Record<string, number> = {};
      data.forEach(d => {
        FundsByStatus[d.status] = (FundsByStatus[d.status] || 0) + d.amount;
      });

      const totalDistributed = dis.reduce(
        (sum, record) =>
          sum +
          record.beneficiaries.reduce(
            (s: number, b: any) => s + (b.amount || 0), 0), 0 );

      const newReport = {
        title: reportTitle,
        totalFunds: totalFunds,
        totalDistributed: totalDistributed,
        FundsByCategory: FundsByCategory,
        periods: {
          from: fromDate || 'Start',
          to: toDate || 'Today',
        },
        FundsByStatus: FundsByStatus,
        transactionCount: data.length,
        createdBy: session?.user.email || '',
        sharedWith: ['Finance Officer'],
      };

      const { error: e } = await supabase
        .from("fundReports")
        .insert(newReport);

      if (e) {
        console.error(error);
        toast.error("Insert failed");
        setLoading(false);
        return;
      }


      setReports([{ ...newReport, created_at: new Date().toISOString() }, ...reports]);
      console.log([{ ...newReport, created_at: new Date().toISOString() }, ...reports])
      setReportTitle('');
      toast.success('Report generated and shared with Finance Officer!');
      setLoading(false);

    } catch (error) {
      toast.error("Error Generating Report. Try Again Later!")
      setLoading(false)
    }
  };

  const getCategoryTitle = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.title || categoryId;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and share Funds/Distribution reports</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Generate New Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="reportTitle">Report Title</Label>
                <Input
                  id="reportTitle"
                  placeholder="e.g., Monthly Funds Report - December 2024"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={GenerateReport} disabled={loading}>
                  <Share2 size={16} className="mr-2" />
                  {loading ? "Generating ..." : "Generate & Share"}
                </Button>
              </div>
            </div>
            <div className="flex gap-20 mt-5 mb-3">
              <div className="flex gap-3 items-center">
                <Label>From</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div className="flex gap-3 items-center">
                <Label>To</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Reports are automatically shared with Finance Officer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Generated Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 border border-border rounded-lg space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{report.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Period:{" "}
                          <span className="font-medium">
                            {report.periods?.from ?? 'Start'}
                          </span>
                          {" → "}
                          <span className="font-medium">
                            {report.periods?.to ?? 'Today'}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Created by {report.createdBy} on {new Date(report.created_at as string).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary">
                        Shared
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Funds Amount</p>
                        <p className="text-xl font-bold text-primary">
                          Rs{report.totalFunds.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Funds Transactions</p>
                        <p className="text-xl font-bold">{report.transactionCount}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Funds Distributed</p>
                        <p className="text-xl font-bold text-primary">
                          Rs{report.totalDistributed.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">By Category:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(report.FundsByCategory).map(([catId, amount]) => (
                          <Badge key={catId} variant="secondary">
                            {getCategoryTitle(catId)}: Rs{amount.toLocaleString()}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(report.FundsByStatus).map(([catId, amount]) => (
                          <Badge key={catId} variant="secondary">
                            {catId.charAt(0).toUpperCase() + catId.slice(1)}: Rs{amount.toLocaleString()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reportLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>Loading Reports</p>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No reports generated yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
