import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/metrics';
import { STAGE_STYLE } from '@/lib/stages';
import { cn } from '@/lib/utils';

interface TopBarProps {
    onMenuClick: () => void;
}

function useDebounced<T>(value: T, ms: number) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), ms);
        return () => clearTimeout(t);
    }, [value, ms]);
    return v;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const [q, setQ] = useState('');
    const [open, setOpen] = useState(false);
    const term = useDebounced(q.trim(), 180);

    const { data: results } = useQuery({
        queryKey: ['search', term],
        queryFn: () => api.search.query(term),
        enabled: term.length >= 2,
    });

    // "/" focuses search from anywhere, like most tools people already know.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const typing = e.target instanceof HTMLElement && /input|textarea|select/i.test(e.target.tagName);
            if (e.key === '/' && !typing) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const go = (path: string) => {
        setOpen(false);
        setQ('');
        inputRef.current?.blur();
        navigate(path);
    };

    const empty = results && !results.contacts.length && !results.leads.length;

    return (
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-5 md:px-8">
            <button onClick={onMenuClick} className="-ml-1 rounded-md p-1.5 text-muted-foreground hover:bg-secondary lg:hidden" aria-label="Open menu">
                <Menu size={18} />
            </button>

            <div className="relative w-full max-w-sm">
                <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    onKeyDown={(e) => e.key === 'Escape' && inputRef.current?.blur()}
                    placeholder="Search contacts and deals"
                    className="h-8 w-full rounded-md border border-transparent bg-secondary pl-8 pr-8 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-input focus:bg-card"
                />
                <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-card px-1 font-mono text-[10px] text-muted-foreground">/</kbd>

                {open && term.length >= 2 && results && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border bg-card py-1 shadow-lg">
                        {results.contacts.length > 0 && <p className="eyebrow px-3 pb-1 pt-2">Contacts</p>}
                        {results.contacts.map((c) => (
                            <button key={c._id} onMouseDown={() => go(`/contacts?q=${encodeURIComponent(c.lastName)}`)} className="flex w-full items-baseline justify-between gap-3 px-3 py-1.5 text-left text-[13px] hover:bg-secondary">
                                <span className="truncate">{c.firstName} {c.lastName}</span>
                                <span className="truncate text-xs text-muted-foreground">{c.companyName}</span>
                            </button>
                        ))}
                        {results.leads.length > 0 && <p className="eyebrow px-3 pb-1 pt-2">Deals</p>}
                        {results.leads.map((d) => (
                            <button key={d._id} onMouseDown={() => go('/pipeline')} className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-[13px] hover:bg-secondary">
                                <span className="flex min-w-0 items-center gap-2">
                                    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', STAGE_STYLE[d.stage].dot)} />
                                    <span className="truncate">{d.title}</span>
                                </span>
                                <span className="num text-xs text-muted-foreground">{formatMoney(d.estimatedValue)}</span>
                            </button>
                        ))}
                        {empty && <p className="px-3 py-3 text-[13px] text-muted-foreground">Nothing matches “{term}”.</p>}
                    </div>
                )}
            </div>

            <p className="ml-auto hidden text-[13px] text-muted-foreground sm:block">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
        </header>
    );
}
