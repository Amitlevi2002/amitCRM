import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, selectClass } from './Field';
import { STAGES, type Deal, type Stage } from '@/lib/types';
import { STAGE_PROBABILITY } from '@/lib/stages';

const dealSchema = z.object({
    title: z.string().trim().min(2, 'Give the deal a name'),
    companyName: z.string().trim().min(2, 'Which company?'),
    estimatedValue: z.number({ message: 'Enter an amount' }).min(0, 'Can’t be negative'),
    stage: z.enum(STAGES),
    probability: z.number({ message: 'Enter 0–100' }).min(0).max(100, 'Max 100'),
    expectedCloseDate: z.string().optional(),
});

export type DealFormValues = z.infer<typeof dealSchema>;

interface DealFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: DealFormValues) => void;
    deal?: Deal | null;
    defaultStage?: Stage;
    saving?: boolean;
}

const toInputDate = (iso?: string) => (iso ? iso.slice(0, 10) : '');

export function DealForm({ open, onOpenChange, onSubmit, deal, defaultStage = 'Prospecting', saving }: DealFormProps) {
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DealFormValues>({
        resolver: zodResolver(dealSchema),
    });

    // Reset on every open, otherwise "edit" shows whatever the form held last time.
    useEffect(() => {
        if (!open) return;
        reset(
            deal
                ? { ...deal, expectedCloseDate: toInputDate(deal.expectedCloseDate) }
                : { title: '', companyName: '', estimatedValue: undefined, stage: defaultStage, probability: STAGE_PROBABILITY[defaultStage], expectedCloseDate: '' }
        );
    }, [open, deal, defaultStage, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">{deal ? 'Edit deal' : 'New deal'}</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={handleSubmit((v) => onSubmit({ ...v, expectedCloseDate: v.expectedCloseDate ? new Date(v.expectedCloseDate).toISOString() : undefined }))}
                    className="space-y-4"
                >
                    <Field label="Deal" error={errors.title?.message}>
                        <Input {...register('title')} placeholder="Annual licence renewal" autoFocus />
                    </Field>
                    <Field label="Company" error={errors.companyName?.message}>
                        <Input {...register('companyName')} placeholder="Northwind Retail" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Value (USD)" error={errors.estimatedValue?.message}>
                            <Input {...register('estimatedValue', { valueAsNumber: true })} type="number" inputMode="numeric" min={0} className="num" />
                        </Field>
                        <Field label="Win probability %" error={errors.probability?.message}>
                            <Input {...register('probability', { valueAsNumber: true })} type="number" min={0} max={100} className="num" />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Stage">
                            <select
                                {...register('stage', { onChange: (e) => !deal && setValue('probability', STAGE_PROBABILITY[e.target.value as Stage]) })}
                                className={selectClass}
                            >
                                {STAGES.map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </Field>
                        <Field label="Expected close">
                            <Input {...register('expectedCloseDate')} type="date" />
                        </Field>
                    </div>
                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={saving}>{deal ? 'Save' : 'Create deal'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
