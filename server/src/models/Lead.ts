import { Schema, model, Document, Types } from 'mongoose';

export interface ILead extends Document {
    title: string;
    companyName: string;
    status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
    leadScore: number;
    source?: string;
    assignedTo: Types.ObjectId;
    stage: 'Prospecting' | 'Negotiation' | 'Closed Won';
    estimatedValue: number;
    probability: number;
    expectedCloseDate?: Date;
}

const leadSchema = new Schema<ILead>({
    title: { type: String, required: true },
    companyName: { type: String, required: true },
    status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Lost'], default: 'New' },
    leadScore: { type: Number, default: 0 },
    source: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stage: { type: String, enum: ['Prospecting', 'Negotiation', 'Closed Won'], default: 'Prospecting' },
    estimatedValue: { type: Number, default: 0 },
    probability: { type: Number, min: 0, max: 100, default: 0 },
    expectedCloseDate: { type: Date },
}, { timestamps: true });

export const Lead = model<ILead>('Lead', leadSchema);