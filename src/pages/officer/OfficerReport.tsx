import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { categories } from '@/lib/constants';
import type { Report } from '@/lib/constants';
import { toast } from 'sonner';
import { FileText, BarChart3, Share2 } from 'lucide-react';
import { supabase } from '@/supabase-client';

// type Report = {
//   id: string;
//   title: string;
//   totalDonations: number;
//   donationsByCategory: Record<string, number>;
//   transactionCount: number;
//   createdBy: string;
//   createdAt: string;
//   sharedWith?: string[];
// };

export const OfficerReports = () => {
  const { session } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [reportTitle, setReportTitle] = useState('');
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
     if (!session) return;
    const getAllReports = async () => {
      setReportLoading(true);const { data, error } = await supabase.from("reports").select("*").eq("createdBy", session?.user.email);

      if (error) {
        toast.error("Error getting Reports");
      setReportLoading(false);
      } else {
        console.log(data);
        setReports(data);
      setReportLoading(false);

      }
    }
    getAllReports();
  }, [session]);

  const GenerateReport = async () => {
    if (!reportTitle.trim()) {
      toast.error('Please enter a report title');
      return;
    }

    // const donations = getDonations();
    try {
      setLoading(true)
      const { data, error } = await supabase.from("donations").select("*");
  
      if (error) {
        toast.error('Error getting Donations');
        setLoading(false)
        return;
      }
      const totalDonations = data.reduce((sum, d) => sum + d.amount, 0);
      
      const donationsByCategory: Record<string, number> = {};
      data.forEach(d => {
        donationsByCategory[d.category] = (donationsByCategory[d.category] || 0) + d.amount;
      });
  
      const newReport = {
        title: reportTitle,
        totalDonations: totalDonations,
        donationsByCategory: donationsByCategory,
        transactionCount: data.length,
        createdBy: session?.user.email || '',
        sharedWith: ['Finance Administrator'],
      };
  
      await supabase.from("reports").insert(newReport).select("*").single();
  
      setReports([{...newReport, created_at: new Date().toISOString()}, ...reports]);
      setReportTitle('');
      toast.success('Report generated and shared with Finance Administrator!');
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
          <p className="text-muted-foreground">Generate and share financial reports</p>
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
                  placeholder="e.g., Monthly Finance Report - December 2024"
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
            <p className="text-sm text-muted-foreground mt-2">
              Reports are automatically shared with Finance Administrator
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
                          Created by {report.createdBy} on {new Date(report.created_at as string).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary">
                        Shared
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-xl font-bold text-primary">
                          ${report.totalDonations.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Transactions</p>
                        <p className="text-xl font-bold">{report.transactionCount}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">By Category:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(report.donationsByCategory).map(([catId, amount]) => (
                          <Badge key={catId} variant="secondary">
                            {getCategoryTitle(catId)}: ${amount.toLocaleString()}
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
