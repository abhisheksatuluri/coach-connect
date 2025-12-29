import React, { useState } from 'react';
import V2Layout from '@/components/v2/V2Layout';
import V2PanelSystem from '@/components/v2/V2PanelSystem';
import V2NotebookCard from '@/components/v2/notebook/V2NotebookCard';
import V2NotebookDetail from '@/components/v2/notebook/V2NotebookDetail';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { useNotebook } from '@/hooks/useNotebook';

// MOCK_NOTES removed in favor of hook



const NotebookListContent = ({ notes, selectedId, onSelect }) => {
    const [activeTab, setActiveTab] = useState('All');

    const filteredNotes = activeTab === 'All' ? notes : notes.filter(n => n.category === activeTab);

    return (
        <div className="h-full flex flex-col">
            {/* Page Header */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-white">Notebook</h1>
                        <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">{notes.length}</span>
                    </div>
                    <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-1">
                        <Plus className="w-3 h-3" /> New Note
                    </Button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search notes content..."
                        className="w-full bg-slate-800 border-0 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 pb-2">
                    {['All', 'My Notes', 'Client Notes', 'Session Notes', 'Journey Notes', 'Files'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded transition-colors border",
                                activeTab === tab
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                    : "bg-slate-800 border-transparent text-slate-400 hover:text-white"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto pr-2">
                {filteredNotes.map(note => (
                    <V2NotebookCard
                        key={note.id}
                        note={note}
                        isSelected={selectedId === note.id}
                        onClick={() => onSelect(note.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default function V2Notebook() {
    const { data: notes = [], isLoading } = useNotebook();
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    const selectedNote = notes.find(n => n.id === selectedNoteId) || notes[0];

    // Set initial selection
    React.useEffect(() => {
        if (!selectedNoteId && notes.length > 0) {
            setSelectedNoteId(notes[0].id);
        }
    }, [notes, selectedNoteId]);

    if (isLoading) {
        return <V2Layout><div className="p-12 text-center text-slate-500">Loading notebook...</div></V2Layout>;
    }

    return (
        <V2Layout>
            <V2PanelSystem
                primaryContent={
                    <NotebookListContent
                        notes={notes}
                        selectedId={selectedNoteId || (notes[0]?.id)}
                        onSelect={setSelectedNoteId}
                    />
                }
                secondaryContent={
                    <V2NotebookDetail note={selectedNote} />
                }
                isSplit={true}
            />
        </V2Layout>
    );
}
