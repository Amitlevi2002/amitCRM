import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    role: 'Admin' | 'Sales' | 'Manager';
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['Admin', 'Sales', 'Manager'], default: 'Sales' },
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);