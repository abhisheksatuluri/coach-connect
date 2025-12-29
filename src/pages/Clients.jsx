import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users } from "lucide-react";

import ClientCard from "../components/clients/ClientCard";
import ClientForm from "../components/clients/ClientForm";
import ClientDetails from "../components/clients/ClientDetails";

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-date_time'),
  });

  const createClientMutation = useMutation({
    mutationFn: (clientData) => base44.entities.Client.create(clientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowForm(false);
      setEditingClient(null);
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowForm(false);
      setEditingClient(null);
      setSelectedClient(null);
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setSelectedClient(null);
    },
  });

  const handleSubmit = (clientData) => {
    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, data: clientData });
    } else {
      createClientMutation.mutate(clientData);
    }
  };

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-1">Manage your coaching clients</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingClient(null);
            }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Client
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search clients by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-emerald-200 focus:border-emerald-400"
            />
          </div>
        </div>

        {showForm && (
          <div className="mb-8">
            <ClientForm
              client={editingClient}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingClient(null);
              }}
            />
          </div>
        )}

        {selectedClient && (
          <div className="mb-8">
            <ClientDetails
              client={selectedClient}
              sessions={sessions}
              onClose={() => setSelectedClient(null)}
              onEdit={(client) => {
                setEditingClient(client);
                setShowForm(true);
                setSelectedClient(null);
              }}
              onDelete={(id) => {
                if (confirm('Are you sure you want to delete this client?')) {
                  deleteClientMutation.mutate(id);
                }
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => setSelectedClient(client)}
            />
          ))}
        </div>

        {filteredClients.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No clients found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try a different search term' : 'Get started by adding your first client'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}