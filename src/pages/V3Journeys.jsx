import React, { useState } from 'react';
import V3Layout from '@/components/v3/V3Layout';
import V3JourneyCard from '@/components/v3/journeys/V3JourneyCard';
import V3JourneyOverlay from '@/components/v3/journeys/V3JourneyOverlay';
import { Search, Plus, Map } from 'lucide-react';
import { cn } from "@/lib/utils";

import { useJourneys } from '@/hooks/useJourneys';

// MOCK_JOURNEYS removed in favor of hook



// Fixed syntax error
export default function V3Journeys() {
    const { data: journeys = [], isLoading } = useJourneys();
    const [selectedJourney, setSelectedJourney] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');

    const filtered = journeys.filter(j => activeFilter === 'All' || j.status === activeFilter || (activeFilter === 'Active' && j.status !== 'Templates'));

    return (
        <V3Layout title="Journeys">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-normal text-stone-800 tracking-tight">Journeys</h1>
                <p className="text-stone-500 text-sm mt-1">Your programs & templates</p>
            </div>

            {/* Filter */}
            <div className="flex justify-center mb-8">
                <div className="bg-stone-100 p-1 rounded-full flex">
                    {['All', 'Active', 'Templates'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                                activeFilter === filter
                                    ? "bg-white text-stone-900 shadow-sm"
                                    : "text-stone-500 hover:text-stone-700"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="pb-20">
                {isLoading ? (
                    <div className="text-center py-12 text-stone-500">Loading journeys...</div>
                ) : filtered.length > 0 ? filtered.map(journey => (
                    <V3JourneyCard
                        key={journey.id}
                        journey={journey}
                        onClick={() => setSelectedJourney(journey)}
                    />
                )) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                            <Map className="w-8 h-8" />
                        </div>
                        <h3 className="text-stone-900 font-medium">No journeys found</h3>
                        <p className="text-stone-500 text-sm mt-1">Create a new journey to get started.</p>
                    </div>
                )}
            </div>

            {/* FAB */}
            <button className="fixed bottom-20 right-6 w-14 h-14 bg-teal-700 hover:bg-teal-800 text-white rounded-full shadow-lg shadow-teal-900/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40">
                <Plus className="w-6 h-6" />
            </button>

            {/* Detail Overlay */}
            <V3JourneyOverlay
                journey={selectedJourney}
                isOpen={!!selectedJourney}
                onClose={() => setSelectedJourney(null)}
            />

        </V3Layout>
    );
}
