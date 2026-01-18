import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const dealSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    companyName: z.string().min(2, "Company must be at least 2 characters"),
    estimatedValue: z.number().min(0, "Value must be positive"),
    stage: z.enum(['Prospecting', 'Negotiation', 'Closed Won']),
    probability: z.number().min(0).max(100),
});

type DealFormValues = z.infer<typeof dealSchema>;

interface DealFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: DealFormValues) => void;
    initialData?: Partial<DealFormValues>;
}

export function DealForm({ open, onOpenChange, onSubmit, initialData }: DealFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<DealFormValues>({
        resolver: zodResolver(dealSchema),
        defaultValues: {
            title: '',
            companyName: '',
            estimatedValue: 0,
            stage: 'Prospecting',
            probability: 10,
            ...initialData
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {initialData ? 'Edit Deal' : 'Add New Deal'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Deal Title</label>
                        <Input {...register('title')} placeholder="e.g. Enterprise License" className="rounded-xl" />
                        {errors.title && <p className="text-xs text-rose-500">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Company Name</label>
                        <Input {...register('companyName')} placeholder="e.g. Acme Corp" className="rounded-xl" />
                        {errors.companyName && <p className="text-xs text-rose-500">{errors.companyName.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Value ($)</label>
                            <Input {...register('estimatedValue', { valueAsNumber: true })} type="number" placeholder="5000" className="rounded-xl" />
                            {errors.estimatedValue && <p className="text-xs text-rose-500">{errors.estimatedValue.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Probability (%)</label>
                            <Input {...register('probability', { valueAsNumber: true })} type="number" placeholder="50" className="rounded-xl" />
                            {errors.probability && <p className="text-xs text-rose-500">{errors.probability.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Stage</label>
                        <select
                            {...register('stage')}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="Prospecting">Prospecting</option>
                            <option value="Negotiation">Negotiation</option>
                            <option value="Closed Won">Closed Won</option>
                        </select>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button type="submit" className="rounded-xl shadow-lg shadow-primary/20">
                            {initialData ? 'Save Changes' : 'Create Deal'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
