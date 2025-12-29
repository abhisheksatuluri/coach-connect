
import React from 'react';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { sessionsData, contactsData } from '@/data/v3DummyData';
import { useStackNavigation } from '@/context/StackNavigationContext';
import V3SessionDetail from './V3SessionDetail';
import { format, isFuture, isToday } from 'date-fns';

export default function V3SessionList() {
    const { pushScreen } = useStackNavigation();

    // Sort: Upcoming (nearest first), Past (most recent first)
    const upcoming = sessionsData
        .filter(s => s.status === 'Upcoming')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const past = sessionsData
        .filter(s => s.status === 'Completed')
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Helper to render session item
    const SessionItem = ({ session }) => {
        const contact = contactsData.find(c => c.id === session.contactId);
        const date = new Date(session.date);

        return (
            <div
                onClick={() => pushScreen(V3SessionDetail, { session })}
                className="p-3 bg-white rounded-xl border border-stone-200 shadow-sm flex items-center gap-3 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group"
            >
                <div className={cn(
                    "w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-bold shrink-0",
                    session.status === 'Upcoming' ? "bg-teal-50 text-teal-700" : "bg-stone-100 text-stone-400"
                )}>
                    <span>{format(date, 'h:mm')}</span>
                    <span>{format(date, 'a')}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-stone-900 text-sm truncate group-hover:text-teal-700 transition-colors">{session.title}</div>
                    <div className="text-xs text-stone-500 truncate">{contact?.name || 'Unknown Client'} • {format(date, 'MMM d')}</div>
                </div>
                {session.status === 'Completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-stone-100 bg-stone-50/50 sticky top-0 z-10">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Upcoming Schedules</h3>
                <div className="space-y-2">
                    {upcoming.length === 0 ? (
                        <div className="text-sm text-stone-400 italic text-center py-2">No upcoming sessions</div>
                    ) : (
                        upcoming.map(s => <SessionItem key={s.id} session={s} />)
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Past Sessions</h3>
                <div className="space-y-2">
                    {past.map(s => <SessionItem key={s.id} session={s} />)}
                </div>
            </div>
        </div>
    );
}

