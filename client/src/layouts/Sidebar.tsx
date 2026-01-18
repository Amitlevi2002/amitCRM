import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Target,
    Activity,
    ChevronLeft,
    ChevronRight
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
        <aside
            className={cn(
                "bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col h-full z-50",
                "fixed inset-y-0 left-0 lg:static lg:translate-x-0",
                isMobileOpen ? "translate-x-0" : "-translate-x-full",
                isOpen ? "w-64" : "w-20"
            )}
        >
            <div className="p-6 flex items-center justify-between">
                <Link to="/" className={cn("flex items-center gap-2 font-bold text-xl text-primary transition-opacity duration-300", !isOpen && "opacity-0 invisible")}>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">N</div>
                    <span>NexusCRM</span>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className="hover:bg-slate-100"
                >
                    {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </Button>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-slate-100 group",
                            location.pathname === item.href && "bg-primary/5 text-primary",
                            !isOpen && "justify-center"
                        )}
                    >
                        <item.icon className={cn(
                            "text-slate-500 group-hover:text-primary transition-colors",
                            location.pathname === item.href && "text-primary"
                        )} size={20} />
                        {isOpen && <span className={cn(
                            "text-slate-700 font-medium group-hover:text-primary transition-colors",
                            location.pathname === item.href && "text-primary font-bold"
                        )}>{item.label}</span>}
                    </Link>
                ))}
            </nav>

        </aside>
    );
}
