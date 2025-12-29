import React, { useState } from 'react';
import V2Layout from '@/components/v2/V2Layout';
import V2PanelSystem from '@/components/v2/V2PanelSystem';
import V2SessionCard from '@/components/v2/sessions/V2SessionCard';
import V2SessionDetail from '@/components/v2/sessions/V2SessionDetail';
import { Plus, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Mock Data
import { useSessions } from '@/hooks/useSessions';

// MOCK_SESSIONS removed in favor of hook



const SessionsListContent = ({ sessions, selectedId, onSelect }) => (
    <div className="h-full flex flex-col">
        {/* Page Header */}
        <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white">Sessions</h1>
                    <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">{sessions.length}</span>
                </div>
                <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-1">
                    <Plus className="w-3 h-3" /> New Session
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-2 pb-2">
                <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                    {['All', 'Upcoming', 'Past', 'Today'].map(filter => (
                        <button key={filter} className="px-3 py-1 text-xs font-medium rounded hover:bg-slate-700 text-slate-300 transition-colors first:bg-slate-700 first:text-white first:shadow-sm">
                            {filter}
                        </button>
                    ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <button className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white" title="Filter">
                        <Filter className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto pr-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Today</h3>
            {sessions.filter(s => s.status !== 'Completed').map(session => (
                <V2SessionCard
                    key={session.id}
                    session={session}
                    isSelected={selectedId === session.id}
                    onClick={() => onSelect(session.id)}
                />
            ))}

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4 pl-1">Past</h3>
            {sessions.filter(s => s.status === 'Completed').map(session => (
                <V2SessionCard
                    key={session.id}
                    session={session}
                    isSelected={selectedId === session.id}
                    onClick={() => onSelect(session.id)}
                />
            ))}
        </div>
    </div>
);

export default function V2Sessions() {
    const { data: sessions = [], isLoading } = useSessions();
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const selectedSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

    // Set initial selection
    React.useEffect(() => {
        if (!selectedSessionId && sessions.length > 0) {
            setSelectedSessionId(sessions[0].id);
        }
    }, [sessions, selectedSessionId]);

    if (isLoading) {
        return <V2Layout><div className="p-12 text-center text-slate-500">Loading sessions...</div></V2Layout>;
    }

    return (
        <V2Layout>
            <V2PanelSystem
                primaryContent={
                    <SessionsListContent
                        sessions={sessions}
                        selectedId={selectedSessionId || (sessions[0]?.id)}
                        onSelect={setSelectedSessionId}
                    />
                }
                secondaryContent={
                    <V2SessionDetail session={selectedSession} />
                }
                isSplit={true}
            />
        </V2Layout>
    );
}
