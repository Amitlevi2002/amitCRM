import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, selectClass } from './Field';
import type { Contact } from '@/lib/types';

const contactSchema = z.object({
    firstName: z.string().trim().min(1, 'Required'),
    lastName: z.string().trim().min(1, 'Required'),
    companyName: z.string().trim().optional(),
    email: z.string().trim().email('That doesn’t look like an email'),
    phone: z.string().trim().regex(/^[+\d][\d\s-]{6,}$/, 'Digits, spaces and + only').or(z.literal('')).optional(),
    type: z.enum(['Private', 'Business']),
    status: z.enum(['Active', 'Inactive']),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ContactFormValues) => void;
    contact?: Contact | null;
    saving?: boolean;
}

const EMPTY: ContactFormValues = { firstName: '', lastName: '', companyName: '', email: '', phone: '', type: 'Business', status: 'Active' };

export function ContactForm({ open, onOpenChange, onSubmit, contact, saving }: ContactFormProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: EMPTY,
    });

    useEffect(() => {
        if (open) reset(contact ? { ...EMPTY, ...contact } : EMPTY);
    }, [open, contact, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">{contact ? 'Edit contact' : 'New contact'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="First name" error={errors.firstName?.message}>
                            <Input {...register('firstName')} autoFocus />
                        </Field>
                        <Field label="Last name" error={errors.lastName?.message}>
                            <Input {...register('lastName')} />
                        </Field>
                    </div>
                    <Field label="Company" error={errors.companyName?.message}>
                        <Input {...register('companyName')} />
                    </Field>
                    <Field label="Email" error={errors.email?.message}>
                        <Input {...register('email')} type="email" />
                    </Field>
                    <Field label="Phone" error={errors.phone?.message}>
                        <Input {...register('phone')} type="tel" placeholder="+972 52 000 0000" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Type">
                            <select {...register('type')} className={selectClass}>
                                <option>Business</option>
                                <option>Private</option>
                            </select>
                        </Field>
                        <Field label="Status">
                            <select {...register('status')} className={selectClass}>
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </Field>
                    </div>
                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={saving}>{contact ? 'Save' : 'Add contact'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
