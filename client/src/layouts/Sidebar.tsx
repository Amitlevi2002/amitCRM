import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Target,
    Activity,
    ChevronLeft,
    ChevronRight,
    Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Users, label: 'Contacts', href: '/contacts' },
    { icon: Target, label: 'Pipeline', href: '/pipeline' },
    { icon: Activity, label: 'Activities', href: '/activities' },
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen, isMobileOpen, setIsMobileOpen }: SidebarProps) {
    const location = useLocation();

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
                    isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsMobileOpen(false)}
            />

            <aside
                className={cn(
                    "glass border-r border-white/20 dark:border-slate-800/50 z-50 flex flex-col transition-all duration-300 ease-in-out",
                    "fixed inset-y-0 left-0",
                    "lg:static lg:h-screen",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full",
                    "lg:translate-x-0",
                    isOpen ? "w-72" : "w-20"
                )}
            >
                {/* Logo Area */}
                <div className={cn("p-6 flex items-center mb-6", isOpen ? "justify-between" : "justify-center")}>
                    <Link
                        to="/"
                        className={cn(
                            "flex items-center gap-3 transition-opacity duration-300",
                            !isOpen && "hidden"
                        )}
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30">
                            N
                        </div>
                        <span className="font-bold text-2xl text-slate-800 dark:text-white tracking-tight">Nexus</span>
                    </Link>

                    {!isOpen && (
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30 mb-2">
                            N
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(
                            "hover:bg-primary/10 hover:text-primary rounded-full hidden lg:flex",
                            !isOpen && "hidden" // Hide toggler when closed (user can click logo or main area to open? maybe just keep it simple)
                        )}
                    >
                        <ChevronLeft size={20} />
                    </Button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-4 space-y-3 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                to={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                                        : "hover:bg-white/50 dark:hover:bg-slate-800/50 hover:scale-[1.02] text-slate-600 dark:text-slate-300",
                                    !isOpen && "justify-center p-3"
                                )}
                            >
                                <item.icon
                                    size={22}
                                    className={cn(
                                        "transition-transform duration-300 group-hover:scale-110",
                                        isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-primary"
                                    )}
                                />
                                {isOpen && (
                                    <span className="font-semibold tracking-wide">
                                        {item.label}
                                    </span>
                                )}

                                {/* Active Indicator (Glow) */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 mt-auto">
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-4 rounded-2xl p-4 h-auto hover:bg-red-50 hover:text-red-500 transition-all",
                            !isOpen && "justify-center px-0"
                        )}
                    >
                        <Settings size={22} />
                        {isOpen && <span className="font-semibold">Settings</span>}
                    </Button>

                    {/* Toggle for closed state to re-open */}
                    {!isOpen && (
                        <Button
                            variant="ghost"
                            className="w-full mt-2 hover:bg-slate-100 rounded-xl"
                            onClick={() => setIsOpen(true)}
                        >
                            <ChevronRight size={20} />
                        </Button>
                    )}
                </div>
            </aside>
        </>
    );
}
