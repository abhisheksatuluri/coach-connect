import React from 'react';
import { Calendar, CheckSquare, TrendingUp, Users } from 'lucide-react';

export default function V3DashboardContent() {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Greeting Section */}
            <div className="space-y-1">
                <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Good Morning, Sarah</h2>
                <p className="text-stone-500 font-medium">{today} • You have a light day ahead.</p>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active Clients', val: '24', icon: Users, color: 'text-teal-600 bg-teal-50' },
                    { label: 'Sessions Today', val: '3', icon: Calendar, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Tasks Due', val: '5', icon: CheckSquare, color: 'text-rose-600 bg-rose-50' },
                    { label: 'Revenue', val: '$2.4k', icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
                ].map((stat, i) => (
                    <div key={i} className="p-4 bg-white rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-stone-900">{stat.val}</div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Today's Schedule - Zen Card */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-stone-900">Today's Schedule</h3>
                    <button className="text-sm font-medium text-teal-600 hover:text-teal-700">View Calendar</button>
                </div>
                <div className="divide-y divide-stone-50">
                    {[
                        { time: '10:00 AM', client: 'Sarah Connor', type: 'Weekly Check-in', status: 'Upcoming' },
                        { time: '2:00 PM', client: 'John Smith', type: 'Goal Setting', status: 'Upcoming' },
                        { time: '4:30 PM', client: 'Mike Ross', type: 'Emergency Call', status: 'Pending' },
                    ].map((event, i) => (
                        <div key={i} className="p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors cursor-pointer group">
                            <div className="min-w-[80px] text-right">
                                <div className="font-bold text-stone-900">{event.time}</div>
                                <div className="text-xs text-stone-400 font-medium">45 min</div>
                            </div>
                            <div className="w-1 h-12 rounded-full bg-stone-200 group-hover:bg-teal-400 transition-colors" />
                            <div>
                                <div className="font-bold text-stone-900">{event.client}</div>
                                <div className="text-sm text-stone-500">{event.type}</div>
                            </div>
                            <div className="ml-auto">
                                <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wide">
                                    {event.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
