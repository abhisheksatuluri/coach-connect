import React, { useState } from 'react';
import { Search, ChevronRight, Filter } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useClients } from '@/hooks/useClients';
import { useNavigate } from 'react-router-dom';

export default function V3ContactList({ onCloseSlider }) {
    const { data: clients = [] } = useClients();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All'); // All, Clients, Practitioners
    const navigate = useNavigate();

    const filtered = clients.filter(c => {
        const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' ? true : (c.type || 'Client') === filter;
        return matchesSearch && matchesFilter;
    });

    const handleSelect = (id) => {
        if (onCloseSlider) onCloseSlider();
        navigate(`/v3/contacts/${id}`); // We will assume this route exists or we create it
    };

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
                {filtered.map(client => (
                    <div
                        key={client.id}
                        onClick={() => handleSelect(client.id)}
                        className="flex items-center gap-4 p-4 hover:bg-stone-50 cursor-pointer border-l-2 border-transparent hover:border-teal-500 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-sm shrink-0">
                            {client.avatar || client.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-stone-900 truncate">{client.name}</div>
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                                    client.type === 'Practitioner' ? "bg-purple-100 text-purple-700" : "bg-stone-100 text-stone-600"
                                )}>
                                    {client.type || 'Client'}
                                </span>
                                <span>•</span>
                                <span>{client.status || 'Active'}</span>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500" />
                    </div>
                ))}
            </div>
        </div>
    );
}
