import React, { useState } from 'react';
import V3Layout from '@/components/v3/V3Layout';
import V3PractitionerCard from '@/components/v3/practitioners/V3PractitionerCard';
import V3PractitionerOverlay from '@/components/v3/practitioners/V3PractitionerOverlay';
import { Plus, Users } from 'lucide-react';
import { cn } from "@/lib/utils";
import { usePractitioners } from '@/hooks/usePractitioners';

// MOCK_PRACTITIONERS removed in favor of hook

export default function V3Practitioners() {
    const { data: practitioners = [], isLoading } = usePractitioners();
    const [selectedPractitioner, setSelectedPractitioner] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');

    const filtered = practitioners.filter(p => {
        return activeFilter === 'All' || p.status === activeFilter;
    });

    const getPractitionerPreview = (p) => {
        return {
            ...p,
            specialty: p.specialty || 'General Practitioner',
            status: p.status || 'Active',
            referrals: p.referrals || []
        };
    };

    return (
        <V3Layout title="Practitioners">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-normal text-stone-800 tracking-tight">Practitioners</h1>
                <p className="text-stone-500 text-sm mt-1">Your trusted network</p>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6 justify-center">
                {['All', 'Active', 'Pending'].map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border whitespace-nowrap",
                            activeFilter === filter
                                ? "bg-stone-800 text-white border-stone-800"
                                : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                        )}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="pb-20">
                {isLoading ? (
                    <div className="text-center py-12 text-stone-500">Loading practitioners...</div>
                ) : filtered.length > 0 ? filtered.map(p => (
                    <V3PractitionerCard
                        key={p.id}
                        practitioner={getPractitionerPreview(p)}
                        onClick={() => setSelectedPractitioner(getPractitionerPreview(p))}
                    />
                )) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-stone-900 font-medium">No practitioners found</h3>
                        <p className="text-stone-500 text-sm mt-1">Grow your network.</p>
                    </div>
                )}
            </div>

            {/* FAB */}
            <button className="fixed bottom-20 right-6 w-14 h-14 bg-teal-700 hover:bg-teal-800 text-white rounded-full shadow-lg shadow-teal-900/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40">
                <Plus className="w-6 h-6" />
            </button>

            {/* Detail Overlay */}
            <V3PractitionerOverlay
                practitioner={selectedPractitioner}
                isOpen={!!selectedPractitioner}
                onClose={() => setSelectedPractitioner(null)}
            />

        </V3Layout>
    );
}
