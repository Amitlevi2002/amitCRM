import type { Deal, Stage } from './types';
import { STAGES } from './types';

const isOpen = (d: Deal) => d.stage !== 'Closed Won' && d.stage !== 'Lost';

export interface StageSummary {
    stage: Stage;
    count: number;
    value: number;
}

export function summarizeStages(deals: Deal[]): StageSummary[] {
    return STAGES.map((stage) => {
        const inStage = deals.filter((d) => d.stage === stage);
        return {
            stage,
            count: inStage.length,
            value: inStage.reduce((sum, d) => sum + (d.estimatedValue || 0), 0),
        };
    });
}

export function pipelineMetrics(deals: Deal[]) {
    const open = deals.filter(isOpen);
    const won = deals.filter((d) => d.stage === 'Closed Won');
    const lost = deals.filter((d) => d.stage === 'Lost');
    const closed = won.length + lost.length;

    return {
        openValue: open.reduce((s, d) => s + d.estimatedValue, 0),
        // What the open pipeline is worth if every deal closes at its stated probability.
        weightedForecast: Math.round(open.reduce((s, d) => s + d.estimatedValue * (d.probability / 100), 0)),
        wonValue: won.reduce((s, d) => s + d.estimatedValue, 0),
        openCount: open.length,
        winRate: closed === 0 ? null : Math.round((won.length / closed) * 100),
    };
}

/** Open deals whose expected close date has already passed. */
export function overdueDeals(deals: Deal[], now = new Date()): Deal[] {
    return deals
        .filter((d) => isOpen(d) && d.expectedCloseDate && new Date(d.expectedCloseDate) < now)
        .sort((a, b) => a.expectedCloseDate!.localeCompare(b.expectedCloseDate!));
}

export const formatMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export const formatCompact = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);
