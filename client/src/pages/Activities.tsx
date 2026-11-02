import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { ACTIVITY_TYPES, type Activity, type ActivityType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageHeader } from '@/components/PageHeader';
import { ActivityIcon } from '@/components/ActivityIcon';
import { Field, selectClass } from '@/components/forms/Field';

function dayLabel(iso: string) {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(Date.now() - 864e5);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function Activities() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<ActivityType | 'All'>('All');
    const [draft, setDraft] = useState({ type: 'Call' as ActivityType, outcome: '', relatedTo: '' });

    const { data: activities = [], isLoading } = useQuery({ queryKey: ['activities'], queryFn: api.activities.list });
    const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: api.contacts.list });

    const openForm = () => {
        setDraft((d) => ({ ...d, outcome: '', relatedTo: d.relatedTo || contacts[0]?._id || '' }));
        setOpen(true);
    };

    const refresh = () => queryClient.invalidateQueries({ queryKey: ['activities'] });
    const create = useMutation({
        mutationFn: () => api.activities.create({ ...draft, outcome: draft.outcome.trim(), relatedToType: 'Contact', date: new Date().toISOString() }),
        onSuccess: () => { refresh(); setOpen(false); },
        onError: (e: Error) => toast({ title: 'Couldn’t save', description: e.message, variant: 'destructive' }),
    });
    const remove = useMutation({ mutationFn: api.activities.delete, onSuccess: refresh });

    const nameOf = useMemo(() => {
        const map = new Map(contacts.map((c) => [c._id, `${c.firstName} ${c.lastName}`]));
        return (id: string) => map.get(id);
    }, [contacts]);

    const grouped = useMemo(() => {
        const list = type === 'All' ? activities : activities.filter((a) => a.type === type);
        const groups = new Map<string, Activity[]>();
        for (const a of list) {
            const key = dayLabel(a.date);
            groups.set(key, [...(groups.get(key) ?? []), a]);
        }
        return [...groups];
    }, [activities, type]);

    return (
        <>
            <PageHeader
                title="Activity"
                description="Calls, meetings, emails and notes, newest first."
                actions={<Button onClick={openForm}><Plus size={15} /> Log activity</Button>}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader><DialogTitle className="text-base font-semibold">Log activity</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Type">
                                <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as ActivityType })} className={selectClass}>
                                    {ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}
                                </select>
                            </Field>
                            <Field label="With">
                                <select value={draft.relatedTo} onChange={(e) => setDraft({ ...draft, relatedTo: e.target.value })} className={selectClass}>
                                    {contacts.map((c) => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                                </select>
                            </Field>
                        </div>
                        <Field label="What happened">
                            <textarea
                                value={draft.outcome}
                                onChange={(e) => setDraft({ ...draft, outcome: e.target.value })}
                                rows={3}
                                autoFocus
                                className="w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </Field>
                        <DialogFooter className="gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={!draft.outcome.trim() || !draft.relatedTo || create.isPending}>Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="mb-5 inline-flex rounded-md border bg-card p-0.5 text-xs">
                {(['All', ...ACTIVITY_TYPES] as const).map((t) => (
                    <button key={t} onClick={() => setType(t)} className={cn('rounded px-2.5 py-1', type === t ? 'bg-secondary font-medium' : 'text-muted-foreground hover:text-foreground')}>
                        {t}
                    </button>
                ))}
            </div>

            {isLoading && <p className="text-[13px] text-muted-foreground">Loading…</p>}
            {!isLoading && grouped.length === 0 && (
                <p className="rounded-lg border border-dashed px-4 py-10 text-center text-[13px] text-muted-foreground">Nothing logged here yet.</p>
            )}

            <div className="max-w-3xl space-y-7">
                {grouped.map(([label, items]) => (
                    <section key={label}>
                        <h2 className="eyebrow mb-2">{label}</h2>
                        <ul className="rounded-lg border bg-card">
                            {items.map((a) => (
                                <li key={a._id} className="group flex gap-3 border-b px-4 py-3 last:border-0">
                                    <ActivityIcon type={a.type} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13.5px] leading-snug">{a.outcome}</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {a.type}{nameOf(a.relatedTo) && ` with ${nameOf(a.relatedTo)}`} · {new Date(a.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => confirm('Delete this entry?') && remove.mutate(a._id)}
                                        className="self-start rounded p-1 text-muted-foreground opacity-100 hover:bg-secondary hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                                        aria-label="Delete entry"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </>
    );
}
