import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCompact, formatMoney, overdueDeals, pipelineMetrics, summarizeStages } from '@/lib/metrics';
import { STAGE_STYLE } from '@/lib/stages';
import { cn, shortDate, timeAgo } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';
import { ActivityIcon } from '@/components/ActivityIcon';
import { DealRiver } from '@/components/DealRiver';

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
    return (
        <div className="px-5 py-4">
            <p className="eyebrow">{label}</p>
            <p className="num mt-2 text-[26px] font-medium leading-none">{value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
        </div>
    );
}

function Section({ title, link, children }: { title: string; link?: { to: string; label: string }; children: React.ReactNode }) {
    return (
        <section className="rounded-lg border bg-card">
            <div className="flex h-11 items-center justify-between border-b px-4">
                <h2 className="text-[13.5px] font-medium">{title}</h2>
                {link && (
                    <Link to={link.to} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        {link.label} <ArrowRight size={12} />
                    </Link>
                )}
            </div>
            {children}
        </section>
    );
}

export default function Dashboard() {
    const { data: deals = [], isLoading } = useQuery({ queryKey: ['leads'], queryFn: api.leads.list });
    const { data: activities = [] } = useQuery({ queryKey: ['activities'], queryFn: api.activities.list });
    const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: api.contacts.list });

    const m = pipelineMetrics(deals);
    const stages = summarizeStages(deals);
    const openStages = stages.filter((s) => s.stage !== 'Closed Won' && s.stage !== 'Lost');
    const overdue = overdueDeals(deals);
    const biggest = deals
        .filter((d) => d.stage === 'Prospecting' || d.stage === 'Negotiation')
        .sort((a, b) => b.estimatedValue - a.estimatedValue)
        .slice(0, 5);
    const contactName = (id: string) => {
        const c = contacts.find((x) => x._id === id);
        return c ? `${c.firstName} ${c.lastName}` : '';
    };

    const dash = isLoading ? '—' : undefined;

    return (
        <>
            <PageHeader title="Overview" description="Where the pipeline stands today." />

            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-4 [&>*]:bg-card">
                <Stat label="Open pipeline" value={dash ?? formatCompact(m.openValue)} hint={`${m.openCount} open deals`} />
                <Stat label="Weighted forecast" value={dash ?? formatCompact(m.weightedForecast)} hint="Value × win probability" />
                <Stat label="Closed won" value={dash ?? formatCompact(m.wonValue)} hint={`${stages[2].count} deals`} />
                <Stat label="Win rate" value={dash ?? (m.winRate === null ? 'n/a' : `${m.winRate}%`)} hint="Won ÷ (won + lost)" />
            </div>

            {m.openValue > 0 && (
                <div className="mt-6">
                    <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
                        {openStages.map((s) => (
                            <div key={s.stage} className={STAGE_STYLE[s.stage].bar} style={{ width: `${(s.value / m.openValue) * 100}%` }} />
                        ))}
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                        {openStages.map((s) => (
                            <span key={s.stage} className="inline-flex items-center gap-1.5">
                                <span className={cn('h-2 w-2 rounded-full', STAGE_STYLE[s.stage].dot)} />
                                {s.stage} <span className="num text-foreground">{formatMoney(s.value)}</span> · {s.count}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <section className="mt-8 rounded-lg border bg-card">
                <div className="flex h-11 items-center justify-between border-b px-4">
                    <h2 className="text-[13.5px] font-medium">Expected close, next 8 weeks</h2>
                    <p className="text-xs text-muted-foreground">Size is deal value. Drag a deal to move its date.</p>
                </div>
                <div className="px-2 py-3">
                    <DealRiver deals={deals} />
                </div>
            </section>

            <div className="mt-5 grid gap-5 lg:grid-cols-5">
                <div className="space-y-5 lg:col-span-3">
                    <Section title="Largest open deals" link={{ to: '/pipeline', label: 'Pipeline' }}>
                        {biggest.length === 0 ? (
                            <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">No open deals.</p>
                        ) : (
                            <table className="w-full text-[13px]">
                                <tbody>
                                    {biggest.map((d) => (
                                        <tr key={d._id} className="border-b last:border-0">
                                            <td className="py-2.5 pl-4">
                                                <p className="font-medium">{d.title}</p>
                                                <p className="text-xs text-muted-foreground">{d.companyName}</p>
                                            </td>
                                            <td className="hidden px-3 sm:table-cell">
                                                <span className={cn('inline-flex items-center gap-1.5 text-xs', STAGE_STYLE[d.stage].text)}>
                                                    <span className={cn('h-1.5 w-1.5 rounded-full', STAGE_STYLE[d.stage].dot)} />
                                                    {d.stage}
                                                </span>
                                            </td>
                                            <td className="num px-3 text-right text-xs text-muted-foreground">{d.probability}%</td>
                                            <td className="num pr-4 text-right font-medium">{formatMoney(d.estimatedValue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Section>

                    {overdue.length > 0 && (
                        <Section title={`Past expected close · ${overdue.length}`}>
                            <ul>
                                {overdue.map((d) => (
                                    <li key={d._id} className="flex items-center justify-between gap-3 border-b px-4 py-2.5 text-[13px] last:border-0">
                                        <span className="min-w-0 truncate">
                                            {d.title} <span className="text-muted-foreground">· {d.companyName}</span>
                                        </span>
                                        <span className="shrink-0 text-xs text-stage-lost">was due {shortDate(d.expectedCloseDate!)}</span>
                                    </li>
                                ))}
                            </ul>
                        </Section>
                    )}
                </div>

                <div className="lg:col-span-2">
                    <Section title="Recent activity" link={{ to: '/activities', label: 'All' }}>
                        {activities.length === 0 ? (
                            <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">Nothing logged yet.</p>
                        ) : (
                            <ul className="py-1">
                                {activities.slice(0, 7).map((a) => (
                                    <li key={a._id} className="flex gap-3 px-4 py-2.5">
                                        <ActivityIcon type={a.type} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] leading-snug">{a.outcome}</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {contactName(a.relatedTo) || a.type} · {timeAgo(a.date)}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Section>
                </div>
            </div>
        </>
    );
}
