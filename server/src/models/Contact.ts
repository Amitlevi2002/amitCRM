import { Schema, model, Document, Types } from 'mongoose';

export interface IContact extends Document {
    firstName: string;
    lastName: string;
    companyName?: string;
    email: string;
    phone?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
    };
    type: 'Private' | 'Business';
    status: 'Active' | 'Inactive';
    source?: string;
    owner: Types.ObjectId;
    tags: string[];
}

const contactSchema = new Schema<IContact>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    companyName: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
    },
    type: { type: String, enum: ['Private', 'Business'], required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    source: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }],
}, { timestamps: true });

export const Contact = model<IContact>('Contact', contactSchema);