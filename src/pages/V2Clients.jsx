import React, { useState } from 'react';
import V2Layout from '@/components/v2/V2Layout';
import V2PanelSystem from '@/components/v2/V2PanelSystem';
import V2ClientCard from '@/components/v2/clients/V2ClientCard';
import V2ClientDetail from '@/components/v2/clients/V2ClientDetail';
import { Plus, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from "@/components/ui/button";

import { useClients } from '@/hooks/useClients';

const ClientsListContent = ({ clients, selectedId, onSelect, isLoading }) => {
    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading clients...</div>;
    }

    return (
        <div className="h-full flex flex-col">
            {/* Page Header */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-white">Clients</h1>
                        <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">{clients.length}</span>
                    </div>
                    <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-1">
                        <Plus className="w-3 h-3" /> New Client
                    </Button>
                </div>

                {/* Filters Bar */}
                <div className="flex items-center gap-2 pb-2">
                    <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                        {['All', 'Active', 'Inactive', 'New'].map(filter => (
                            <button key={filter} className="px-3 py-1 text-xs font-medium rounded hover:bg-slate-700 text-slate-300 transition-colors first:bg-slate-700 first:text-white first:shadow-sm">
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <button className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white" title="Filter">
                            <Filter className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white" title="Sort">
                            <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto pr-2">
                {clients.map(client => (
                    <V2ClientCard
                        key={client.id}
                        client={client}
                        isSelected={selectedId === client.id}
                        onClick={() => onSelect(client.id)}
                    />
                ))}
            </div>
        </div>
    )
};

export default function V2Clients() {
    const { data: clients = [], isLoading } = useClients();
    const [selectedClientId, setSelectedClientId] = useState(null);
    const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

    // Set initial selection once loaded
    React.useEffect(() => {
        if (!selectedClientId && clients.length > 0) {
            setSelectedClientId(clients[0].id);
        }
    }, [clients, selectedClientId]);

    return (
        <V2Layout>
            <V2PanelSystem
                primaryContent={
                    <ClientsListContent
                        clients={clients}
                        selectedId={selectedClientId || (clients[0]?.id)}
                        onSelect={setSelectedClientId}
                        isLoading={isLoading}
                    />
                }
                secondaryContent={
                    <V2ClientDetail client={selectedClient} />
                }
                isSplit={true}
            />
        </V2Layout>
    );
}
