import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { categories } from '@/lib/constants';
import type { FundRequest, CategoryId } from "@/lib/constants";
import { toast } from 'sonner';
import { Send, ClipboardList } from 'lucide-react';
import { supabase } from '@/supabase-client';

export const ManagerRequest = () => {
  const { session } = useAuth();
  const [requests, setRequests] = useState<FundRequest[]>([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId | ''>('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!session) return
    const getAllFunds = async () => {
      const { data, error } = await supabase.from("funds").select("*");

      if (error) {
        toast.error("Error Fetching Funds")
      } else {
        setRequests(data);
      }
    }
    getAllFunds();
  }, [session]);

  const MakePaymentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !reason.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    const dataToAdd = {
      amount: amountNum,
      category: category as CategoryId,
      reason: reason,
      requestedBy: session?.user.email || '',
      status: "pending" as 'pending' | 'approved' | 'rejected',
      remainingAmount: amountNum,

    }

    const { error } = await supabase.from("funds").insert(dataToAdd).single();

    if (error) {
      toast.error("Error Making Fund Request");
      return;
    }

    setRequests([{...dataToAdd, created_at: new Date().toISOString()}, ...requests])
    setAmount('');
    setCategory('');
    setReason('');
    toast.success('Fund request submitted successfully!');
  };

  const getCategoryTitle = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.title || categoryId;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Request Funds</h1>
          <p className="text-muted-foreground">Submit fund requests to Finance Administrator</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send size={20} />
                New Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={MakePaymentRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (Rs)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={(val) => setCategory(val as CategoryId)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explain the purpose of this fund request..."
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send size={16} className="mr-2" />
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList size={20} />
                My Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-bold text-primary">
                            Rs{request.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getCategoryTitle(request.category)}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {request.reason}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                request.status === 'approved' ? 'default' : 
                                request.status === 'rejected' ? 'destructive' : 
                                'secondary'
                              }
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No fund requests submitted yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
