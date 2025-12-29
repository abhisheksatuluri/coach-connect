
import React, { useState } from 'react';
import { Search, ChevronRight, Filter } from 'lucide-react';
import { cn } from "@/lib/utils";
import { contactsData } from '@/data/v3DummyData';
import { useStackNavigation } from '@/context/StackNavigationContext';
import V3ContactDetail from './V3ContactDetail';

export default function V3ContactList() {
    const { pushScreen } = useStackNavigation();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All'); // All, Client, Practitioner, Lead

    const filtered = contactsData.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' ? true : c.type === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Search & Filter Bar */}
            <div className="p-4 space-y-3 bg-white border-b border-stone-100 sticky top-0 z-10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-stone-50 border-none rounded-xl h-10 pl-10 pr-4 text-sm focus:ring-1 focus:ring-teal-500"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {['All', 'Client', 'Practitioner', 'Lead'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border",
                                filter === f
                                    ? "bg-stone-900 text-white border-stone-900"
                                    : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {filtered.map(contact => (
                    <div
                        key={contact.id}
                        onClick={() => pushScreen(V3ContactDetail, { contact })}
                        className="flex items-center gap-4 p-4 hover:bg-stone-50 cursor-pointer border-l-2 border-transparent hover:border-teal-500 transition-all group"
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                            contact.avatarColor || "bg-stone-100 text-stone-500"
                        )}>
                            {contact.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-stone-900 truncate">{contact.name}</div>
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                                    contact.type === 'Practitioner' ? "bg-purple-100 text-purple-700" : "bg-stone-100 text-stone-600"
                                )}>
                                    {contact.type}
                                </span>
                                <span>•</span>
                                <span>{contact.status}</span>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500" />
                    </div>
                ))}
            </div>
        </div>
    );
}

