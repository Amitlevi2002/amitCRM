import { Router } from 'express';
import { Lead } from '../models/Lead';

const router = Router();

// Same numbers the client computes in lib/metrics.ts, for API consumers that want them pre-aggregated.
router.get('/', async (_req, res) => {
    try {
        const byStage = await Lead.aggregate<{ _id: string; count: number; value: number; weighted: number }>([
            {
                $group: {
                    _id: '$stage',
                    count: { $sum: 1 },
                    value: { $sum: '$estimatedValue' },
                    weighted: { $sum: { $multiply: ['$estimatedValue', { $divide: ['$probability', 100] }] } },
                },
            },
        ]);

        const get = (stage: string) => byStage.find((s) => s._id === stage) ?? { count: 0, value: 0, weighted: 0 };
        const open = [get('Prospecting'), get('Negotiation')];
        const won = get('Closed Won');
        const lost = get('Lost');
        const closed = won.count + lost.count;

        res.json({
            openValue: open.reduce((s, x) => s + x.value, 0),
            openCount: open.reduce((s, x) => s + x.count, 0),
            weightedForecast: Math.round(open.reduce((s, x) => s + x.weighted, 0)),
            wonValue: won.value,
            winRate: closed ? Math.round((won.count / closed) * 100) : null,
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

export default router;
