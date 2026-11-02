import { NavLink } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Users, Columns3, ListChecks, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isDemo } from '@/lib/api';
import { demoApi } from '@/lib/demo';

const navItems = [
    { icon: LayoutGrid, label: 'Overview', href: '/', key: 'o' },
    { icon: Columns3, label: 'Pipeline', href: '/pipeline', key: 'p' },
    { icon: Users, label: 'Contacts', href: '/contacts', key: 'c' },
    { icon: ListChecks, label: 'Activity', href: '/activities', key: 'a' },
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
                    'fixed inset-0 z-40 bg-background/80 transition-opacity lg:hidden',
                    isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
                onClick={() => setIsMobileOpen(false)}
            />

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-background transition-transform lg:static lg:translate-x-0',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex h-14 items-center gap-2 border-b px-5">
                    <span className="bg-primary px-1.5 text-[13px] font-bold text-primary-foreground">NX</span>
                    <span className="text-[14px] font-semibold tracking-[0.18em]">NEXUS</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">v2.0</span>
                </div>

                <nav className="flex-1 px-2 pt-3">
                    <p className="eyebrow px-3 pb-2">── navigate</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            end={item.href === '/'}
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    'group relative flex h-9 items-center gap-2.5 px-3 text-[13px] transition-colors',
                                    isActive ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={cn('w-2 text-primary', !isActive && 'opacity-0')}>▌</span>
                                    <item.icon size={14} strokeWidth={1.75} />
                                    {item.label.toLowerCase()}
                                    <kbd className="ml-auto text-[10.5px] text-muted-foreground group-hover:text-foreground">g {item.key}</kbd>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {isDemo && (
                    <div className="m-3 border border-dashed p-3 text-[11.5px] leading-relaxed text-muted-foreground">
                        <p>
                            <span className="text-primary">demo</span> · data lives in your browser. edit, drag and delete freely.
                        </p>
                        <button
                            onClick={resetDemo}
                            className="mt-2 inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
                        >
                            <RotateCcw size={12} /> reset sample data
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
