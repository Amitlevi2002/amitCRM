import {
    TrendingUp,
    Users,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';


const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export default function Dashboard() {
    const navigate = useNavigate();

    // Fetch Stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['stats'],
        queryFn: api.stats.get,
    });

    // Fetch Recent Activities
    const { data: recentActivitiesData, isLoading: activitiesLoading } = useQuery({
        queryKey: ['activities'],
        queryFn: api.activities.list,
    });

    const recentActivities = Array.isArray(recentActivitiesData) ? recentActivitiesData : [];

    const stats = [
        { title: 'Total Revenue', value: statsData?.revenue ? `$${statsData.revenue.value.toLocaleString()}` : '$0', change: '+12.5%', isUp: true, icon: TrendingUp, color: 'text-emerald-500' },
        { title: 'New Leads', value: statsData?.leads ? statsData.leads.value : '0', change: '+18.2%', isUp: true, icon: Users, color: 'text-blue-500' },
        { title: 'Active Deals', value: statsData?.deals ? statsData.deals.value : '0', change: '-4.3%', isUp: false, icon: Target, color: 'text-amber-500' },
        { title: 'Win Rate', value: statsData?.winRate ? `${statsData.winRate.value}%` : '0%', change: '+2.1%', isUp: true, icon: ArrowUpRight, color: 'text-indigo-500' },
    ];

    return (
        <div className="space-y-6 md:y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-sm md:text-base text-slate-500">Real-time insights from your CRM.</p>
                </div>
                <Button
                    className="rounded-xl shadow-lg shadow-primary/20 gap-2 w-full sm:w-auto"
                    onClick={() => navigate('/contacts')}
                >
                    <Plus size={18} />
                    <span>New Contact</span>
                </Button>
            </div>

            {/* Stats Bento */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {stats.map((stat, i) => (
                    <motion.div key={i} variants={item}>
                        <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn("p-2 rounded-xl bg-slate-50", stat.color)}>
                                        <stat.icon size={24} />
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1 text-sm font-medium",
                                        stat.isUp ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                        {stat.change}
                                        {stat.isUp ? <TrendingUp size={14} /> : <ArrowDownRight size={14} />}
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                    {statsLoading ? '...' : stat.value}
                                </h3>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
                {/* Recent Activities - Large */}
                <Card className="xl:col-span-2 border-none shadow-sm rounded-3xl bg-white">
                    <CardHeader className="flex flex-row items-center justify-between px-8 pt-8">
                        <CardTitle className="text-xl font-bold">Recent Activities</CardTitle>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreVertical size={20} className="text-slate-400" />
                        </Button>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <div className="space-y-6">
                            {activitiesLoading ? (
                                <p className="text-center text-slate-500 py-8">Loading activities...</p>
                            ) : recentActivities.slice(0, 4).length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No recent activities.</p>
                            ) : (
                                recentActivities.slice(0, 4).map((act: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                                                <Plus size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{act.type}</h4>
                                                <p className="text-sm text-slate-500">{act.outcome}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-400">
                                            {new Date(act.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full mt-8 text-primary font-semibold rounded-xl underline-offset-4 hover:underline"
                            onClick={() => navigate('/activities')}
                        >
                            View All Activities
                        </Button>
                    </CardContent>
                </Card>

                {/* Mini Chart / Pipe */}
                <Card className="border-none shadow-sm rounded-3xl bg-primary text-white p-8 overflow-hidden relative">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Deal Pipeline</h3>
                        <p className="opacity-80 text-sm mb-6">Current active deals in negotiation stage.</p>
                        <div className="text-4xl font-bold tracking-tight mb-8">
                            {statsData ? `$${statsData.revenue.value.toLocaleString()}` : '...'}
                        </div>
                        <Button
                            className="bg-white text-primary hover:bg-slate-50 rounded-xl font-bold px-8"
                            onClick={() => navigate('/pipeline')}
                        >
                            Open Pipeline
                        </Button>
                    </div>
                    {/* Decorative Circle */}
                    <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                </Card>
            </div>
        </div>
    );
}
