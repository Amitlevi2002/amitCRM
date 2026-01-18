import {
    TrendingUp,
    Users,
    Target,
    ArrowDownRight,
    Plus,
    MoreVertical,
    DollarSign,
    Briefcase
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
    hidden: { y: 30, opacity: 0 },
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
        { title: 'Total Revenue', value: statsData?.revenue ? `$${statsData.revenue.value.toLocaleString()}` : '$0', change: '+12.5%', isUp: true, icon: DollarSign, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
        { title: 'New Leads', value: statsData?.leads ? statsData.leads.value : '0', change: '+18.2%', isUp: true, icon: Users, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
        { title: 'Active Deals', value: statsData?.deals ? statsData.deals.value : '0', change: '-4.3%', isUp: false, icon: Briefcase, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
        { title: 'Win Rate', value: statsData?.winRate ? `${statsData.winRate.value}%` : '0%', change: '+2.1%', isUp: true, icon: Target, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    ];

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's your daily overview.</p>
                </div>
                <Button
                    className="rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow gap-2 h-11 px-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    onClick={() => navigate('/contacts')}
                >
                    <Plus size={18} className="text-white" />
                    <span className="text-white font-semibold">New Contact</span>
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
                    <motion.div key={i} variants={item} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                        <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative group">
                            {/* Glossy shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn("p-3 rounded-2xl transition-colors", stat.color)}>
                                        <stat.icon size={24} />
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full bg-white/50 dark:bg-slate-800/50",
                                        stat.isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                    )}>
                                        {stat.change}
                                        {stat.isUp ? <TrendingUp size={14} /> : <ArrowDownRight size={14} />}
                                    </div>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.title}</p>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
                                    {statsLoading ? '...' : stat.value}
                                </h3>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Activities - Large */}
                <motion.div variants={item} initial="hidden" animate="show" className="xl:col-span-2">
                    <Card className="h-full border-none shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between px-6 pt-6">
                            <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">Recent Activities</CardTitle>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                <MoreVertical size={20} className="text-slate-400" />
                            </Button>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                            <div className="space-y-1">
                                {activitiesLoading ? (
                                    <p className="text-center text-slate-500 py-12">Loading activities...</p>
                                ) : recentActivities.slice(0, 5).length === 0 ? (
                                    <p className="text-center text-slate-500 py-12">No recent activities.</p>
                                ) : (
                                    recentActivities.slice(0, 5).map((act: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between group cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex-shrink-0 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <Briefcase size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">{act.type}</h4>
                                                    <p className="text-sm text-slate-500 truncate">{act.outcome}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-slate-400 flex-shrink-0 ml-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                                {new Date(act.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full mt-6 text-primary font-semibold rounded-xl hover:bg-primary/5 h-12"
                                onClick={() => navigate('/activities')}
                            >
                                View All Activities
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Mini Chart / Pipe */}
                <motion.div variants={item} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
                    <Card className="h-full border-none shadow-xl bg-gradient-to-br from-primary to-purple-700 text-white p-8 overflow-hidden relative group">
                        <div className="relative z-10 flex flex-col h-full">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Deal Pipeline</h3>
                                <p className="text-white/80 text-sm mb-6 max-w-[80%]">Track your active deals and forecast revenue.</p>
                            </div>

                            <div className="mt-auto">
                                <div className="text-5xl font-bold tracking-tight mb-8 drop-shadow-md">
                                    {statsData ? `$${statsData.revenue.value.toLocaleString()}` : <span className="text-3xl opacity-50">...</span>}
                                </div>
                                <Button
                                    className="w-full bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/20 rounded-xl font-bold h-12 text-base transition-transform hover:scale-105"
                                    onClick={() => navigate('/pipeline')}
                                >
                                    Open Pipeline
                                </Button>
                            </div>
                        </div>

                        {/* 3D Decorative Elements */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
                        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>

                        {/* Floating 3D Icon placeholder */}
                        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-20 transform rotate-12 scale-150 pointer-events-none">
                            <Target size={120} />
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
