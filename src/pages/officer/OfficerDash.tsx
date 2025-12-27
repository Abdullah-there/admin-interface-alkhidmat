import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { StatCard } from '@/components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categories } from '@/lib/constants';
import type { Donation } from '@/lib/constants';
import { DollarSign, MessageSquare, FileText, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/supabase-client'

const OfficerLoading = () => {
    const { session, loading } = useAuth();
    const [stats, setStats] = useState({
        totalDonations: 0,
        totalAmount: 0,
        messagesCount: 0,
        reportsCount: 0,
        usersCount: 0,
        recentDonations: [] as Donation[],
    });

    useEffect(() => {
        if (!session || loading) return;
        const getData = async () => {
            const { data, error } = await supabase.from("donations").select("*");

            if (error) {
                console.log(error)
                return
            }
            const totalAmount = data.reduce((sum, d) => sum + d.amount, 0);
            const users = new Set(data.map(d => d.user_email)).size;

            setStats((prev) => ({
                ...prev,
                totalDonations: data.length,
                totalAmount: totalAmount,
                usersCount: users,
                recentDonations: data.slice(-5).reverse(),
            }));
        }
        const getMessages = async () => {
            const { data, error } = await supabase.from("acknowledgment").select("*").eq("message_by", session?.user.email);

            if (error) {
                console.log(error)
                return
            }

            setStats((prev) => ({ ...prev, messagesCount: data.length }));
        }
        const getReports = async () => {
            const { data, error } = await supabase.from("reports").select("*").eq("createdBy", session?.user.email);

            if (error) {
                console.log(error)
                return
            }

            setStats((prev) => ({ ...prev, reportsCount: data.length }));
        }
        getData();
        getMessages();
        getReports();
    }, [session, loading])

    const getCategoryTitle = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.title || categoryId;
    };


    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Finance Officer Dashboard</h1>
                    <p className="text-muted-foreground">Manage donations, users, and reports</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Donations"
                        value={stats.totalDonations}
                        icon={<DollarSign size={24} />}
                        description="All time transactions"
                    />
                    <StatCard
                        title="Total Amount"
                        value={`Rs${stats.totalAmount.toLocaleString()}`}
                        icon={<TrendingUp size={24} />}
                        description="Collected donations"
                    />
                    <StatCard
                        title="Messages Sent"
                        value={stats.messagesCount}
                        icon={<MessageSquare size={24} />}
                    />
                    <StatCard
                        title="Reports Generated"
                        value={stats.reportsCount}
                        icon={<FileText size={24} />}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Donations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.recentDonations.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.recentDonations.map((donation) => (
                                        <div
                                            key={donation.id}
                                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium text-sm">{donation.user_email}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {getCategoryTitle(donation.category)} • {donation.payment_method}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">Rs{donation.amount}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(donation.created_at as string).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No donations yet</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Users className="text-primary" size={20} />
                                        <span className="font-medium">Active Donors</span>
                                    </div>
                                    <span className="font-bold">{stats.usersCount}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="text-primary" size={20} />
                                        <span className="font-medium">Avg. Donation</span>
                                    </div>
                                    <span className="font-bold">
                                        Rs{stats.totalDonations > 0
                                            ? Math.round(stats.totalAmount / stats.totalDonations)
                                            : 0}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default OfficerLoading