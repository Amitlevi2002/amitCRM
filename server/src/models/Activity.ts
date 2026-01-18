import { Schema, model, Document, Types } from 'mongoose';

export interface IActivity extends Document {
    type: 'Call' | 'Meeting' | 'Email' | 'Note';
    date: Date;
    outcome?: string;
    relatedTo: Types.ObjectId;
    relatedToType: 'Contact' | 'Lead';
    createdBy: Types.ObjectId;
}

const activitySchema = new Schema<IActivity>({
    type: { type: String, enum: ['Call', 'Meeting', 'Email', 'Note'], required: true },
    date: { type: Date, default: Date.now },
    outcome: { type: String },
    relatedTo: { type: Schema.Types.ObjectId, required: true, refPath: 'relatedToType' },
    relatedToType: { type: String, required: true, enum: ['Contact', 'Lead'] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Activity = model<IActivity>('Activity', activitySchema);