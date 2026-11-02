import { NavLink } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Users, Columns3, ListChecks, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isDemo } from '@/lib/api';
import { demoApi } from '@/lib/demo';

const navItems = [
    { icon: LayoutGrid, label: 'Overview', href: '/' },
    { icon: Columns3, label: 'Pipeline', href: '/pipeline' },
    { icon: Users, label: 'Contacts', href: '/contacts' },
    { icon: ListChecks, label: 'Activity', href: '/activities' },
];

interface SidebarProps {
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
    const queryClient = useQueryClient();

    const resetDemo = () => {
        demoApi.reset();
        queryClient.invalidateQueries();
    };

    return (
        <>
            <div
                className={cn(
                    'fixed inset-0 z-40 bg-foreground/20 transition-opacity lg:hidden',
                    isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
                onClick={() => setIsMobileOpen(false)}
            />

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r bg-background transition-transform lg:static lg:translate-x-0',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex h-14 items-center gap-2.5 px-5">
                    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="text-primary">
                        <rect x="1" y="1" width="7" height="16" rx="1.5" fill="currentColor" />
                        <rect x="10" y="7" width="7" height="10" rx="1.5" fill="currentColor" opacity=".45" />
                    </svg>
                    <span className="text-[15px] font-semibold tracking-tight">Nexus</span>
                </div>

                <nav className="flex-1 space-y-px px-3 pt-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            end={item.href === '/'}
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    'flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13.5px] transition-colors',
                                    isActive
                                        ? 'bg-card font-medium text-foreground shadow-[0_0_0_1px_hsl(var(--border))]'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                )
                            }
                        >
                            <item.icon size={15} strokeWidth={1.75} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {isDemo && (
                    <div className="m-3 rounded-md border border-dashed p-3 text-xs leading-relaxed text-muted-foreground">
                        <p>
                            Demo mode. Data lives in your browser, so feel free to edit, drag and delete.
                        </p>
                        <button
                            onClick={resetDemo}
                            className="mt-2 inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
                        >
                            <RotateCcw size={12} /> Reset sample data
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
