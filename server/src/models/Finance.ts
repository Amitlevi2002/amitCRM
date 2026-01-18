import { Schema, model, Document, Types } from 'mongoose';

// --- Quotes ---
export interface IQuote extends Document {
    products: {
        name: string;
        quantity: number;
        price: number;
    }[];
    discount: number;
    vat: number;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
    signatureUrl?: string;
    contact: Types.ObjectId;
}

const quoteSchema = new Schema<IQuote>({
    products: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
    }],
    discount: { type: Number, default: 0 },
    vat: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Sent', 'Accepted', 'Rejected'], default: 'Draft' },
    signatureUrl: { type: String },
    contact: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
}, { timestamps: true });

export const Quote = model<IQuote>('Quote', quoteSchema);

// --- Invoices ---
export interface IInvoice extends Document {
    status: 'Paid' | 'Pending';
    paymentLink?: string;
    totalAmount: number;
    quote: Types.ObjectId;
    contact: Types.ObjectId;
}

const invoiceSchema = new Schema<IInvoice>({
    status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
    paymentLink: { type: String },
    totalAmount: { type: Number, required: true },
    quote: { type: Schema.Types.ObjectId, ref: 'Quote' },
    contact: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
}, { timestamps: true });

export const Invoice = model<IInvoice>('Invoice', invoiceSchema);