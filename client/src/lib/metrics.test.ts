import { describe, expect, it } from 'vitest';
import { overdueDeals, pipelineMetrics, summarizeStages } from './metrics';
import type { Deal, Stage } from './types';

let n = 0;
const deal = (stage: Stage, estimatedValue: number, probability: number, expectedCloseDate?: string): Deal => ({
    _id: String(n++), title: `Deal ${n}`, companyName: 'Acme', stage, estimatedValue, probability, expectedCloseDate,
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
});

describe('pipelineMetrics', () => {
    it('counts only open stages as pipeline and weights the forecast by probability', () => {
        const m = pipelineMetrics([
            deal('Prospecting', 10_000, 20),
            deal('Negotiation', 30_000, 50),
            deal('Closed Won', 5_000, 100),
            deal('Lost', 99_000, 0),
        ]);
        expect(m.openValue).toBe(40_000);
        expect(m.openCount).toBe(2);
        expect(m.weightedForecast).toBe(2_000 + 15_000);
        expect(m.wonValue).toBe(5_000);
    });

    it('computes win rate from closed deals only', () => {
        const m = pipelineMetrics([deal('Closed Won', 1, 100), deal('Closed Won', 1, 100), deal('Lost', 1, 0), deal('Prospecting', 1, 10)]);
        expect(m.winRate).toBe(67);
    });

    it('reports no win rate instead of 0% when nothing has closed yet', () => {
        expect(pipelineMetrics([deal('Prospecting', 100, 10)]).winRate).toBeNull();
        expect(pipelineMetrics([]).winRate).toBeNull();
    });
});

describe('summarizeStages', () => {
    it('returns every stage in board order, including empty ones', () => {
        const s = summarizeStages([deal('Negotiation', 500, 50), deal('Negotiation', 250, 50)]);
        expect(s.map((x) => x.stage)).toEqual(['Prospecting', 'Negotiation', 'Closed Won', 'Lost']);
        expect(s[1]).toEqual({ stage: 'Negotiation', count: 2, value: 750 });
        expect(s[0].count).toBe(0);
    });
});

describe('overdueDeals', () => {
    const now = new Date('2026-06-15T12:00:00Z');

    it('flags open deals past their close date, oldest first', () => {
        const late = deal('Negotiation', 1, 50, '2026-06-01T00:00:00Z');
        const later = deal('Prospecting', 1, 20, '2026-05-01T00:00:00Z');
        const future = deal('Prospecting', 1, 20, '2026-07-01T00:00:00Z');
        expect(overdueDeals([late, future, later], now)).toEqual([later, late]);
    });

    it('ignores closed deals and deals without a date', () => {
        expect(overdueDeals([deal('Closed Won', 1, 100, '2026-01-01T00:00:00Z'), deal('Lost', 1, 0, '2026-01-01T00:00:00Z'), deal('Prospecting', 1, 10)], now)).toEqual([]);
    });
});
