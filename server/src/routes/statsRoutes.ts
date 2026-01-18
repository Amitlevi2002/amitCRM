import { Router } from 'express';
import { Contact } from '../models/Contact';
import { Lead } from '../models/Lead';
import { Activity } from '../models/Activity';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const [
            totalContacts,
            totalDeals,
            totalRevenueAgg
        ] = await Promise.all([
            Contact.countDocuments(),
            Lead.countDocuments(),
            Lead.aggregate([
                { $group: { _id: null, total: { $sum: "$estimatedValue" } } }
            ])
        ]);

        const totalRevenue = totalRevenueAgg[0]?.total || 0;

        // Calculate Win Rate (Closed Won / Total Deals with outcome)
        const closedWon = await Lead.countDocuments({ stage: 'Closed Won' });
        const finishedDeals = await Lead.countDocuments({ stage: { $in: ['Closed Won', 'Lost'] } });
        const winRate = finishedDeals > 0 ? Math.round((closedWon / finishedDeals) * 100) : 0;

        res.json({
            revenue: { value: totalRevenue, change: 12.5 }, // Change is mocked for now as we don't have historical data yet
            leads: { value: totalDeals, change: 18.2 },
            deals: { value: await Lead.countDocuments({ status: { $ne: 'Lost' } }), change: -4.3 },
            winRate: { value: winRate, change: 2.1 }
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

export default router;
