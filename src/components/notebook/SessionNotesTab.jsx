import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Save, X, Loader2, User, Video, Calendar } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

function NoteCard({ note, session, client, onEdit, onDelete, onSelectNote }) {
  const handleCardClick = () => {
    console.log('[SessionNotesTab] Note clicked:', note.id);
    console.log('[SessionNotesTab] Note data:', note);
    console.log('[SessionNotesTab] linkedClient:', note.linkedClient, 'linkedSession:', note.linkedSession, 'linkedJourney:', note.linkedJourney);
    
    // Select the note to show in detail panel
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
            <div className="flex items-center gap-4 mb-2 flex-wrap">
              {client && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-emerald-700">{client.full_name}</span>
                </div>
              )}
              {session && (
                <Link 
                  to={`/sessions?sessionId=${session.id}`}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Video className="w-4 h-4" />
                  <span className="text-sm">{session.title}</span>
                </Link>
              )}
              {session?.date_time && (
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(session.date_time), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span>Created: {format(new Date(note.created_date), 'MMM d, yyyy h:mm a')}</span>
              {note.updated_date && note.updated_date !== note.created_date && (
                <span className="text-amber-600">(edited)</span>
              )}
            </div>
          </div>
          <TooltipProvider>
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(note);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit note</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(note.id);
                    }}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
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

function NoteForm({ note, sessions, clients, onSave, onCancel, isLoading }) {
  const [content, setContent] = useState(note?.content || "");
  const [sessionId, setSessionId] = useState(note?.session_id || "");

  const sessionMap = Object.fromEntries(sessions.map(s => [s.id, s]));
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() && sessionId) {
      const session = sessionMap[sessionId];
      onSave({ 
        content: content.trim(), 
        session_id: sessionId,
        client_id: session?.client_id || null
      });
    }
  };

  return (
    <Card className="bg-white border-2 border-emerald-200">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Select value={sessionId} onValueChange={setSessionId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map(session => (
                <SelectItem key={session.id} value={session.id}>
                  {session.title} - {clientMap[session.client_id]?.full_name || 'Unknown'} 
                  ({session.date_time ? format(new Date(session.date_time), 'MMM d') : 'No date'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your session notes..."
            className="min-h-[100px]"
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button type="submit" disabled={!content.trim() || !sessionId || isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SessionNotesTab({ onSelectNote }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedClient, setSelectedClient] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [onlyWithNotes, setOnlyWithNotes] = useState(false);
  
  // Store selected client in localStorage for fallback context detection
  useEffect(() => {
    localStorage.setItem('notebookSelectedClientId', selectedClient === 'all' ? '' : selectedClient);
  }, [selectedClient]);
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

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.entities.Session.list(),
  });

  const { data: allNotes = [], isLoading } = useQuery({
    queryKey: ['notes', 'session-notes', currentView, currentUser?.email],
    queryFn: async () => {
      // Fetch all notes - we'll filter on the client side
      const notes = await api.entities.Note.list();
      // Filter for Session Notes: noteType is "Session Note" OR has linkedSession set
      return notes.filter(note => 
        note.noteType === 'Session Note' || 
        note.linkedSession
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
  const sessionMap = Object.fromEntries(sessions.map(s => [s.id, s]));

  // Get session IDs that have notes
  const sessionIdsWithNotes = new Set(notes.map(n => n.linkedSession || n.session_id));

  // Filter notes
  let filteredNotes = [...notes];

  if (selectedClient !== "all") {
    filteredNotes = filteredNotes.filter(n => {
      const sessionId = n.linkedSession || n.session_id;
      const session = sessionMap[sessionId];
      return session?.client_id === selectedClient;
    });
  }

  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    filteredNotes = filteredNotes.filter(n => {
      const sessionId = n.linkedSession || n.session_id;
      const session = sessionMap[sessionId];
      if (!session?.date_time) return false;
      return new Date(session.date_time) >= fromDate;
    });
  }

  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59);
    filteredNotes = filteredNotes.filter(n => {
      const sessionId = n.linkedSession || n.session_id;
      const session = sessionMap[sessionId];
      if (!session?.date_time) return false;
      return new Date(session.date_time) <= toDate;
    });
  }

  const sortedNotes = filteredNotes.sort((a, b) => {
    const sessionIdA = a.linkedSession || a.session_id;
    const sessionIdB = b.linkedSession || b.session_id;
    const sessionA = sessionMap[sessionIdA];
    const sessionB = sessionMap[sessionIdB];
    const dateA = sessionA?.date_time ? new Date(sessionA.date_time) : new Date(a.created_date);
    const dateB = sessionB?.date_time ? new Date(sessionB.date_time) : new Date(b.created_date);
    return dateB - dateA;
  });

  // Filter sessions for the form dropdown
  let formSessions = [...sessions];
  if (selectedClient !== "all") {
    formSessions = formSessions.filter(s => s.client_id === selectedClient);
  }

  const createMutation = useMutation({
    mutationFn: (data) => {
      console.log('[SessionNotesTab] Creating note with data:', data);
      return api.entities.Note.create({ 
        ...data, 
        noteType: 'Session Note',
        createdByRole: currentView,
        linkedSession: data.session_id,
        linkedClient: data.client_id,
        // CRITICAL: Also store in legacy fields for backward compatibility
        session_id: data.session_id,
        client_id: data.client_id
      });
    },
    onSuccess: (newNote) => {
      console.log('[SessionNotesTab] Note created successfully:', newNote);
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
          <h2 className="text-2xl font-bold text-gray-900">Session Notes</h2>
          <p className="text-gray-600 mt-1">Notes linked to coaching sessions</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm || sessions.length === 0} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> New Note
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.id}>{client.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">From:</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[150px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">To:</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[150px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={onlyWithNotes}
            onCheckedChange={setOnlyWithNotes}
            id="only-with-notes"
          />
          <label htmlFor="only-with-notes" className="text-sm text-gray-600">
            Only sessions with notes
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {showForm && (
          <NoteForm
            sessions={formSessions}
            clients={clients}
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
                {sessions.length === 0 
                  ? "Create sessions first to add session notes." 
                  : "No session notes match your filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedNotes.map(note => {
            const sessionId = note.linkedSession || note.session_id;
            return editingNote?.id === note.id ? (
              <NoteForm
                key={note.id}
                note={note}
                sessions={formSessions}
                clients={clients}
                onSave={(data) => updateMutation.mutate({ id: note.id, data })}
                onCancel={() => setEditingNote(null)}
                isLoading={updateMutation.isPending}
              />
            ) : (
              <NoteCard
                key={note.id}
                note={note}
                session={sessionMap[sessionId]}
                client={clientMap[sessionMap[sessionId]?.client_id]}
                onEdit={setEditingNote}
                onDelete={handleDelete}
                onSelectNote={onSelectNote}
              />
            );
          })
        )}
      </div>
    </div>
  );
}