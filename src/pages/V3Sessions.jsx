import React, { useState } from 'react';
import V3Layout from '@/components/v3/V3Layout';
import V3SessionCard from '@/components/v3/sessions/V3SessionCard';
import V3SessionOverlay from '@/components/v3/sessions/V3SessionOverlay';
import { Plus, Calendar } from 'lucide-react';
import { cn } from "@/lib/utils";

import { useSessions } from '@/hooks/useSessions';

// MOCK_SESSIONS removed in favor of hook

const GroupHeader = ({ title }) => (
    <h3 className="text-stone-500 font-medium text-sm tracking-wide mt-8 mb-4 px-1">{title}</h3>
);

export default function V3Sessions() {
    const { data: sessions = [], isLoading } = useSessions();
    const [selectedSession, setSelectedSession] = useState(null);
    const [view, setView] = useState('Upcoming'); // Upcoming | Past

    // Filtering
    const now = new Date();
    // Parse helper since rawDate might be different in mock vs real
    const parseDate = (d) => {
        if (!d || d === 'Today' || d === 'Yesterday') return new Date(); // Fallback for simplicity
        return new Date(d);
        // Note: Real data likely has ISO strings; this logic simulates the original mock logic
        // but with actual hook data we might need robust parsing.
        // For now, assuming rawDate/date exists in hook data similar to mock.
    };

    const filtered = sessions.filter(s => {
        // Simple status check as proxy for date logic if rawDate not reliable
        if (view === 'Upcoming') return s.status === 'Upcoming' || s.status === 'Scheduled';
        return s.status === 'Completed' || s.status === 'Cancelled';
    });

    // Grouping
    const groups = filtered.reduce((acc, session) => {
        const date = session.date || session.displayDate || 'No Date';
        if (!acc[date]) acc[date] = [];
        acc[date].push(session);
        return acc;
    }, {});

    return (
        <V3Layout title="Sessions">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-normal text-stone-800 tracking-tight">Schedule</h1>
            </div>

            {/* Toggle */}
            <div className="flex justify-center mb-8">
                <div className="bg-stone-100 p-1 rounded-full flex">
                    {['Upcoming', 'Past'].map(v => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                                view === v
                                    ? "bg-white text-stone-900 shadow-sm"
                                    : "text-stone-500 hover:text-stone-700"
                            )}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="pb-20">
                {isLoading ? (
                    <div className="text-center py-12 text-stone-500">Loading sessions...</div>
                ) : Object.keys(groups).length > 0 ? Object.entries(groups).map(([date, sessions]) => (
                    <div key={date}>
                        <GroupHeader title={date} />
                        <div className="space-y-1">
                            {sessions.map(session => (
                                <V3SessionCard
                                    key={session.id}
                                    session={session}
                                    onClick={() => setSelectedSession(session)}
                                />
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="text-stone-900 font-medium">No {view.toLowerCase()} sessions</h3>
                        <p className="text-stone-500 text-sm mt-1">Check your filters or schedule a new one.</p>
                    </div>
                )}
            </div>

            {/* FAB */}
            <button className="fixed bottom-20 right-6 w-14 h-14 bg-teal-700 hover:bg-teal-800 text-white rounded-full shadow-lg shadow-teal-900/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40">
                <Plus className="w-6 h-6" />
            </button>

            {/* Detail Overlay */}
            <V3SessionOverlay
                session={selectedSession}
                isOpen={!!selectedSession}
                onClose={() => setSelectedSession(null)}
            />

        </V3Layout>
    );
}
