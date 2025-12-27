import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { categories } from '@/lib/constants';
import type { FundRequest } from '@/lib/constants';
import { toast } from 'sonner';
import { ClipboardList, Check, X, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/supabase-client';

export const AdminRequests = () => {
  const [requests, setRequests] = useState<FundRequest[]>([]);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FundRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false)
  useEffect(() => {
    const getAllFundsRequest = async () => {
      console.log("here")
      setIsLoading(true)
      const { data, error } = await supabase.from("funds").select("*");
      console.log(data)

      if (error) {
        toast.error("Error Fetching Funds Request");
        setIsLoading(false);
      } else {
        setRequests(data);
        setIsLoading(false)
      }
    }
    getAllFundsRequest();
  }, []);

  const handleApprove = async (request: FundRequest) => {
    const { error } = await supabase
      .from("funds")
      .update({ status: "approved", approvedAt: new Date().toISOString() })
      .eq("id", request.id);

    if (error) {
      toast.error("Error Approving Funds");
      return;
    }

    setRequests(prev =>
      prev.map(req =>
        req.id === request.id ? { ...req, status: "approved" } : req
      )
    );

    toast.success(`Fund request for RsRs{request.amount} approved!`);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    const { error } = await supabase
      .from("funds")
      .update({
        status: "rejected",
        rejectionReason: rejectionReason,
      })
      .eq("id", selectedRequest.id);

    if (error) {
      toast.error("Error Rejecting Funds");
      return;
    }

    setRequests(prev =>
      prev.map(req =>
        req.id === selectedRequest.id
          ? { ...req, status: "rejected", rejectionReason }
          : req
      )
    );

    setRejectDialogOpen(false);
    setSelectedRequest(null);
    setRejectionReason("");
    toast.success("Fund request rejected");
  };

  const openRejectDialog = (request: FundRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const getCategoryTitle = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.title || categoryId;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check size={16} className="text-success" />;
      case 'rejected': return <X size={16} className="text-destructive" />;
      default: return <Clock size={16} className="text-warning" />;
    }
  };

  let pendingRequests = requests.filter(r => r.status === 'pending');
  let processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Namage Budget</h1>
          <p className="text-muted-foreground">Review and process fund requests from Program Managers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border border-border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={18} className="text-primary" />
                          <span className="text-xl font-bold">Rs{request.amount.toLocaleString()}</span>
                          <Badge variant="outline">{getCategoryTitle(request.category)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Requested by {request.requestedBy} on {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request)}
                          className="bg-green-500 hover:bg-green-400"
                        >
                          <Check size={16} className="mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          // variant="destructive"
                          className='bg-red-600 hover:bg-red-500'
                          onClick={() => openRejectDialog(request)}
                        >
                          <X size={16} className="mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Reason:</p>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <p>Loading Requests ...</p>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <p>No pending requests</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList size={20} />
              Processed Requests ({processedRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {processedRequests.length > 0 ? (
              <div className="space-y-3">
                {processedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <p className="font-medium">
                          Rs{request.amount.toLocaleString()} - {getCategoryTitle(request.category)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          By {request.requestedBy}
                        </p>
                        {request.rejectionReason && (
                          <p className="text-xs text-destructive mt-1">
                            Reason: {request.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={request.status === 'approved' ? 'default' : 'destructive'}
                    >
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading Request ...</p>
            ) : (
              <p className="text-muted-foreground text-center py-8">No processed requests yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Fund Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              You are about to reject a request for Rs{selectedRequest?.amount.toLocaleString()}
            </p>
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Input
                id="reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};
