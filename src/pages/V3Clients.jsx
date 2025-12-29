import React, { useState } from 'react';
import V3Layout from '@/components/v3/V3Layout';
import V3ClientCard from '@/components/v3/clients/V3ClientCard';
import V3ClientOverlay from '@/components/v3/clients/V3ClientOverlay';
import { Search, Plus, UserPlus } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useClients } from '@/hooks/useClients';

export default function V3Clients() {
    const { data: clients = [], isLoading } = useClients();
    const [selectedClient, setSelectedClient] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [search, setSearch] = useState('');

    const filtered = clients.filter(c => {
        const matchesFilter = activeFilter === 'All' || c.status === activeFilter;
        // Handle potential missing name/full_name fields safely
        const name = c.name || c.full_name || '';
        const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (isLoading) {
        return (
            <V3Layout title="Clients">
                <div className="flex items-center justify-center p-12 text-stone-400">Loading clients...</div>
            </V3Layout>
        );
    }

    return (
        <V3Layout title="Clients">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-normal text-stone-800 tracking-tight">Clients</h1>
                <p className="text-stone-500 text-sm mt-1">{clients.length} people</p>
            </div>

            {/* Search & Filter */}
            <div className="sticky top-[64px] bg-stone-50 pt-2 pb-6 z-30 space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search clients..."
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-white border border-stone-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all placeholder:text-stone-400 shadow-sm"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar justify-center sm:justify-start">
                    {['All', 'Active', 'New', 'Recent'].map(filter => (
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
                {filtered.length > 0 ? filtered.map(client => (
                    <V3ClientCard
                        key={client.id}
                        client={client}
                        onClick={() => setSelectedClient(client)}
                    />
                )) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <h3 className="text-stone-900 font-medium">No clients found</h3>
                        <p className="text-stone-500 text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            {/* FAB */}
            <button className="fixed bottom-20 right-6 w-14 h-14 bg-teal-700 hover:bg-teal-800 text-white rounded-full shadow-lg shadow-teal-900/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40">
                <Plus className="w-6 h-6" />
            </button>

            {/* Detail Overlay */}
            <V3ClientOverlay
                client={selectedClient}
                isOpen={!!selectedClient}
                onClose={() => setSelectedClient(null)}
            />

        </V3Layout>
    );
}
