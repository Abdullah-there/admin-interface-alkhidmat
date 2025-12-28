import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import type { Report, ExternalReport } from '@/lib/constants';
import { toast } from 'sonner';
import { Share2, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '@/supabase-client';

export const AdminShare = () => {
  const { session } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [externalReports, setExternalReports] = useState<ExternalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [shareTarget, setShareTarget] = useState<'auditor' | 'government' | ''>('');
  const [notes, setNotes] = useState('');
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportLoadingExternal, setReportLoadingExternal] = useState<boolean>(false);

  useEffect(() => {
    const getAllReports = async () => {
      setReportLoading(true);
      const { data, error } = await supabase.from("reports").select("*");

      if (error) {
        toast.error("Error getting Reports");
        setReportLoading(false);
      } else {
        const filterData = data.filter((d) => d.sharedWith.includes("Finance Administrator"));
        setReports(filterData);
        setReportLoading(false);
      }
    }
    const getExternalReportsAll = async () => {
      setReportLoadingExternal(true);
      const { data, error } = await supabase.from("externalReports").select("*");

      if (error) {
        toast.error("Error getting Reports");
        setReportLoadingExternal(false);
      } else {
        setExternalReports(data);
        setReportLoadingExternal(false);
      }
    }
    getAllReports();
    getExternalReportsAll();
  }, []);

  const ShareReport = async () => {
    if (!selectedReport || !shareTarget) {
      toast.error('Please select a report and share target');
      return;
    }

    const dataToAdd = {
      reportId: selectedReport,
      notes,
      sharedTo: shareTarget,
      sharedBy: session?.user.email || '',
    }
    const { error } = await supabase.from("externalReports").insert(dataToAdd).single();

    if (error) {
      toast.error("Error Sharing Report");
      console.error(error)
      return;
    }
    setExternalReports([{...dataToAdd, created_at: new Date().toISOString()}, ...externalReports])
    setSelectedReport('');
    setShareTarget('');
    setNotes('');
    toast.success(`Report shared with ${shareTarget} successfully!`);
  };

  const getReportTitle = (reportId: string) => {
    return reports.find(r => r.id === reportId)?.title || 'Unknown Report';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">External Sharing</h1>
          <p className="text-muted-foreground">Share reports with auditors and government</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 size={20} />
              Share Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Select Report</Label>
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a report" />
                  </SelectTrigger>
                  <SelectContent>
                    {reports.map((report) => (
                      <SelectItem key={report.id} value={report.id as string}>
                        {report.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Share With</Label>
                <Select value={shareTarget} onValueChange={(val) => setShareTarget(val as 'auditor' | 'government')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auditor">Auditor</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="Add any notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={1}
                />
              </div>
            </div>

            <Button onClick={ShareReport} className="mt-4">
              <ExternalLink size={16} className="mr-2" />
              Share Externally
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Shared Reports History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {externalReports.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Shared With</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Shared By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {externalReports.map((ext) => (
                    <TableRow key={ext.id}>
                      <TableCell className="font-medium">
                        {getReportTitle(ext.reportId)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ext.sharedTo === 'government' ? 'default' : 'secondary'}>
                          {ext.sharedTo}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {ext.notes || '-'}
                      </TableCell>
                      <TableCell>{ext.sharedBy}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(ext.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : reportLoadingExternal ? (
              <div className="text-center py-12 text-muted-foreground">
                <Share2 size={48} className="mx-auto mb-4 opacity-50" />
                <p>Loading External Reports Shared ...</p>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Share2 size={48} className="mx-auto mb-4 opacity-50" />
                <p>No reports shared externally yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
