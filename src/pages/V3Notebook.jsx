import React, { useState } from 'react';
import V3Layout from '@/components/v3/V3Layout';
import V3NotebookCard from '@/components/v3/notebook/V3NotebookCard';
import V3NotebookOverlay from '@/components/v3/notebook/V3NotebookOverlay';
import { Search, Plus, Book } from 'lucide-react';
import { cn } from "@/lib/utils";

import { useNotebook } from '@/hooks/useNotebook';

// MOCK_NOTES removed in favor of hook


export default function V3Notebook() {
    const { data: notes = [], isLoading } = useNotebook();
    const [selectedNote, setSelectedNote] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [search, setSearch] = useState('');

    const filtered = notes.filter(n => {
        // Map real data types to UI categories if needed, or rely on 'type' field
        const type = n.type || 'My Notes';
        const matchesFilter = activeFilter === 'All' ||
            (activeFilter === 'Files' && type === 'file') ||
            (activeFilter === 'Session' && type === 'session') ||
            (activeFilter === 'Client' && type === 'client') ||
            (activeFilter === 'My Notes' && (type === 'general' || type === 'template'));

        // Fallback: strict match if mapping above is not exhaustive
        const finalFilter = activeFilter === 'All' || matchesFilter || n.category === activeFilter;

        const matchesSearch = (n.title || 'Untitled').toLowerCase().includes(search.toLowerCase());
        return finalFilter && matchesSearch;
    });

    const getNotePreview = (note) => {
        // Hydrate mock-like fields if missing
        return {
            ...note,
            snippet: note.snippet || (note.content ? note.content.substring(0, 60) + '...' : 'No content'),
            timestamp: note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Just now',
            // Default category if missing for display
            category: note.category || (note.type === 'file' ? 'Files' : 'My Notes')
        };
    };

    return (
        <V3Layout title="Notebook">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-normal text-stone-800 tracking-tight">Notebook</h1>
                <p className="text-stone-500 text-sm mt-1">Your personal library</p>
            </div>

            {/* Search & Filter */}
            <div className="sticky top-[64px] bg-stone-50 pt-2 pb-6 z-30 space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search notes & files..."
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-white border border-stone-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all placeholder:text-stone-400 shadow-sm"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:justify-center">
                    {['All', 'My Notes', 'Client', 'Session', 'Files'].map(filter => (
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
            </div>

            {/* List */}
            <div className="space-y-2 pb-20">
                {isLoading ? (
                    <div className="text-center py-12 text-stone-500">Loading notebook...</div>
                ) : filtered.length > 0 ? filtered.map(note => (
                    <V3NotebookCard
                        key={note.id}
                        note={getNotePreview(note)}
                        onClick={() => setSelectedNote(getNotePreview(note))}
                    />
                )) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                            <Book className="w-8 h-8" />
                        </div>
                        <h3 className="text-stone-900 font-medium">No notes found</h3>
                        <p className="text-stone-500 text-sm mt-1">Capture your first thought.</p>
                    </div>
                )}
            </div>

            {/* FAB */}
            <button className="fixed bottom-20 right-6 w-14 h-14 bg-teal-700 hover:bg-teal-800 text-white rounded-full shadow-lg shadow-teal-900/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40">
                <Plus className="w-6 h-6" />
            </button>

            {/* Detail Overlay */}
            <V3NotebookOverlay
                note={selectedNote}
                isOpen={!!selectedNote}
                onClose={() => setSelectedNote(null)}
            />

        </V3Layout>
    );
}
