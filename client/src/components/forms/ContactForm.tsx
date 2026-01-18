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

const contactSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    companyName: z.string().min(2, "Company must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    type: z.enum(['Private', 'Business']),
    status: z.enum(['Active', 'Inactive']),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ContactFormValues) => void;
    initialData?: Partial<ContactFormValues>;
}

export function ContactForm({ open, onOpenChange, onSubmit, initialData }: ContactFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            companyName: '',
            email: '',
            phone: '',
            type: 'Business',
            status: 'Active',
            ...initialData
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {initialData ? 'Edit Contact' : 'Add New Contact'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">First Name</label>
                            <Input {...register('firstName')} placeholder="John" className="rounded-xl" />
                            {errors.firstName && <p className="text-xs text-rose-500">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Last Name</label>
                            <Input {...register('lastName')} placeholder="Doe" className="rounded-xl" />
                            {errors.lastName && <p className="text-xs text-rose-500">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Company</label>
                        <Input {...register('companyName')} placeholder="e.g. Acme Corp" className="rounded-xl" />
                        {errors.companyName && <p className="text-xs text-rose-500">{errors.companyName.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email Address</label>
                            <Input {...register('email')} placeholder="e.g. john@example.com" className="rounded-xl" />
                            {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Phone Number</label>
                            <Input {...register('phone')} placeholder="e.g. 0501234567" className="rounded-xl" />
                            {errors.phone && <p className="text-xs text-rose-500">{errors.phone.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Type</label>
                            <select
                                {...register('type')}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="Business">Business</option>
                                <option value="Private">Private</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Status</label>
                            <select
                                {...register('status')}
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button type="submit" className="rounded-xl shadow-lg shadow-primary/20">
                            {initialData ? 'Save Changes' : 'Create Contact'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
