
import { Request, Response } from 'express';
import { Contact } from '../models/Contact';
import { Lead } from '../models/Lead';
import { Activity } from '../models/Activity';

export const searchController = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query || query.length < 2) {
            return res.status(200).json({ contacts: [], leads: [], activities: [] });
        }

        const regex = new RegExp(query, 'i'); // Case-insensitive partial match

        const [contacts, leads, activities] = await Promise.all([
            Contact.find({
                $or: [
                    { firstName: regex },
                    { lastName: regex },
                    { email: regex },
                    { company: regex }
                ]
            }).limit(5),
            Lead.find({
                $or: [
                    { title: regex },
                    { companyName: regex }
                ]
            }).limit(5),
            Activity.find({
                description: regex
            }).limit(5).populate('relatedTo')
        ]);

        res.status(200).json({
            contacts,
            leads,
            activities
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
