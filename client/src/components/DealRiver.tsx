import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Deal } from '@/lib/types';
import { formatMoney } from '@/lib/metrics';
import { STAGE_STYLE } from '@/lib/stages';
import { cn, shortDate } from '@/lib/utils';

const DAY = 864e5;
const SPAN = 56; // days shown ahead of today
const HEIGHT = 190;
const PAD = { left: 64, right: 16, top: 18, bottom: 26 };

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const toISO = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12)).toISOString();

/**
 * Open deals laid out by expected close date: size is value, colour is stage.
 * Drag a deal (or focus it and use the arrow keys) to move its close date; anything already late collects on the left.
 */
export function DealRiver({ deals }: { deals: Deal[] }) {
    const queryClient = useQueryClient();
    const wrap = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(800);
    const [drag, setDrag] = useState<{ id: string; days: number } | null>(null);
    const [hover, setHover] = useState<string | null>(null);

    useEffect(() => {
        const el = wrap.current;
        if (!el) return;
        const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const today = startOfDay(new Date());
    const open = deals.filter((d) => (d.stage === 'Prospecting' || d.stage === 'Negotiation') && d.expectedCloseDate);
    const maxValue = Math.max(...open.map((d) => d.estimatedValue), 1);

    const inner = width - PAD.left - PAD.right;
    const x = (days: number) => PAD.left + (Math.max(-1, Math.min(SPAN, days)) / SPAN) * inner;
    const daysFromX = (px: number) => Math.round(((px - PAD.left) / inner) * SPAN);
    const r = (v: number) => 7 + Math.sqrt(v / maxValue) * 18;
    const daysOf = (d: Deal) => Math.round((startOfDay(new Date(d.expectedCloseDate!)).getTime() - today.getTime()) / DAY);

    // Two lanes, one per open stage; deals on nearby dates are nudged apart so they stay clickable.
    const placed = useMemo(() => {
        const lanes = { Prospecting: PAD.top + 44, Negotiation: PAD.top + 112 } as const;
        const sorted = [...open].sort((a, b) => b.estimatedValue - a.estimatedValue);
        const out: { deal: Deal; days: number; cx: number; cy: number; rad: number }[] = [];
        for (const deal of sorted) {
            const days = drag?.id === deal._id ? drag.days : daysOf(deal);
            const cx = x(days);
            const rad = r(deal.estimatedValue);
            let cy: number = lanes[deal.stage as keyof typeof lanes];
            for (const o of out) {
                if (Math.hypot(o.cx - cx, o.cy - cy) < o.rad + rad + 2) cy += (o.cy <= cy ? 1 : -1) * (rad * 0.9);
            }
            out.push({ deal, days, cx, cy, rad });
        }
        return out.sort((a, b) => b.rad - a.rad); // big ones underneath
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deals, drag, width]);

    const move = useMutation({
        mutationFn: ({ id, date }: { id: string; date: string }) => api.leads.update(id, { expectedCloseDate: date }),
        onMutate: async ({ id, date }) => {
            await queryClient.cancelQueries({ queryKey: ['leads'] });
            const previous = queryClient.getQueryData<Deal[]>(['leads']);
            queryClient.setQueryData<Deal[]>(['leads'], (old = []) => old.map((d) => (d._id === id ? { ...d, expectedCloseDate: date } : d)));
            return { previous };
        },
        onError: (_e, _v, ctx) => queryClient.setQueryData(['leads'], ctx?.previous),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
    });

    const commit = (id: string, days: number) => move.mutate({ id, date: toISO(new Date(today.getTime() + Math.max(0, days) * DAY)) });

    const onPointerDown = (e: React.PointerEvent, deal: Deal, days: number) => {
        (e.target as Element).setPointerCapture(e.pointerId);
        setDrag({ id: deal._id, days });
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (!drag) return;
        const box = wrap.current!.getBoundingClientRect();
        setDrag({ ...drag, days: Math.max(0, Math.min(SPAN, daysFromX(e.clientX - box.left))) });
    };
    const onPointerUp = () => {
        if (!drag) return;
        const deal = open.find((d) => d._id === drag.id);
        if (deal && drag.days !== daysOf(deal)) commit(drag.id, drag.days);
        setDrag(null);
    };

    const weeks = Array.from({ length: Math.floor(SPAN / 7) + 1 }, (_, i) => i * 7);
    const focused = placed.find((p) => p.deal._id === (drag?.id ?? hover));
    const late = placed.filter((p) => p.days < 0).length;

    return (
        <div ref={wrap} className="relative select-none" onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
            <svg width={width} height={HEIGHT} className="block overflow-visible" role="group" aria-label="Open deals by expected close date">
                {/* late zone */}
                <rect x={0} y={PAD.top} width={PAD.left - 10} height={HEIGHT - PAD.top - PAD.bottom} rx={6} fill="hsl(var(--stage-lost) / 0.06)" />
                <text x={(PAD.left - 10) / 2} y={HEIGHT - 8} textAnchor="middle" className="fill-stage-lost text-[10px] font-medium">
                    Late{late ? ` · ${late}` : ''}
                </text>
                {weeks.map((w) => (
                    <g key={w}>
                        <line x1={x(w)} x2={x(w)} y1={PAD.top} y2={HEIGHT - PAD.bottom} stroke={w === 0 ? 'hsl(var(--foreground) / 0.35)' : 'hsl(var(--border))'} strokeDasharray={w === 0 ? undefined : '2 4'} />
                        <text x={x(w)} y={HEIGHT - 8} textAnchor="middle" className="fill-muted-foreground text-[10px] tabular-nums">
                            {w === 0 ? 'Today' : shortDate(new Date(today.getTime() + w * DAY).toISOString())}
                        </text>
                    </g>
                ))}
                <text x={PAD.left + 4} y={PAD.top + 10} className="fill-muted-foreground text-[10px]">Prospecting</text>
                <text x={PAD.left + 4} y={PAD.top + 78} className="fill-muted-foreground text-[10px]">Negotiation</text>

                {placed.map(({ deal, days, cx, cy, rad }) => {
                    const active = drag?.id === deal._id || hover === deal._id;
                    return (
                        <g
                            key={deal._id}
                            tabIndex={0}
                            role="slider"
                            aria-label={`${deal.title}, ${formatMoney(deal.estimatedValue)}, closes ${shortDate(deal.expectedCloseDate!)}`}
                            aria-valuemin={0}
                            aria-valuemax={SPAN}
                            aria-valuenow={Math.max(0, days)}
                            className={cn('cursor-grab outline-none active:cursor-grabbing', drag?.id === deal._id && 'cursor-grabbing')}
                            onPointerDown={(e) => onPointerDown(e, deal, Math.max(0, days))}
                            onPointerEnter={() => setHover(deal._id)}
                            onPointerLeave={() => setHover(null)}
                            onFocus={() => setHover(deal._id)}
                            onBlur={() => setHover(null)}
                            onKeyDown={(e) => {
                                const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                                if (step) {
                                    e.preventDefault();
                                    commit(deal._id, Math.max(0, days) + step * (e.shiftKey ? 7 : 1));
                                }
                            }}
                        >
                            <circle
                                cx={cx}
                                cy={cy}
                                r={rad}
                                className={cn(STAGE_STYLE[deal.stage].fill, 'transition-[r,opacity]', active ? 'opacity-100' : 'opacity-75')}
                                stroke="hsl(var(--card))"
                                strokeWidth={2}
                            />
                            {active && <circle cx={cx} cy={cy} r={rad + 4} fill="none" stroke="hsl(var(--foreground) / 0.45)" strokeWidth={1.5} />}
                        </g>
                    );
                })}
            </svg>

            {focused && (
                <div
                    className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 rounded-md border bg-card px-3 py-2 text-[12.5px] shadow-lg"
                    style={{ left: Math.min(Math.max(focused.cx, 120), width - 120), top: Math.max(0, focused.cy - focused.rad - 74) }}
                >
                    <p className="font-medium">{focused.deal.title}</p>
                    <p className="text-muted-foreground">{focused.deal.companyName}</p>
                    <p className="mt-1 flex justify-between">
                        <span className="num">{formatMoney(focused.deal.estimatedValue)}</span>
                        <span className={cn('num', focused.days < 0 && 'text-stage-lost')}>
                            {focused.days < 0
                                ? `${-focused.days}d late`
                                : shortDate(new Date(today.getTime() + focused.days * DAY).toISOString())}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}
