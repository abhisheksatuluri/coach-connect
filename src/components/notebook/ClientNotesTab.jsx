import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Save, X, Loader2, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

function NoteCard({ note, client, isSelected, onClick }) {
  const handleClick = () => {
    console.log('[ClientNotesTab] Note clicked:', note.id);
    console.log('[ClientNotesTab] Note data:', note);
    console.log('[ClientNotesTab] linkedClient:', note.linkedClient, 'linkedSession:', note.linkedSession, 'linkedJourney:', note.linkedJourney);
    onClick();
  };
  
  const preview = note.content.length > 100 
    ? note.content.substring(0, 100) + '...' 
    : note.content;
  return (
    <Card 
      className={`bg-white hover:shadow-md transition-all cursor-pointer ${
        isSelected ? 'border-l-4 border-l-emerald-500 bg-emerald-50' : ''
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-3">
        {client && (
          <div className="flex items-center gap-1 mb-2">
            <User className="w-3 h-3 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">{client.full_name}</span>
          </div>
        )}
        <p className="text-gray-600 text-sm line-clamp-2 mb-2">{preview}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {format(new Date(note.created_date), 'MMM d, yyyy')}
          </span>
          {note.updated_date && note.updated_date !== note.created_date && (
            <span className="text-xs text-amber-600">(edited)</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NoteForm({ note, clients, selectedClientId, onSave, onCancel, isLoading }) {
  const [content, setContent] = useState(note?.content || "");
  const [clientId, setClientId] = useState(note?.client_id || selectedClientId || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() && clientId) {
      onSave({ content: content.trim(), client_id: clientId });
    }
  };

  return (
    <Card className="bg-white border-2 border-emerald-200">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>{client.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note about this client..."
            className="min-h-[100px]"
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button type="submit" disabled={!content.trim() || !clientId || isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ClientNotesTab({ selectedNoteId, onNoteSelect }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedClient, setSelectedClient] = useState("all");
  
  // Store selected client in localStorage for fallback context detection
  useEffect(() => {
    localStorage.setItem('notebookSelectedClientId', selectedClient === 'all' ? '' : selectedClient);
  }, [selectedClient]);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current view context
  const currentView = localStorage.getItem('currentView') || 'coach';

  React.useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: allNotes = [], isLoading } = useQuery({
    queryKey: ['notes', 'client-notes', currentView, currentUser?.email],
    queryFn: async () => {
      // Fetch all notes - we'll filter on the client side
      const notes = await base44.entities.Note.list();
      // Filter for Client Notes: noteType is "Client Note" OR has linkedClient set
      return notes.filter(note => 
        note.noteType === 'Client Note' || 
        note.linkedClient
      );
    },
    enabled: !!currentUser
  });

  // Filter notes by role only (all coaches see all coach notes, etc.)
  const notes = allNotes.filter(note => {
    if (note.createdByRole && note.createdByRole !== currentView) return false;
    return true;
  });

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));

  const filteredNotes = selectedClient === "all" 
    ? notes 
    : notes.filter(n => n.linkedClient === selectedClient || n.client_id === selectedClient);

  const sortedNotes = [...filteredNotes].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  // Group by client
  const groupedNotes = {};
  sortedNotes.forEach(note => {
    const clientId = note.linkedClient || note.client_id || 'unknown';
    if (!groupedNotes[clientId]) groupedNotes[clientId] = [];
    groupedNotes[clientId].push(note);
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      console.log('[ClientNotesTab] Creating note with data:', data);
      return base44.entities.Note.create({ 
        ...data, 
        noteType: 'Client Note',
        createdByRole: currentView,
        linkedClient: data.client_id,
        // CRITICAL: Also store in legacy client_id field for backward compatibility
        client_id: data.client_id
      });
    },
    onSuccess: (newNote) => {
      console.log('[ClientNotesTab] Note created successfully:', newNote);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Note.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setEditingNote(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Note.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] })
  });

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Client Notes</h2>
          <p className="text-gray-500 text-sm mt-1">Notes about clients</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          disabled={showForm || clients.length === 0} 
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-1" /> New
        </Button>
      </div>

      <div className="mb-3">
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.id}>{client.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        {showForm && (
          <NoteForm
            clients={clients}
            selectedClientId={selectedClient !== "all" ? selectedClient : ""}
            onSave={(data) => createMutation.mutate(data)}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
          />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : sortedNotes.length === 0 ? (
          <Card className="bg-white border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-gray-500 text-sm">
                {clients.length === 0 
                  ? "Add clients first." 
                  : "No notes yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedNotes.map(note => {
            const clientId = note.linkedClient || note.client_id;
            return (
              <NoteCard
                key={note.id}
                note={note}
                client={clientMap[clientId]}
                isSelected={selectedNoteId === note.id}
                onClick={() => onNoteSelect(note.id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}