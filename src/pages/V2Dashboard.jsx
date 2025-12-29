import React from 'react';
import V2Layout from '@/components/v2/V2Layout';
import V2PanelSystem from '@/components/v2/V2PanelSystem';
import { Search, TrendingUp, Users, CheckSquare, Calendar, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClients } from '@/hooks/useClients';
import { useSessions } from '@/hooks/useSessions';
import { useTasks } from '@/hooks/useTasks';

// Stat Card Component
const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-start justify-between hover:border-slate-600 transition-colors cursor-pointer group">
        <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>
            <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded",
                change.startsWith('+') ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"
            )}>
                {change}
            </span>
        </div>
        <div className={cn("p-2 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity",
            color === 'emerald' ? "bg-emerald-500/10 text-emerald-400" :
                color === 'indigo' ? "bg-indigo-500/10 text-indigo-400" :
                    color === 'amber' ? "bg-amber-500/10 text-amber-400" :
                        "bg-rose-500/10 text-rose-400"
        )}>
            <Icon className="w-5 h-5" />
        </div>
    </div>
);

// Helper for conditional class names
function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

// Dashboard Content
const DashboardContent = () => {
    const { data: clients, isLoading: loadingClients } = useClients();
    const { data: sessions, isLoading: loadingSessions } = useSessions();
    const { data: tasks, isLoading: loadingTasks } = useTasks();

    if (loadingClients || loadingSessions || loadingTasks) {
        return <div className="p-12 text-center text-slate-500">Loading Command Center...</div>;
    }

    // Default to empty arrays if undefined
    const safeClients = clients || [];
    const safeSessions = sessions || [];
    const safeTasks = tasks || [];

    // Transform Data for Dashboard
    const activeClientsCount = safeClients.filter(c => c.status === 'Active').length;
    const upcomingSessions = safeSessions.filter(s => s.status === 'upcoming');
    const tasksDueCount = safeTasks.filter(t => t.status !== 'completed').length;
    const revenue = 12500; // Mock revenue

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Good morning, Coach</h1>
                    <p className="text-slate-400 text-sm">Here's what's happening today, Dec 29</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Command + K..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    title="Active Clients"
                    value={activeClientsCount}
                    change="+2 this week"
                    icon={Users}
                    color="emerald"
                />
                <StatCard
                    title="Revenue MTD"
                    value={`$${revenue}`}
                    change="+12% vs last"
                    icon={TrendingUp}
                    color="indigo"
                />
                <StatCard
                    title="Tasks Due"
                    value={tasksDueCount}
                    change="4 high priority"
                    icon={CheckSquare}
                    color="amber"
                />
                <StatCard
                    title="Sessions"
                    value={upcomingSessions.length}
                    change="Upcoming"
                    icon={Calendar}
                    color="rose"
                />
            </div>

            {/* Timeline / Agenda */}
            <Card className="bg-slate-900 border border-slate-800 text-slate-200">
                <div className="border-b border-slate-800 p-4 flex items-center justify-between">
                    <h3 className="font-semibold">Today's Schedule</h3>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">View Calendar</button>
                </div>
                <CardContent className="p-0">
                    {upcomingSessions.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">No upcoming sessions today.</div>
                    ) : (
                        upcomingSessions.slice(0, 5).map((session, i) => {
                            const client = safeClients.find(c => c.id === session.clientId);
                            return (
                                <div key={i} className="flex items-center py-4 px-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors last:border-0 relative group">
                                    <div className="w-20 font-mono text-sm text-slate-500">{session.time}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-200">{client ? (client.name || client.full_name) : 'Unknown Client'}</span>
                                            {session.date === 'Today' && (
                                                <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">{session.title}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className={cn(
                                            "border-0",
                                            session.status === 'completed' ? "bg-slate-800 text-slate-400" :
                                                session.date === 'Today' ? "bg-rose-500/20 text-rose-400" :
                                                    "bg-indigo-500/20 text-indigo-400"
                                        )}>
                                            {session.status === 'upcoming' && session.date === 'Today' ? 'Live Now' : session.status}
                                        </Badge>
                                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded text-slate-400 transition-all">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {session.date === 'Today' && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                                    )}
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    )
};

// Recent Activity Content for Side Panel
const RecentActivityContent = () => (
    <div className="space-y-4">
        {/* Mock recent activity derived from tasks/sessions just for visual consistency */}
        {[
            { user: 'Sarah M.', action: 'completed a session', time: '2h ago' },
            { user: 'Mike R.', action: 'uploaded a journal entry', time: '4h ago' },
            { user: 'Coach', action: 'updated notes for Nina', time: '5h ago' }
        ].map((item, i) => (
            <div key={i} className="flex gap-3 pb-4 border-b border-slate-700/50 last:border-0">
                <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        {item.user.charAt(0)}
                    </div>
                </div>
                <div>
                    <p className="text-sm text-slate-300">
                        <span className="font-medium text-white">{item.user}</span> {item.action}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                </div>
            </div>
        ))}
    </div>
);

export default function V2Dashboard() {
    const [isActivityPanelOpen, setIsActivityPanelOpen] = React.useState(true);

    return (
        <V2Layout>
            <V2PanelSystem
                primaryContent={<DashboardContent />}
                secondaryContent={isActivityPanelOpen ? <RecentActivityContent /> : null}
                isSplit={isActivityPanelOpen}
                onToggleSplit={() => setIsActivityPanelOpen(!isActivityPanelOpen)}
            />
        </V2Layout>
    );
}
