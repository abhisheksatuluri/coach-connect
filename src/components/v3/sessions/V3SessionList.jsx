import React from 'react';
import { Calendar, Clock, CheckCircle2, ChevronRight, Video, Phone, Users } from 'lucide-react';
import { cn } from "@/lib/utils";
import { sessionsData, contactsData } from '@/data/v3DummyData';
import { useStackNavigation } from '@/context/StackNavigationContext';
import V3SessionDetail from './V3SessionDetail';
import { format } from 'date-fns';
import PremiumScrollContainer from '@/components/v3/shared/PremiumScrollContainer';
import ScrollShrinkHeader from '@/components/v3/shared/ScrollShrinkHeader';
import StickySectionHeader from '@/components/v3/shared/StickySectionHeader';

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
            <button
                onClick={() => pushScreen(V3SessionDetail, { session })}
                className="w-full p-4 bg-white rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4 hover:border-teal-500/50 hover:shadow-md transition-all group text-left active:scale-[0.98] duration-200"
            >
                <div className={cn(
                    "w-12 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold shrink-0 transition-colors",
                    session.status === 'Upcoming' ? "bg-teal-50 text-teal-700" : "bg-stone-100 text-stone-400"
                )}>
                    <span>{format(date, 'd')}</span>
                    <span className="uppercase text-[10px]">{format(date, 'MMM')}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="font-bold text-stone-900 truncate group-hover:text-teal-700 transition-colors">{session.title}</div>
                        <span className="text-xs font-medium text-stone-400">{format(date, 'h:mm a')}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                        {contact && <span className="font-medium bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">{contact.name}</span>}
                        <span>• {session.duration} min</span>
                        <span>• {session.type}</span>
                    </div>
                </div>

                {session.status === 'Completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500/20 group-hover:text-green-500 transition-colors" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-teal-500 transition-colors" />
                )}
            </button>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#FAFAF9]">
            <ScrollShrinkHeader title="Sessions" showBack={false} />

            <PremiumScrollContainer>
                <div className="pb-24"> {/* Bottom padding for list */}

                    {/* UPCOMING SECTION */}
                    {upcoming.length > 0 && (
                        <div className="relative">
                            <StickySectionHeader title="Upcoming" />
                            <div className="px-4 py-2 space-y-3">
                                {upcoming.map(s => <SessionItem key={s.id} session={s} />)}
                            </div>
                        </div>
                    )}

                    {/* PAST SECTION */}
                    <div className="relative mt-4">
                        <StickySectionHeader title="Past History" />
                        <div className="px-4 py-2 space-y-3">
                            {past.length > 0 ? (
                                past.map(s => <SessionItem key={s.id} session={s} />)
                            ) : (
                                <div className="text-center py-8 text-stone-400 text-sm">No past sessions found</div>
                            )}
                        </div>
                    </div>
                </div>
            </PremiumScrollContainer>
        </div>
    );
}

