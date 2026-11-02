import type { Stage } from './types';

// Full class names on purpose: Tailwind only generates classes it can find written out in the source.
export const STAGE_STYLE: Record<Stage, { dot: string; bar: string; text: string; fill: string }> = {
    'Prospecting': { dot: 'bg-stage-prospecting', bar: 'bg-stage-prospecting', text: 'text-stage-prospecting', fill: 'fill-stage-prospecting' },
    'Negotiation': { dot: 'bg-stage-negotiation', bar: 'bg-stage-negotiation', text: 'text-stage-negotiation', fill: 'fill-stage-negotiation' },
    'Closed Won': { dot: 'bg-stage-won', bar: 'bg-stage-won', text: 'text-stage-won', fill: 'fill-stage-won' },
    'Lost': { dot: 'bg-stage-lost', bar: 'bg-stage-lost', text: 'text-stage-lost', fill: 'fill-stage-lost' },
};

/** Default win probability when a deal is moved into a stage. */
export const STAGE_PROBABILITY: Record<Stage, number> = {
    'Prospecting': 25,
    'Negotiation': 60,
    'Closed Won': 100,
    'Lost': 0,
};
