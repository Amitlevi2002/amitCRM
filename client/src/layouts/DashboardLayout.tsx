import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { api, isDemo } from '@/lib/api';
import { formatCompact, pipelineMetrics } from '@/lib/metrics';
import { GOTO } from '@/lib/shortcuts';

const typing = (t: EventTarget | null) => t instanceof HTMLElement && (/input|textarea|select/i.test(t.tagName) || t.isContentEditable);

export default function DashboardLayout() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [help, setHelp] = useState(false);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { data: deals = [] } = useQuery({ queryKey: ['leads'], queryFn: api.leads.list });
    const m = pipelineMetrics(deals);

    useEffect(() => {
        let pending = false;
        let timer: ReturnType<typeof setTimeout>;
        const onKey = (e: KeyboardEvent) => {
            if (typing(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
            if (e.key === '?') { setHelp((h) => !h); return; }
            if (e.key === 'Escape') { setHelp(false); return; }
            if (pending && GOTO[e.key]) {
                navigate(GOTO[e.key].path);
                pending = false;
                return;
            }
            pending = e.key === 'g';
            clearTimeout(timer);
            if (pending) timer = setTimeout(() => (pending = false), 900);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [navigate]);

    const here = Object.values(GOTO).find((g) => g.path === pathname)?.label ?? '';

    return (
        <div className="flex h-screen w-full flex-col overflow-hidden">
            <div className="flex min-h-0 flex-1">
                <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
                <div className="flex min-w-0 flex-1 flex-col">
                    <TopBar onMenuClick={() => setIsMobileOpen(true)} />
                    <main className="flex-1 overflow-y-auto">
                        <div key={pathname} className="boot mx-auto w-full max-w-[1240px] px-5 py-7 md:px-8">
                            <Suspense fallback={null}>
                                <Outlet />
                            </Suspense>
                        </div>
                    </main>
                </div>
            </div>

            {/* status line, the way vim or tmux show it */}
            <footer className="flex h-7 shrink-0 items-center gap-0 overflow-hidden border-t bg-card text-[11.5px] tabular-nums">
                <span className="flex h-full items-center bg-primary px-3 font-semibold text-primary-foreground">NEXUS</span>
                <span className="px-3 text-foreground">{here.toLowerCase()}</span>
                <span className="hidden px-3 text-muted-foreground sm:inline">open {formatCompact(m.openValue)} · {m.openCount} deals · win {m.winRate ?? '–'}%</span>
                <span className="ml-auto px-3 text-muted-foreground">{isDemo ? 'demo data' : 'live'}</span>
                <button onClick={() => setHelp(true)} className="flex h-full items-center border-l px-3 text-primary hover:bg-secondary">? keys</button>
            </footer>

            {help && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4" onClick={() => setHelp(false)}>
                    <div className="w-full max-w-sm border border-primary bg-card p-5 text-[13px]" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Keyboard shortcuts">
                        <p className="mb-3 text-primary">── keyboard ──</p>
                        <ul className="space-y-1.5">
                            {Object.entries(GOTO).map(([k, g]) => (
                                <li key={k} className="flex justify-between"><span>{g.label}</span><kbd className="text-primary">g {k}</kbd></li>
                            ))}
                            <li className="flex justify-between"><span>Search</span><kbd className="text-primary">/</kbd></li>
                            <li className="flex justify-between"><span>Move a focused deal</span><kbd className="text-primary">← →</kbd></li>
                            <li className="flex justify-between"><span>This list</span><kbd className="text-primary">?</kbd></li>
                        </ul>
                        <p className="mt-4 text-muted-foreground">esc to close</p>
                    </div>
                </div>
            )}

            <div className="scanlines" aria-hidden="true" />
        </div>
    );
}
