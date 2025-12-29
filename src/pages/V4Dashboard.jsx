import React, { useState } from 'react';
import V4Layout from '@/components/v4/V4Layout';
import V4LeftSidebar from '@/components/v4/V4LeftSidebar';
import V4RightSidebar from '@/components/v4/V4RightSidebar';
import V4Feed from '@/components/v4/V4Feed';
import V4BottomSheet from '@/components/v4/V4BottomSheet';
import V4ClientSheet from '@/components/v4/sheets/V4ClientSheet';
import V4SessionSheet from '@/components/v4/sheets/V4SessionSheet';
import V4JourneySheet from '@/components/v4/sheets/V4JourneySheet';
import V4TaskSheet from '@/components/v4/sheets/V4TaskSheet';

import V4NotebookSheet from '@/components/v4/sheets/V4NotebookSheet';
import V4KnowledgeBaseSheet from '@/components/v4/sheets/V4KnowledgeBaseSheet';
import V4PaymentSheet from '@/components/v4/sheets/V4PaymentSheet';
import V4PractitionerSheet from '@/components/v4/sheets/V4PractitionerSheet';

export default function V4Dashboard() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedItem, setSelectedItem] = useState(null); // Clicked item (sheet)
    const [hoveredItem, setHoveredItem] = useState(null);   // Hovered item (sidebar preview)

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    return (
        <>
            <V4Layout
                leftPanel={
                    <V4LeftSidebar
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                    />
                }
                rightPanel={
                    <V4RightSidebar
                        item={hoveredItem} // Shows hover preview or default stats
                    />
                }
            >
                <V4Feed
                    filter={activeFilter}
                    onItemClick={handleItemClick}
                    onItemHover={setHoveredItem} // Capture hover for right sidebar
                />
            </V4Layout>

            {/* Specific Sheets */}
            {selectedItem?.entity === 'Clients' && (
                <V4ClientSheet
                    client={selectedItem}
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            {/* Handle AI Insight items as Sessions for now (or a specific Insight sheet later) */}
            {(selectedItem?.entity === 'Sessions' || selectedItem?.type === 'ai_insight') && (
                <V4SessionSheet
                    session={selectedItem}
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            {selectedItem?.entity === 'Journeys' && (
                <V4JourneySheet
                    journey={selectedItem}
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            {selectedItem?.entity === 'Tasks' && (
                <V4TaskSheet
                    task={selectedItem}
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            {selectedItem?.entity === 'Notebook' && (
                <V4NotebookSheet
                    note={selectedItem}
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            {selectedItem?.entity === 'Knowledge' && (
                <V4KnowledgeBaseSheet
                    article={selectedItem}
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            {selectedItem?.entity === 'Payments' && (
                <V4PaymentSheet
                    payment={selectedItem}
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            {selectedItem?.entity === 'Practitioners' && (
                <V4PractitionerSheet
                    practitioner={selectedItem}
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            {/* Default Sheet for other types (fallback) */}
            {selectedItem && !['Clients', 'Sessions', 'Journeys', 'Tasks', 'Notebook', 'Knowledge', 'Payments', 'Practitioners'].includes(selectedItem.entity) && (
                <V4BottomSheet
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    title={selectedItem?.title || 'Details'}
                >
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${selectedItem.color}`}>
                                <selectedItem.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-stone-900">{selectedItem.title}</h3>
                                <p className="text-stone-500">{selectedItem.timestamp} • {selectedItem.actor}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-stone-50 rounded-xl border border-stone-100">
                            <p className="text-stone-800 leading-relaxed font-medium">
                                {selectedItem.preview}
                            </p>
                        </div>
                        <div className="h-64 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 border border-dashed border-stone-200">
                            Generic Detail View
                        </div>
                    </div>
                </V4BottomSheet>
            )}
        </>
    );
}
