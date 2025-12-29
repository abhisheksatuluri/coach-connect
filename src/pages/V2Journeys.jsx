import React, { useState } from 'react';
import V2Layout from '@/components/v2/V2Layout';
import V2PanelSystem from '@/components/v2/V2PanelSystem';
import V2JourneyCard from '@/components/v2/journeys/V2JourneyCard';
import V2JourneyDetail from '@/components/v2/journeys/V2JourneyDetail';
import { Plus, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";

import { useJourneys } from '@/hooks/useJourneys';

// MOCK_JOURNEYS removed in favor of hook



const JourneysListContent = ({ journeys, selectedId, onSelect }) => (
    <div className="h-full flex flex-col">
        {/* Page Header */}
        <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white">Journeys</h1>
                    <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">{journeys.length}</span>
                </div>
                <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-1">
                    <Plus className="w-3 h-3" /> New Journey
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-2 pb-2">
                <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                    {['All', 'Active', 'Templates', 'Drafts'].map(filter => (
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
            {journeys.map(journey => (
                <V2JourneyCard
                    key={journey.id}
                    journey={journey}
                    isSelected={selectedId === journey.id}
                    onClick={() => onSelect(journey.id)}
                />
            ))}
        </div>
    </div>
);

export default function V2Journeys() {
    const { data: journeys = [], isLoading } = useJourneys();
    const [selectedJourneyId, setSelectedJourneyId] = useState(null);
    const selectedJourney = journeys.find(j => j.id === selectedJourneyId) || journeys[0];

    // Set initial selection
    React.useEffect(() => {
        if (!selectedJourneyId && journeys.length > 0) {
            setSelectedJourneyId(journeys[0].id);
        }
    }, [journeys, selectedJourneyId]);

    if (isLoading) {
        return <V2Layout><div className="p-12 text-center text-slate-500">Loading journeys...</div></V2Layout>;
    }

    return (
        <V2Layout>
            <V2PanelSystem
                primaryContent={
                    <JourneysListContent
                        journeys={journeys}
                        selectedId={selectedJourneyId || (journeys[0]?.id)}
                        onSelect={setSelectedJourneyId}
                    />
                }
                secondaryContent={
                    <V2JourneyDetail journey={selectedJourney} />
                }
                isSplit={true}
            />
        </V2Layout>
    );
}
