import { z } from 'zod';

export const contactSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    companyName: z.string().optional(),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        country: z.string().optional(),
    }).optional(),
    type: z.enum(['Private', 'Business']),
    status: z.enum(['Active', 'Inactive']).default('Active'),
    source: z.string().optional(),
    owner: z.string().min(1, 'Owner ID is required'),
    tags: z.array(z.string()).default([]),
});

export const leadSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    companyName: z.string().min(1, 'Company name is required'),
    status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']).default('New'),
    leadScore: z.number().min(0).max(100).default(0),
    source: z.string().optional(),
    assignedTo: z.string().min(1, 'Assigned user ID is required'),
    stage: z.enum(['Prospecting', 'Negotiation', 'Closed Won']).default('Prospecting'),
    estimatedValue: z.number().min(0).default(0),
    probability: z.number().min(0).max(100).default(0),
    expectedCloseDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
});

export const activitySchema = z.object({
    type: z.enum(['Call', 'Meeting', 'Email', 'Note']),
    date: z.string().optional().transform(val => val ? new Date(val) : new Date()),
    outcome: z.string().optional(),
    relatedTo: z.string().min(1, 'Related entity ID is required'),
    relatedToType: z.enum(['Contact', 'Lead']),
    createdBy: z.string().min(1, 'Creator ID is required'),
});

export const quoteSchema = z.object({
    products: z.array(z.object({
        name: z.string().min(1),
        quantity: z.number().min(1),
        price: z.number().min(0),
    })).min(1),
    discount: z.number().min(0).default(0),
    vat: z.number().min(0).default(0),
    status: z.enum(['Draft', 'Sent', 'Accepted', 'Rejected']).default('Draft'),
    signatureUrl: z.string().optional(),
    contact: z.string().min(1),
});

export const invoiceSchema = z.object({
    status: z.enum(['Paid', 'Pending']).default('Pending'),
    paymentLink: z.string().optional(),
    totalAmount: z.number().min(0),
    quote: z.string().optional(),
    contact: z.string().min(1),
});