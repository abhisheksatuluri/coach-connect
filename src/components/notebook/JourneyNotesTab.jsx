import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Save, X, Loader2, MapIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

function NoteCard({ note, client, journey, onEdit, onDelete, onSelectNote }) {
  const handleCardClick = () => {
    console.log('[JourneyNotesTab] Note clicked:', note.id);
    console.log('[JourneyNotesTab] Note data:', note);
    console.log('[JourneyNotesTab] linkedClient:', note.linkedClient, 'linkedSession:', note.linkedSession, 'linkedJourney:', note.linkedJourney);
    
    if (onSelectNote) {
      onSelectNote(note.id);
    }
  };

  return (
    <Card 
      className="bg-white hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {journey && (
              <div className="flex items-center gap-2 mb-2">
                <MapIcon className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-700">{journey.title}</span>
              </div>
            )}
            {client && (
              <div className="text-sm text-gray-600 mb-2">Client: {client.full_name}</div>
            )}
            <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span>{format(new Date(note.created_date), 'MMM d, yyyy h:mm a')}</span>
              {note.updated_date && note.updated_date !== note.created_date && (
                <span className="text-amber-600">(edited)</span>
              )}
            </div>
          </div>
          <TooltipProvider>
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(note)} className="h-8 w-8 p-0">
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit note</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(note.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete note</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

function NoteForm({ note, clients, journeys, selectedJourneyId, onSave, onCancel, isLoading }) {
  const [content, setContent] = useState(note?.content || "");
  const [journeyId, setJourneyId] = useState(note?.linkedJourney || selectedJourneyId || "");
  const [clientId, setClientId] = useState(note?.linkedClient || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() && journeyId) {
      onSave({ content: content.trim(), linkedJourney: journeyId, linkedClient: clientId || null });
    }
  };

  return (
    <Card className="bg-white border-2 border-purple-200">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Select value={journeyId} onValueChange={setJourneyId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a journey" />
            </SelectTrigger>
            <SelectContent>
              {journeys.map(journey => (
                <SelectItem key={journey.id} value={journey.id}>{journey.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Link to client (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>No client</SelectItem>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>{client.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note about this journey..."
            className="min-h-[100px]"
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button type="submit" disabled={!content.trim() || !journeyId || isLoading} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function JourneyNotesTab({ onSelectNote }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedJourney, setSelectedJourney] = useState("all");
  
  // Store selected journey in localStorage for fallback context detection
  useEffect(() => {
    localStorage.setItem('notebookSelectedJourneyId', selectedJourney === 'all' ? '' : selectedJourney);
  }, [selectedJourney]);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current view context
  const currentView = localStorage.getItem('currentView') || 'coach';

  React.useEffect(() => {
    const loadUser = async () => {
      const user = await api.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list(),
  });

  const { data: clientJourneys = [] } = useQuery({
    queryKey: ['client-journeys'],
    queryFn: () => api.entities.ClientJourney.list(),
  });

  const { data: journeyTemplates = [] } = useQuery({
    queryKey: ['journey-templates'],
    queryFn: () => api.entities.Journey.list(),
  });

  const { data: allNotes = [], isLoading } = useQuery({
    queryKey: ['notes', 'journey-notes', currentView, currentUser?.email],
    queryFn: async () => {
      // Fetch all notes - we'll filter on the client side
      const notes = await api.entities.Note.list();
      // Filter for Journey Notes: noteType is "Journey Note" OR has linkedJourney set
      return notes.filter(note => 
        note.noteType === 'Journey Note' || 
        note.linkedJourney
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
  
  // Build journey map from both client journeys and templates
  const journeyMap = {};
  clientJourneys.forEach(cj => {
    const template = journeyTemplates.find(t => t.id === cj.journey_id);
    if (template) {
      journeyMap[cj.id] = { ...template, isClientJourney: true };
    }
  });
  journeyTemplates.forEach(t => {
    journeyMap[t.id] = { ...t, isClientJourney: false };
  });

  // All journeys for dropdown
  const allJourneys = [
    ...clientJourneys.map(cj => {
      const template = journeyTemplates.find(t => t.id === cj.journey_id);
      return { id: cj.id, title: template?.title || 'Unknown Journey' };
    }),
    ...journeyTemplates.map(t => ({ id: t.id, title: t.title }))
  ];

  const filteredNotes = selectedJourney === "all" 
    ? notes 
    : notes.filter(n => n.linkedJourney === selectedJourney);

  const sortedNotes = [...filteredNotes].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const createMutation = useMutation({
    mutationFn: (data) => {
      console.log('[JourneyNotesTab] Creating note with data:', data);
      return api.entities.Note.create({ 
        ...data, 
        noteType: 'Journey Note',
        createdByRole: currentView,
        // CRITICAL: Also store in legacy journey_id field for backward compatibility
        journey_id: data.linkedJourney,
        client_id: data.linkedClient
      });
    },
    onSuccess: (newNote) => {
      console.log('[JourneyNotesTab] Note created successfully:', newNote);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Note.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setEditingNote(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.Note.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] })
  });

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Journey Notes</h2>
          <p className="text-gray-600 mt-1">Notes about specific journeys</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm || allJourneys.length === 0} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" /> New Note
        </Button>
      </div>

      <div className="mb-4">
        <Select value={selectedJourney} onValueChange={setSelectedJourney}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filter by journey" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Journeys</SelectItem>
            {allJourneys.map(journey => (
              <SelectItem key={journey.id} value={journey.id}>{journey.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {showForm && (
          <NoteForm
            clients={clients}
            journeys={allJourneys}
            selectedJourneyId={selectedJourney !== "all" ? selectedJourney : ""}
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
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                {allJourneys.length === 0 
                  ? "Add journeys first to create journey notes." 
                  : "No journey notes yet. Click \"New Note\" to create one."}
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedNotes.map(note => (
            editingNote?.id === note.id ? (
              <NoteForm
                key={note.id}
                note={note}
                clients={clients}
                journeys={allJourneys}
                onSave={(data) => updateMutation.mutate({ id: note.id, data })}
                onCancel={() => setEditingNote(null)}
                isLoading={updateMutation.isPending}
              />
            ) : (
              <NoteCard
                key={note.id}
                note={note}
                client={clientMap[note.linkedClient]}
                journey={journeyMap[note.linkedJourney]}
                onEdit={setEditingNote}
                onDelete={handleDelete}
                onSelectNote={onSelectNote}
              />
            )
          ))
        )}
      </div>
    </div>
  );
}