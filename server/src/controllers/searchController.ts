import { Request, Response } from 'express';
import { Contact } from '../models/Contact';
import { Lead } from '../models/Lead';

// User input goes into a RegExp, so escape it: otherwise "a.*" or "(" changes the query or throws.
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const searchController = async (req: Request, res: Response) => {
    try {
        const query = String(req.query.q ?? '').trim().slice(0, 64);
        if (query.length < 2) {
            return res.status(200).json({ contacts: [], leads: [] });
        }

        const regex = new RegExp(escape(query), 'i');

        const [contacts, leads] = await Promise.all([
            Contact.find({ $or: [{ firstName: regex }, { lastName: regex }, { email: regex }, { companyName: regex }] }).limit(5),
            Lead.find({ $or: [{ title: regex }, { companyName: regex }] }).limit(5),
        ]);

        res.status(200).json({ contacts, leads });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
