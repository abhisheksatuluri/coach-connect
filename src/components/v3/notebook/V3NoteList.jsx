import React, { useState } from 'react';
import { Book, Search, Plus } from 'lucide-react';
import { cn } from "@/lib/utils";
import { notesData, contactsData } from '@/data/v3DummyData';
import { useStackNavigation } from '@/context/StackNavigationContext';
import V3NoteDetail from './V3NoteDetail';
import { format } from 'date-fns';
import PremiumScrollContainer from '@/components/v3/shared/PremiumScrollContainer';
import ScrollShrinkHeader from '@/components/v3/shared/ScrollShrinkHeader';

export default function V3NoteList() {
    const { pushScreen } = useStackNavigation();
    const [search, setSearch] = useState('');

    const filtered = notesData.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="flex flex-col h-full bg-[#FAFAF9]">
            <ScrollShrinkHeader
                title="Notebook"
                showBack={false}
                action={<button className="w-8 h-8 bg-stone-900 text-white rounded-full flex items-center justify-center hover:bg-stone-700 transition-colors"><Plus className="w-4 h-4" /></button>}
            />

            <PremiumScrollContainer>
                {/* Sticky Search */}
                <div className="sticky top-0 z-20 bg-[#FAFAF9]/95 backdrop-blur-sm p-4 border-b border-stone-100">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl h-11 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                    </div>
                </div>

                <div className="p-4 pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((note) => {
                            const contact = contactsData.find(c => c.id === note.contactId);
                            return (
                                <div
                                    key={note.id}
                                    onClick={() => pushScreen(V3NoteDetail, { note })}
                                    className="bg-white p-5 rounded-3xl border border-stone-100 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group flex flex-col h-56"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2 bg-stone-50 rounded-lg group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                            <Book className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase text-stone-400 border border-stone-100 px-2 py-1 rounded-full bg-stone-50">
                                            {format(new Date(note.date), 'MMM d')}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-stone-900 text-lg mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">{note.title}</h3>
                                    <p className="text-stone-500 text-sm line-clamp-3 leading-relaxed flex-1">{note.content}</p>

                                    {contact && (
                                        <div className="mt-3 pt-3 border-t border-stone-50 text-xs text-stone-400 font-medium truncate">
                                            Linked to <span className="text-stone-600">{contact.name}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </PremiumScrollContainer>
        </div>
    );
}
