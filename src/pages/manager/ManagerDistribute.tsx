import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { categories } from '@/lib/constants';
import type { FundRequest, Distribution } from "@/lib/constants";
import { toast } from 'sonner';
import { DollarSign, Plus, Trash2, Users, CheckCircle } from 'lucide-react';
import { supabase } from '@/supabase-client';

interface Beneficiary {
  name: string;
  amount: number;
}

export const ManagerDistribute = () => {
  const { session } = useAuth();
  const [approvedRequests, setApprovedRequests] = useState<FundRequest[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [selectedRequest, setSelectedRequest] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([{ name: '', amount: 0 }]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!session) return;
    const getApprovedRequests = async () => {

      const { data, error } = await supabase.from("funds").select("*").eq("status", "approved").eq("requestedBy", session.user.email);

      if (error) {
        toast.error("Error Fetching requests");
        return;
      }

      setApprovedRequests(data);
    }
    const getAllDistributions = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from("distributions").select("*").eq("distributedBy", session.user.email);

      if (error) {
        toast.error("Error Fetching requests");
        setIsLoading(false);
        return;
      }
      setDistributions(data);
      setIsLoading(false);
    }
    getAllDistributions();
    getApprovedRequests();
  }, [session])

  const selectedFundRequest = approvedRequests.find(r => r.id === selectedRequest);
  const totalDistributed = beneficiaries.reduce((sum, b) => sum + (b.amount || 0), 0);
  const remainingAmount =
    (selectedFundRequest?.remainingAmount ?? selectedFundRequest?.amount ?? 0) -
    totalDistributed;

  const addBeneficiary = () => {
    setBeneficiaries([...beneficiaries, { name: '', amount: 0 }]);
  };

  const removeBeneficiary = (index: number) => {
    if (beneficiaries.length > 1) {
      setBeneficiaries(beneficiaries.filter((_, i) => i !== index));
    }
  };

  const updateBeneficiary = (index: number, field: keyof Beneficiary, value: string | number) => {
    const updated = [...beneficiaries];
    if (field === 'amount') {
      updated[index][field] = parseFloat(value as string) || 0;
    } else {
      updated[index][field] = value as string;
    }
    setBeneficiaries(updated);
  };

  const MakeDistribution = async () => {
    if (!selectedRequest) {
      toast.error('Please select a fund request');
      return;
    }

    const validBeneficiaries = beneficiaries.filter(b => b.name.trim() && b.amount > 0);
    if (validBeneficiaries.length === 0) {
      toast.error('Please add at least one beneficiary with name and amount');
      return;
    }

    if (remainingAmount < 0) {
      toast.error('Distribution exceeds approved amount');
      return;
    }

    setIsProcessing(true);

    const dataToAdd = {
      fundRequestId: selectedRequest,
      beneficiaries: validBeneficiaries,
      category: selectedFundRequest!.category,
      distributedBy: session?.user.email || '',
    }

    const { error } = await supabase.from("distributions").insert(dataToAdd).single();

    if (error) {
      toast.error("Error Saving Distributions");
      console.error(error);
      setIsProcessing(false);
      return;
    }

    await supabase.from("funds").update({ remainingAmount: remainingAmount }).eq("id", selectedRequest);

    setDistributions([{ ...dataToAdd, created_at: new Date().toISOString() }, ...distributions]);
    setApprovedRequests(prev =>
      prev.map(req =>
        req.id === selectedRequest
          ? { ...req, remainingAmount }
          : req
      )
    );

    setSelectedRequest('');

    setBeneficiaries([{ name: '', amount: 0 }]);
    toast.success('Funds distributed successfully!');
    setIsProcessing(false);
  };

  const getCategoryTitle = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.title || categoryId;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Distribute Funds</h1>
          <p className="text-muted-foreground">Allocate approved funds to beneficiaries</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={20} />
                New Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Approved Fund</Label>
                <Select value={selectedRequest} onValueChange={setSelectedRequest}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an approved request" />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedRequests.map((request) => (
                      <SelectItem key={request.id} value={request.id as string}>
                        Rs{request.amount.toLocaleString()} - {getCategoryTitle(request.category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFundRequest && (
                <>
                  <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                    <span className="text-sm">Available Amount:</span>
                    <span className={`font-bold ${remainingAmount < 0 ? 'text-destructive' : 'text-primary'}`}>
                      Rs{remainingAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Beneficiaries</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addBeneficiary}>
                        <Plus size={14} className="mr-1" />
                        Add
                      </Button>
                    </div>

                    {beneficiaries.map((beneficiary, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Input
                            placeholder="Beneficiary name"
                            value={beneficiary.name}
                            onChange={(e) => updateBeneficiary(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="w-32">
                          <Input
                            type="number"
                            placeholder="Amount"
                            min="0"
                            value={beneficiary.amount || ''}
                            onChange={(e) => updateBeneficiary(index, 'amount', e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBeneficiary(index)}
                          disabled={beneficiaries.length === 1}
                        >
                          <Trash2 size={16} className="text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={MakeDistribution}
                    className="w-full"
                    disabled={remainingAmount < 0 || isProcessing}
                  >
                    <CheckCircle size={16} className="mr-2" />
                    {isProcessing ? "Distributing" : "Distribute Funds"}
                  </Button>
                </>
              )}

              {approvedRequests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No approved funds to distribute</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Distribution History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {distributions.length > 0 ? (
                <div className="space-y-4">
                  {distributions.map((dist) => (
                    <div
                      key={dist.id}
                      className="p-4 border border-border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {getCategoryTitle(dist.category)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(dist.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {dist.beneficiaries.map((b, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>{b.name}</span>
                            <span className="font-medium">Rs{b.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-border flex justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-bold text-primary">
                          Rs{dist.beneficiaries.reduce((s, b) => s + b.amount, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Loading Distributions</p>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No distributions recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
