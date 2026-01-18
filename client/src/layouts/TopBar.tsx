import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, Menu, Calendar, Phone, Mail, StickyNote } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

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
        refetchInterval: 30000 // Poll every 30s
    });

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notifRef]);

    const recentActivities = activities.slice(0, 5); // Show last 5
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 relative">
            <div className="flex items-center gap-4 flex-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-xl hover:bg-slate-100"
                    onClick={onMenuClick}
                >
                    <Menu size={20} className="text-slate-600" />
                </Button>
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        className="pl-10 bg-slate-50 border-none focus-visible:ring-primary/20 transition-all rounded-xl"
                        placeholder="Search contacts, deals, activities..."
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
                    {isSearchOpen && searchResults && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden max-h-[400px] overflow-y-auto">
                            {searchResults.contacts?.length > 0 && (
                                <div className="p-2">
                                    <h5 className="text-xs font-semibold text-slate-500 px-2 py-1 uppercase">Contacts</h5>
                                    {searchResults.contacts.map((c: any) => (
                                        <div
                                            key={c._id}
                                            className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center gap-2"
                                            onClick={() => {
                                                navigate('/contacts');
                                                setIsSearchOpen(false);
                                            }}
                                        >
                                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                {c.firstName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{c.firstName} {c.lastName}</p>
                                                <p className="text-xs text-slate-500">{c.company}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {searchResults.leads?.length > 0 && (
                                <div className="p-2 border-t border-slate-100">
                                    <h5 className="text-xs font-semibold text-slate-500 px-2 py-1 uppercase">Deals</h5>
                                    {searchResults.leads.map((l: any) => (
                                        <div
                                            key={l._id}
                                            className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center gap-2"
                                            onClick={() => {
                                                navigate('/pipeline');
                                                setIsSearchOpen(false);
                                            }}
                                        >
                                            <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                $
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{l.title}</p>
                                                <p className="text-xs text-slate-500">{l.companyName} • {l.stage}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {searchResults.activities?.length > 0 && (
                                <div className="p-2 border-t border-slate-100">
                                    <h5 className="text-xs font-semibold text-slate-500 px-2 py-1 uppercase">Activities</h5>
                                    {searchResults.activities.map((a: any) => (
                                        <div
                                            key={a._id}
                                            className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center gap-2"
                                            onClick={() => {
                                                navigate('/activities');
                                                setIsSearchOpen(false);
                                            }}
                                        >
                                            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                <StickyNote size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{a.description}</p>
                                                <p className="text-xs text-slate-500">{a.type}</p>
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

            <div className="flex items-center gap-4">
                <div className="relative" ref={notifRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`relative rounded-xl hover:bg-slate-100 ${isNotifOpen ? 'bg-slate-100' : ''}`}
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                    >
                        <Bell size={20} className="text-slate-600" />
                        {hasNew && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
                    </Button>

                    {isNotifOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-slate-100 pb-2">
                                <h4 className="font-semibold text-slate-900 leading-none">Notifications</h4>
                                <p className="text-xs text-slate-500 mt-1">Based on recent activity logs.</p>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                                {recentActivities.length === 0 ? (
                                    <p className="text-center text-sm text-slate-500 py-4">No new notifications.</p>
                                ) : (
                                    recentActivities.map((act: any) => (
                                        <div key={act._id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                                            <div className="mt-1 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                {getIcon(act.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{act.type}</p>
                                                <p className="text-xs text-slate-500 truncate">{act.outcome}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{new Date(act.date).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900 leading-tight">Amit Levi</p>
                        <p className="text-xs text-slate-500">Sales Manager</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200"
                        onClick={() => toast({ title: "User Profile", description: "Profile settings coming soon." })}
                    >
                        <User size={20} className="text-slate-600" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
