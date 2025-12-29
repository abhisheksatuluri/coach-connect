
import React from 'react';
import { Calendar, CheckSquare, TrendingUp, Users } from 'lucide-react';
import { contactsData, sessionsData, tasksData } from '@/data/v3DummyData';
import { useStackNavigation } from '@/context/StackNavigationContext';
import V3SessionDetail from '../sessions/V3SessionDetail';
import { format } from 'date-fns';

export default function V3DashboardContent() {
    const { pushScreen } = useStackNavigation();
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // Calculate Stats
    const activeClients = contactsData.filter(c => c.status === 'Active').length;
    const sessionsToday = sessionsData.filter(s => {
        // Simple day check
        const sDate = new Date(s.date);
        return sDate.getDate() === today.getDate() && sDate.getMonth() === today.getMonth();
    }).length;
    const tasksDue = tasksData.filter(t => !t.completed).length; // Simplified for "Due"
    const revenue = 2400; // Mocked from payments but lets keep the static good looking number or sum it up.

    // Get Today's Schedule
    const todaysSessions = sessionsData.filter(s => {
        const sDate = new Date(s.date);
        return sDate.getDate() === today.getDate() && sDate.getMonth() === today.getMonth();
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Greeting Section */}
            <div className="space-y-1">
                <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Good Morning, Sarah</h2>
                <p className="text-stone-500 font-medium">{todayStr} • You have {sessionsToday > 0 ? `${sessionsToday} sessions` : 'a light day'} ahead.</p>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active Clients', val: activeClients, icon: Users, color: 'text-teal-600 bg-teal-50' },
                    { label: 'Sessions Today', val: sessionsToday, icon: Calendar, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Tasks Due', val: tasksDue, icon: CheckSquare, color: 'text-rose-600 bg-rose-50' },
                    { label: 'Revenue', val: `$${(revenue / 1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
                ].map((stat, i) => (
                    <button key={i} className="p-4 bg-white rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:scale-[1.02] transition-all text-left">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-stone-900">{stat.val}</div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Today's Schedule - Zen Card */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-stone-900">Today's Schedule</h3>
                    <button className="text-sm font-medium text-teal-600 hover:text-teal-700">View Calendar</button>
                </div>
                <div className="divide-y divide-stone-50">
                    {todaysSessions.length === 0 ? (
                        <div className="p-8 text-center text-stone-400 italic">No sessions scheduled for today.</div>
                    ) : (
                        todaysSessions.map((session, i) => {
                            const contactName = contactsData.find(c => c.id === session.contactId)?.name || 'Unknown';
                            return (
                                <div
                                    key={i}
                                    onClick={() => pushScreen(V3SessionDetail, { session })}
                                    className="p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors cursor-pointer group"
                                >
                                    <div className="min-w-[80px] text-right">
                                        <div className="font-bold text-stone-900">{format(new Date(session.date), 'h:mm a')}</div>
                                        <div className="text-xs text-stone-400 font-medium">{session.duration} min</div>
                                    </div>
                                    <div className="w-1 h-12 rounded-full bg-stone-200 group-hover:bg-teal-400 transition-colors" />
                                    <div>
                                        <div className="font-bold text-stone-900">{contactName}</div>
                                        <div className="text-sm text-stone-500">{session.title}</div>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wide">
                                            {session.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

