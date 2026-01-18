import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, Calendar, Phone, Mail, StickyNote } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TopBarProps {
    onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<any>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    const { data: activities = [] } = useQuery({
        queryKey: ['activities'],
        queryFn: api.activities.list,
        refetchInterval: 30000
    });

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notifRef]);

    const recentActivities = activities.slice(0, 5);
    const hasNew = recentActivities.length > 0;

    const getIcon = (type: string) => {
        switch (type) {
            case 'Call': return <Phone size={14} className="text-blue-500" />;
            case 'Email': return <Mail size={14} className="text-purple-500" />;
            case 'Meeting': return <Calendar size={14} className="text-orange-500" />;
            default: return <StickyNote size={14} className="text-yellow-500" />;
        }
    };

    return (
        <header className="h-16 px-6 flex items-center justify-between glass border-b border-white/20 dark:border-slate-800/50 shrink-0 z-40 sticky top-0">

            {/* Mobile Menu & Title */}
            <div className="flex items-center gap-4 flex-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-xl hover:bg-primary/20 hover:text-primary"
                    onClick={onMenuClick}
                >
                    <Menu size={24} className="text-slate-600 dark:text-slate-200" />
                </Button>

                {/* Search Bar */}
                <div className="relative w-full max-w-lg hidden md:block group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <Input
                        className="pl-10 h-10 bg-white/50 dark:bg-slate-800/50 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-slate-800 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all rounded-xl text-sm shadow-sm"
                        placeholder="Type to search..."
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val.length >= 2) {
                                api.search.query(val).then((data: any) => {
                                    setSearchResults(data);
                                    setIsSearchOpen(true);
                                });
                            } else {
                                setIsSearchOpen(false);
                            }
                        }}
                        onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                    />

                    {/* Search Dropdown - Same as before but with glass style */}
                    {isSearchOpen && searchResults && (
                        <div className="absolute top-full left-0 right-0 mt-3 glass-card rounded-2xl p-2 z-50 overflow-hidden max-h-[400px] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                            {searchResults.contacts?.length > 0 && (
                                <div className="p-2">
                                    <h5 className="text-xs font-bold text-slate-500 px-2 py-1 uppercase tracking-wider">Contacts</h5>
                                    {searchResults.contacts.map((c: any) => (
                                        <div
                                            key={c._id}
                                            className="p-3 hover:bg-primary/5 rounded-xl cursor-pointer flex items-center gap-3 transition-colors"
                                            onClick={() => {
                                                navigate('/contacts');
                                                setIsSearchOpen(false);
                                            }}
                                        >
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                                                {c.firstName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{c.firstName} {c.lastName}</p>
                                                <p className="text-xs text-slate-500">{c.company}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {(!searchResults.contacts?.length && !searchResults.leads?.length) && (
                                <div className="p-4 text-center text-sm text-slate-500">
                                    No results found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <div className="relative" ref={notifRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "relative w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all",
                            isNotifOpen && "bg-slate-100 dark:bg-slate-800 text-primary"
                        )}
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                    >
                        <Bell size={20} className={cn("text-slate-600 dark:text-slate-300", isNotifOpen && "fill-current")} />
                        {hasNew && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                        )}
                    </Button>

                    {isNotifOpen && (
                        <div className="absolute right-0 top-full mt-4 w-96 glass-card rounded-3xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-0">
                            <div className="p-5 border-b border-slate-100/50">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-lg">Notifications</h4>
                                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
                                        {recentActivities.length} New
                                    </span>
                                </div>
                            </div>
                            <div className="max-h-[350px] overflow-y-auto p-2 space-y-1">
                                {recentActivities.length === 0 ? (
                                    <p className="text-center text-sm text-slate-500 py-8">No new notifications.</p>
                                ) : (
                                    recentActivities.map((act: any) => (
                                        <div key={act._id} className="flex items-start gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all cursor-pointer group">
                                            <div className="mt-1 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                {getIcon(act.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{act.type}</p>
                                                <p className="text-xs text-slate-500 truncate">{act.outcome}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{new Date(act.date).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Amit Levi</p>
                        <p className="text-xs text-slate-500 font-medium">Sales Manager</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:ring-2 hover:ring-primary/50 transition-all p-1"
                        onClick={() => toast({ title: "Profile", description: "Implementation pending." })}
                    >
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                            A
                        </div>
                    </Button>
                </div>
            </div>
        </header>
    );
}
