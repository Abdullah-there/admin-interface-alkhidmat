import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { categories, paymentMethods } from '@/lib/constants';
import type { Donation, CategoryId, PaymentMethod } from "@/lib/constants"
import { toast } from 'sonner';
import { DollarSign, Plus, Receipt } from 'lucide-react';
import { supabase } from '@/supabase-client';

export const OfficerDonations = () => {
  const { session } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [userEmail, setUserEmail] = useState(session?.user.email || '');
  const [category, setCategory] = useState<CategoryId | ''>('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    const getAllDonations = async () => {
      const { data, error } = await supabase.from("donations").select("*");

      if (error) {
        toast.error('Error getting Donations');
        setLoading(false)
        return;
      }
      setDonations(data);
    }
    getAllDonations();
  }, []);

  const selectedCategory = categories.find(c => c.id === category);

  const MakeDonation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userEmail || !category || !amount || !paymentMethod) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);

    const data = {
      user_email: userEmail,
      category: category as CategoryId,
      amount: amountNum,
      payment_method: paymentMethod,
      status: "success" as any,
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    };

    const notiData = {
      user_email: userEmail,
      title: "Payment Confirmed",
      message : `Your Payment of ${category} with an amount of Rs. ${amountNum} using ${paymentMethod} as payment Method with TransactionId: ${data.transactionId} is confirmed.`,
    }

    const {error} = await supabase.from("donations").insert(data).select().single();

    if (error) {
      toast.error("Error Saving Donation")
      return;
    }

    await supabase.from("acknowledgment").insert(notiData).single();

    setDonations([{...data, created_at: new Date().toISOString()}, ...donations]);
    toast.success(`Donation recorded! Transaction ID: ${data.transactionId}`);

    setAmount('');
    setIsProcessing(false);

  };

  const getCategoryColor = (categoryId: string) => {
    const categoryName = categoryId.split(" ");
    const cat = categories.find(c => c.id === categoryName[0].toLowerCase());
    return cat?.color || '#3b82f6';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Donations</h1>
          <p className="text-muted-foreground">Record and manage donation transactions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus size={20} />
                Record Donation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={MakeDonation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Donor Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="donor@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
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
                  <Label htmlFor="amount">Amount (Rs)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder={"Enter Amount"}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  {selectedCategory && (
                    <p className="text-xs text-muted-foreground">
                      {selectedCategory.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={isProcessing}>
                  <DollarSign size={16} className="mr-2" />
                  {isProcessing ? "Recording" : "Record Donation"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt size={20} />
                Donation Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {donations.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Donor</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donations.map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell className="font-mono text-xs">
                            {donation.transactionId}
                          </TableCell>
                          <TableCell>{donation.user_email}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{ borderColor: getCategoryColor(donation.category) }}
                            >
                              {donation.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-primary">
                            Rs{donation.amount}
                          </TableCell>
                          <TableCell>{donation.payment_method}</TableCell>
                          <TableCell>
                            <Badge variant="default" className={`text-black ${donation.status === "success" ? "bg-green-500" : donation.status === "pending" ? "bg-yellow-500" : "bg-red-500"}`}>
                              {donation.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(donation.created_at as string).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Loading Donation ...</p>
                </div>
              ) :(
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No donations recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
