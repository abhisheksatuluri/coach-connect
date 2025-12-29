import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import V3Layout from '@/components/v3/V3Layout';
import V3Overlay from '@/components/v3/V3Overlay';
import { Calendar, CheckSquare, Clock, ArrowRight, Sun } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useSessions } from '@/hooks/useSessions';
import { useTasks } from '@/hooks/useTasks';
import { cn } from "@/lib/utils";

export default function V3Dashboard() {
    const [selectedFocus, setSelectedFocus] = useState(null);

    // Fetch Data
    const { data: clients = [] } = useClients();
    const { data: sessions = [] } = useSessions();
    const { data: tasks = [] } = useTasks();

    // Filter Data
    const normalizeStatus = (s) => (s || '').toLowerCase();

    const upcomingSessions = sessions.filter(s => {
        const status = normalizeStatus(s.status);
        return status === 'upcoming' || status === 'scheduled';
    });

    const openTasks = tasks.filter(t => {
        const status = normalizeStatus(t.status);
        return status !== 'completed' && status !== 'done';
    });

    const stats = {
        sessions: upcomingSessions.length,
        tasks: openTasks.length
    };

    return (
        <V3Layout title="Dashboard">

            {/* Greeting Section */}
            <section className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-xs font-medium mb-4 border border-stone-200/50">
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>Monday, Dec 29 • Clear Sky</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-normal text-stone-800 tracking-tight mb-2">
                    Good morning, <span className="text-stone-400">Coach.</span>
                </h1>
                <p className="text-stone-500 text-lg font-light">
                    You have a light schedule today.
                </p>
            </section>

            {/* Today's Focus Card */}
            <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <div
                    onClick={() => setSelectedFocus('schedule')}
                    className="group relative bg-white rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-stone-100 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                >
                    <div className="absolute top-8 right-8 text-stone-300 group-hover:text-teal-600 transition-colors">
                        <ArrowRight className="w-6 h-6" />
                    </div>
                    <h3 className="text-stone-400 font-medium uppercase tracking-widest text-xs mb-3">Today's Focus</h3>
                    <p className="text-2xl sm:text-3xl text-stone-800 font-medium leading-tight">
                        You have <span className="text-teal-700">{stats.sessions} sessions</span> and <span className="text-rose-400">{stats.tasks} tasks</span> requiring your attention.
                    </p>
                </div>
            </section>

            {/* Gentle Sections Vertical Stack */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">

                {/* Upcoming Sessions */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-stone-500 font-medium text-sm tracking-wide">Up Next</h3>
                        <Link to="/v3/sessions" className="text-teal-700 text-sm hover:underline hover:text-teal-800">See all</Link>
                    </div>
                    <div className="space-y-3">
                        {upcomingSessions.slice(0, 3).map((session, i) => {
                            const client = clients.find(c => c.id === (session.clientId || session.client_id));
                            return (
                                <div key={i} className="flex items-center p-4 bg-white rounded-xl border border-stone-100 shadow-sm hover:border-stone-200 transition-colors">
                                    <div className="p-2.5 bg-stone-50 rounded-lg text-stone-600 mr-4">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-stone-800 font-medium">{client ? client.name : 'Client'}</h4>
                                        <p className="text-stone-500 text-sm">{session.title}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-stone-900 font-bold text-sm block">{session.time}</span>
                                        <span className="text-teal-600 text-xs font-medium">{session.date === 'Today' ? 'Today' : session.date}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Tasks */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-stone-500 font-medium text-sm tracking-wide">Tasks for Today</h3>
                        <Link to="/v3/tasks" className="text-teal-700 text-sm hover:underline hover:text-teal-800">See all</Link>
                    </div>
                    <div className="space-y-3">
                        {openTasks.slice(0, 4).map((task, i) => (
                            <div key={i} className="flex items-center p-4 bg-white rounded-xl border border-stone-100 shadow-sm hover:border-stone-200 transition-colors">
                                <div className={cn(
                                    "w-5 h-5 rounded border-2 mr-4 flex items-center justify-center cursor-pointer transition-colors",
                                    task.priority === 'high' ? "border-rose-200 hover:border-rose-400" : "border-stone-200 hover:border-stone-400"
                                )}>
                                    <div className="w-2.5 h-2.5 rounded-sm bg-transparent" />
                                </div>
                                <span className={cn(
                                    "flex-1 text-sm",
                                    task.priority === 'high' ? "text-stone-800 font-medium" : "text-stone-600"
                                )}>
                                    {task.title}
                                </span>
                                {task.priority === 'high' && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                )}
                            </div>
                        ))}
                    </div>
                </section>

            </div>

            {/* Focus Overlay */}
            <V3Overlay
                isOpen={selectedFocus === 'schedule'}
                onClose={() => setSelectedFocus(null)}
                title="Today's Schedule"
            >
                <div className="space-y-6">
                    <p className="text-stone-500">Here is your full agenda for today.</p>
                    {upcomingSessions.map((session, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-stone-50 border border-stone-100">
                            <div className="text-stone-900 font-bold w-16">{session.time}</div>
                            <div>
                                <div className="font-medium text-stone-800">{session.title}</div>
                                <div className="text-stone-500 text-sm">with {clients.find(c => c.id === (session.clientId || session.client_id))?.name || 'Client'}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </V3Overlay>

        </V3Layout>
    );
}
