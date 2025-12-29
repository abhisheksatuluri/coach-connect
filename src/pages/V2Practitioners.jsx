import React, { useState } from 'react';
import V2Layout from '@/components/v2/V2Layout';
import V2PanelSystem from '@/components/v2/V2PanelSystem';
import V2PractitionerCard from '@/components/v2/practitioners/V2PractitionerCard';
import V2PractitionerDetail from '@/components/v2/practitioners/V2PractitionerDetail';
import { Plus, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { usePractitioners } from '@/hooks/usePractitioners';

// MOCK_PRACTITIONERS removed in favor of hook



const PractitionersListContent = ({ practitioners, selectedId, onSelect }) => {
    const [activeFilter, setActiveFilter] = useState('All');

    const filtered = activeFilter === 'All' ? practitioners : practitioners.filter(p => p.status === activeFilter);

    return (
        <div className="h-full flex flex-col">
            {/* Page Header */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-white">Practitioners</h1>
                        <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">{practitioners.length}</span>
                    </div>
                    <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-1">
                        <Plus className="w-3 h-3" /> Add Practitioner
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 pb-2">
                    <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                        {['All', 'Active', 'Pending Approval'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded transition-colors",
                                    activeFilter === filter
                                        ? "bg-slate-700 text-white shadow-sm"
                                        : "text-slate-400 hover:text-white"
                                )}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto pr-2">
                {filtered.map(practitioner => (
                    <V2PractitionerCard
                        key={practitioner.id}
                        practitioner={practitioner}
                        isSelected={selectedId === practitioner.id}
                        onClick={() => onSelect(practitioner.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default function V2Practitioners() {
    const { data: practitioners = [], isLoading } = usePractitioners();
    const [selectedId, setSelectedId] = useState(null);
    const selectedPractitioner = practitioners.find(p => p.id === selectedId) || practitioners[0];

    // Set initial selection
    React.useEffect(() => {
        if (!selectedId && practitioners.length > 0) {
            setSelectedId(practitioners[0].id);
        }
    }, [practitioners, selectedId]);

    if (isLoading) {
        return <V2Layout><div className="p-12 text-center text-slate-500">Loading practitioners...</div></V2Layout>;
    }

    return (
        <V2Layout>
            <V2PanelSystem
                primaryContent={
                    <PractitionersListContent
                        practitioners={practitioners}
                        selectedId={selectedId || (practitioners[0]?.id)}
                        onSelect={setSelectedId}
                    />
                }
                secondaryContent={
                    <V2PractitionerDetail practitioner={selectedPractitioner} />
                }
                isSplit={true}
            />
        </V2Layout>
    );
}
