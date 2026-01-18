import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, Calendar, StickyNote, Plus, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function Activities() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newActivity, setNewActivity] = useState({
        type: 'Note',
        outcome: '',
        relatedTo: '507f1f77bcf86cd799439011',
        relatedToType: 'Contact'
    });

    const { data: activities = [], isLoading } = useQuery({
        queryKey: ['activities'],
        queryFn: api.activities.list,
    });

    const createMutation = useMutation({
        mutationFn: api.activities.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            toast({ title: "Success", description: "Activity log created." });
            setIsFormOpen(false);
            setNewActivity({ type: 'Note', outcome: '', relatedTo: '507f1f77bcf86cd799439011', relatedToType: 'Contact' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: api.activities.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            toast({ title: "Deleted", description: "Activity log removed." });
        },
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'Call': return <Phone size={16} className="text-blue-500" />;
            case 'Email': return <Mail size={16} className="text-purple-500" />;
            case 'Meeting': return <Calendar size={16} className="text-orange-500" />;
            default: return <StickyNote size={16} className="text-yellow-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Activities</h1>
                    <p className="text-sm md:text-base text-slate-500">Track all communications and updates.</p>
                </div>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl shadow-lg shadow-primary/20 gap-2 w-full sm:w-auto">
                            <Plus size={18} />
                            <span>Log Activity</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Log Activity</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Type</label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={newActivity.type}
                                    onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                                >
                                    <option value="Note">Note</option>
                                    <option value="Call">Call</option>
                                    <option value="Email">Email</option>
                                    <option value="Meeting">Meeting</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Details / Outcome</label>
                                <Input
                                    value={newActivity.outcome}
                                    onChange={(e) => setNewActivity({ ...newActivity, outcome: e.target.value })}
                                    placeholder="e.g. Discussed new pricing..."
                                    className="rounded-xl"
                                />
                            </div>
                            <Button
                                onClick={() => createMutation.mutate({
                                    ...newActivity,
                                    createdBy: '507f1f77bcf86cd799439011' // Mock User ID
                                })}
                                disabled={!newActivity.outcome}
                                className="w-full rounded-xl mt-2"
                            >
                                Save Log
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Loading activities...</div>
                ) : activities.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                        <p className="text-slate-500">No activities logged yet.</p>
                    </div>
                ) : (
                    activities.map((activity: any) => (
                        <Card key={activity._id} className="p-4 flex items-center justify-between border-slate-100 shadow-sm rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                    {getIcon(activity.type)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-semibold text-slate-900">{activity.type}</span>
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal text-slate-500">
                                            {new Date(activity.date).toLocaleDateString()}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600">{activity.outcome}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                onClick={() => {
                                    if (confirm('Delete this activity?')) deleteMutation.mutate(activity._id)
                                }}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
