import type { Stage } from './types';

export const STAGE_STYLE: Record<Stage, { dot: string; bar: string; text: string }> = {
    'Prospecting': { dot: 'bg-stage-prospecting', bar: 'bg-stage-prospecting', text: 'text-stage-prospecting' },
    'Negotiation': { dot: 'bg-stage-negotiation', bar: 'bg-stage-negotiation', text: 'text-stage-negotiation' },
    'Closed Won': { dot: 'bg-stage-won', bar: 'bg-stage-won', text: 'text-stage-won' },
    'Lost': { dot: 'bg-stage-lost', bar: 'bg-stage-lost', text: 'text-stage-lost' },
};

/** Default win probability when a deal is moved into a stage. */
export const STAGE_PROBABILITY: Record<Stage, number> = {
    'Prospecting': 25,
    'Negotiation': 60,
    'Closed Won': 100,
    'Lost': 0,
};
