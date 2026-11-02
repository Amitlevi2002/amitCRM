import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor,
    useDraggable, useDroppable, useSensor, useSensors,
    type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { STAGES, type Deal, type Stage } from '@/lib/types';
import { STAGE_PROBABILITY, STAGE_STYLE } from '@/lib/stages';
import { formatMoney, summarizeStages } from '@/lib/metrics';
import { cn, shortDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { DealForm, type DealFormValues } from '@/components/forms/DealForm';

function DealCard({ deal, onEdit, onDelete, overlay }: { deal: Deal; onEdit?: () => void; onDelete?: () => void; overlay?: boolean }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal._id, disabled: overlay });
    const closed = deal.stage === 'Closed Won' || deal.stage === 'Lost';
    const overdue = !closed && deal.expectedCloseDate && new Date(deal.expectedCloseDate) < new Date();

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={cn(
                'group cursor-grab touch-none rounded-md border bg-card p-3 text-[13px] active:cursor-grabbing',
                isDragging && 'opacity-30',
                overlay && 'rotate-[1.5deg] shadow-lg'
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-snug">{deal.title}</p>
                {onEdit && (
                    <div className="-mr-1 -mt-0.5 flex shrink-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <button onPointerDown={(e) => e.stopPropagation()} onClick={onEdit} className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Edit deal">
                            <Pencil size={12} />
                        </button>
                        <button onPointerDown={(e) => e.stopPropagation()} onClick={onDelete} className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-destructive" aria-label="Delete deal">
                            <Trash2 size={12} />
                        </button>
                    </div>
                )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{deal.companyName}</p>
            <div className="mt-3 flex items-center justify-between">
                <span className="num font-medium">{formatMoney(deal.estimatedValue)}</span>
                <span className="num text-[11px] text-muted-foreground">
                    {!closed && `${deal.probability}%`}
                    {deal.expectedCloseDate && !closed && ' · '}
                    {deal.expectedCloseDate && !closed && (
                        <span className={cn(overdue && 'text-stage-lost')}>{shortDate(deal.expectedCloseDate)}</span>
                    )}
                </span>
            </div>
        </div>
    );
}

function Column({ stage, deals, total, onAdd, children }: { stage: Stage; deals: number; total: number; onAdd: () => void; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id: stage });
    return (
        <div className="flex w-[272px] shrink-0 flex-col lg:w-auto lg:min-w-0 lg:flex-1">
            <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-[13px]">
                    <span className={cn('h-2 w-2 rounded-full', STAGE_STYLE[stage].dot)} />
                    <span className="font-medium">{stage}</span>
                    <span className="num text-xs text-muted-foreground">{deals}</span>
                </div>
                <span className="num text-xs text-muted-foreground">{formatMoney(total)}</span>
            </div>
            <div
                ref={setNodeRef}
                className={cn(
                    'flex min-h-[420px] flex-1 flex-col gap-2 rounded-lg border border-transparent bg-secondary/60 p-2 transition-colors',
                    isOver && 'border-dashed border-primary/40 bg-primary/5'
                )}
            >
                {children}
                <button onClick={onAdd} className="flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground hover:bg-card hover:text-foreground">
                    <Plus size={13} /> Add deal
                </button>
            </div>
        </div>
    );
}

export default function Pipeline() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<{ open: boolean; deal?: Deal | null; stage?: Stage }>({ open: false });
    const [dragging, setDragging] = useState<Deal | null>(null);

    const { data: deals = [], isLoading } = useQuery({ queryKey: ['leads'], queryFn: api.leads.list });
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['leads'] });
    const onError = (e: Error) => toast({ title: 'Couldn’t save', description: e.message, variant: 'destructive' });

    const save = useMutation({
        mutationFn: (v: DealFormValues) => (form.deal ? api.leads.update(form.deal._id, v) : api.leads.create(v)),
        onSuccess: () => { refresh(); setForm({ open: false }); },
        onError,
    });

    const move = useMutation({
        mutationFn: ({ id, stage }: { id: string; stage: Stage }) => api.leads.update(id, { stage, probability: STAGE_PROBABILITY[stage] }),
        // Move the card immediately; the server answer only confirms it.
        onMutate: async ({ id, stage }) => {
            await queryClient.cancelQueries({ queryKey: ['leads'] });
            const previous = queryClient.getQueryData<Deal[]>(['leads']);
            queryClient.setQueryData<Deal[]>(['leads'], (old = []) =>
                old.map((d) => (d._id === id ? { ...d, stage, probability: STAGE_PROBABILITY[stage] } : d))
            );
            return { previous };
        },
        onError: (e: Error, _v, ctx) => { queryClient.setQueryData(['leads'], ctx?.previous); onError(e); },
        onSettled: refresh,
    });

    const remove = useMutation({
        mutationFn: api.leads.delete,
        onSuccess: () => { refresh(); toast({ title: 'Deal deleted' }); },
        onError,
    });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
        useSensor(KeyboardSensor)
    );

    const onDragStart = (e: DragStartEvent) => setDragging(deals.find((d) => d._id === e.active.id) ?? null);
    const onDragEnd = ({ active, over }: DragEndEvent) => {
        setDragging(null);
        const deal = deals.find((d) => d._id === active.id);
        const stage = over?.id as Stage | undefined;
        if (deal && stage && deal.stage !== stage) move.mutate({ id: deal._id, stage });
    };

    const summary = summarizeStages(deals);

    return (
        <>
            <PageHeader
                title="Pipeline"
                description="Drag a deal to move it between stages."
                actions={<Button onClick={() => setForm({ open: true })}><Plus size={15} /> New deal</Button>}
            />

            <DealForm
                open={form.open}
                deal={form.deal}
                defaultStage={form.stage}
                saving={save.isPending}
                onOpenChange={(open) => setForm((f) => ({ ...f, open }))}
                onSubmit={(v) => save.mutate(v)}
            />

            <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
                <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-4 md:-mx-8 md:px-8">
                    {STAGES.map((stage, i) => (
                        <Column key={stage} stage={stage} deals={summary[i].count} total={summary[i].value} onAdd={() => setForm({ open: true, stage })}>
                            {isLoading && <div className="h-20 animate-pulse rounded-md bg-card" />}
                            {deals.filter((d) => d.stage === stage).map((deal) => (
                                <DealCard
                                    key={deal._id}
                                    deal={deal}
                                    onEdit={() => setForm({ open: true, deal })}
                                    onDelete={() => confirm(`Delete “${deal.title}”?`) && remove.mutate(deal._id)}
                                />
                            ))}
                        </Column>
                    ))}
                </div>
                <DragOverlay dropAnimation={null}>{dragging && <DealCard deal={dragging} overlay />}</DragOverlay>
            </DndContext>
        </>
    );
}
