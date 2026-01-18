import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DealForm } from '@/components/forms/DealForm';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const COLORS = {
    'Prospecting': 'border-t-blue-500',
    'Negotiation': 'border-t-amber-500',
    'Closed Won': 'border-t-emerald-500',
};

// Deal interface removed

// Initial deals removed

const COLUMNS = ['Prospecting', 'Negotiation', 'Closed Won'];

export default function Pipeline() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState<any>(null);
    const [, setActiveId] = useState<string | null>(null);

    const { data: leads = [], isLoading } = useQuery({
        queryKey: ['leads'],
        queryFn: api.leads.list,
    });

    const createMutation = useMutation({
        mutationFn: api.leads.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast({ title: "Success", description: "Deal created successfully." });
            setIsFormOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => api.leads.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast({ title: "Updated", description: "Deal details updated." });
            setIsFormOpen(false);
            setEditingDeal(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: api.leads.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast({ title: "Deleted", description: "Deal removed." });
        },
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const onDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeDeal = leads.find((d: any) => d._id === active.id);
        const overId = over.id as string;

        // Check if dragging over a column or another card
        const isOverColumn = COLUMNS.includes(overId);

        if (activeDeal && isOverColumn && activeDeal.stage !== overId) {
            updateMutation.mutate({
                id: activeDeal._id,
                data: { ...activeDeal, stage: overId }
            });
        }
    };

    const onDragEnd = (_event: DragEndEvent) => {
        setActiveId(null);
    };

    return (
        <div className="h-full flex flex-col space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Deals Pipeline</h1>
                    <p className="text-sm md:text-base text-slate-500">Manage your sales opportunities and stages.</p>
                </div>
                <Button
                    className="rounded-xl shadow-lg shadow-primary/20 gap-2 w-full sm:w-auto"
                    onClick={() => setIsFormOpen(true)}
                >
                    <Plus size={18} />
                    <span>Add Deal</span>
                </Button>
            </div>

            <DealForm
                open={isFormOpen}
                initialData={editingDeal}
                onOpenChange={(open) => {
                    setIsFormOpen(open);
                    if (!open) setEditingDeal(null);
                }}
                onSubmit={(data) => {
                    if (editingDeal) {
                        updateMutation.mutate({ id: editingDeal._id, data });
                    } else {
                        createMutation.mutate({ ...data, assignedTo: '507f1f77bcf86cd799439011' });
                    }
                }}
            />

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
            >
                <div className="flex gap-6 overflow-x-auto pb-4 h-full">
                    {COLUMNS.map((column) => (
                        <div key={column} className="flex-1 min-w-[320px] bg-slate-50/50 rounded-3xl p-4 flex flex-col">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                    {column}
                                    <span className="text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                                        {leads.filter((d: any) => d.stage === column).length}
                                    </span>
                                </h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                    <Plus size={16} className="text-slate-400" />
                                </Button>
                            </div>

                            <div className="flex-1 space-y-4 overflow-y-auto min-h-[200px]">
                                {isLoading ? (
                                    <div className="p-4 text-center text-slate-400 text-sm">Loading...</div>
                                ) : (
                                    leads
                                        .filter((deal: any) => deal.stage === column)
                                        .map((deal: any) => (
                                            <Card
                                                key={deal._id}
                                                className={cn(
                                                    "border-none shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing rounded-2xl border-t-4",
                                                    COLORS[column as keyof typeof COLORS]
                                                )}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h4 className="font-semibold text-slate-900 truncate pr-2 flex-1">{deal.title}</h4>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-slate-400 hover:text-blue-500 hover:bg-blue-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingDeal(deal);
                                                                    setIsFormOpen(true);
                                                                }}
                                                            >
                                                                <Pencil size={14} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm(`Delete ${deal.title}?`)) {
                                                                        deleteMutation.mutate(deal._id);
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mb-3">{deal.companyName}</p>
                                                    <div className="flex items-center justify-between mt-auto">
                                                        <span className="text-sm font-bold text-slate-900">${deal.estimatedValue?.toLocaleString()}</span>
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                            {deal.title.charAt(0)}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </DndContext>
        </div>
    );
}
