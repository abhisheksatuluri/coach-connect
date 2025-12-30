import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Save, Loader2, Pin, PinOff, Trash2, Link2, Edit2, Plus, StickyNote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function NotesSlider({ isOpen, onClose, currentPageName }) {
  const queryClient = useQueryClient();
  
  const [noteType, setNoteType] = useState("My Note");
  const [content, setContent] = useState("");
  const [linkedClient, setLinkedClient] = useState("");
  const [linkedSession, setLinkedSession] = useState("");
  const [linkedJourney, setLinkedJourney] = useState("");
  const [linkedTask, setLinkedTask] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [contextLabel, setContextLabel] = useState("");
  const [contextFilter, setContextFilter] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.auth.me(),
    enabled: isOpen
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list(),
    enabled: isOpen
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.entities.Session.list(),
    enabled: isOpen
  });

  const { data: journeys = [] } = useQuery({
    queryKey: ['client-journeys'],
    queryFn: () => api.entities.ClientJourney.list(),
    enabled: isOpen
  });

  const { data: actions = [] } = useQuery({
    queryKey: ['actions'],
    queryFn: () => api.entities.Action.list(),
    enabled: isOpen
  });

  // Get current view context for privacy filtering
  const getCurrentViewContext = () => {
    const currentView = localStorage.getItem('currentView') || 'coach';
    const practitionerId = localStorage.getItem('viewingAsPractitionerId');
    const clientId = localStorage.getItem('viewingAsClientId');
    return { currentView, practitionerId, clientId };
  };

  const viewContext = getCurrentViewContext();

  const { data: allNotes = [], isLoading } = useQuery({
    queryKey: ['notes-slider', viewContext.currentView, viewContext.practitionerId, viewContext.clientId, currentUser?.email],
    queryFn: async () => {
      // Fetch notes based on current view and enforce privacy
      const allUserNotes = await api.entities.Note.list('-created_date', 50);
      return allUserNotes;
    },
    enabled: isOpen && !!currentUser
  });

  // Filter notes based on privacy rules and context
  const notes = allNotes.filter(note => {
    // User can only see notes they created
    if (note.created_by !== currentUser?.email) return false;
    
    // Additionally filter by role context
    const { currentView } = viewContext;
    if (currentView === 'coach' && note.createdByRole !== 'coach') return false;
    if (currentView === 'practitioner' && note.createdByRole !== 'practitioner') return false;
    if (currentView === 'client' && note.createdByRole !== 'client') return false;
    
    // Filter by context if set
    if (contextFilter) {
      if (contextFilter.type === 'client' && note.linkedClient !== contextFilter.id) return false;
      if (contextFilter.type === 'session' && note.linkedSession !== contextFilter.id) return false;
      if (contextFilter.type === 'journey' && note.linkedJourney !== contextFilter.id) return false;
    }
    
    return true;
  });

  // Detect context from URL or page
  useEffect(() => {
    if (!isOpen) return;

    const detectContext = async () => {
      // First check if there's a global context set (for components like ClientDetails)
      const globalContext = window.__kbContext || {};
      
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = globalContext.sessionId || urlParams.get('sessionId');
      const clientJourneyId = globalContext.clientJourneyId || urlParams.get('clientJourneyId');
      const journeyId = globalContext.journeyId || urlParams.get('journeyId');
      const clientId = globalContext.clientId || urlParams.get('clientId');

      // Priority 1: Session context
      if (sessionId) {
        const session = await api.entities.Session.filter({ id: sessionId }).then(r => r[0]);
        if (session) {
          setContextLabel(`Notes for ${session.title}`);
          setContextFilter({ type: 'session', id: sessionId });
          setLinkedSession(sessionId);
          if (session.client_id) setLinkedClient(session.client_id);
          setNoteType("Session Note");
          return;
        }
      }

      // Priority 2: Client Journey context (specific journey instance)
      if (clientJourneyId) {
        const clientJourney = await api.entities.ClientJourney.filter({ id: clientJourneyId }).then(r => r[0]);
        const journey = clientJourney ? await api.entities.Journey.filter({ id: clientJourney.journey_id }).then(r => r[0]) : null;
        if (journey) {
          setContextLabel(`Notes for ${journey.title}`);
          setContextFilter({ type: 'journey', id: clientJourneyId });
          setLinkedJourney(clientJourneyId);
          if (clientJourney.client_id) setLinkedClient(clientJourney.client_id);
          setNoteType("Journey Note");
          return;
        }
      }

      // Priority 3: Journey template context
      if (journeyId) {
        const journey = await api.entities.Journey.filter({ id: journeyId }).then(r => r[0]);
        if (journey) {
          setContextLabel(`Notes for ${journey.title}`);
          setContextFilter({ type: 'journey', id: journeyId });
          setLinkedJourney(journeyId);
          setNoteType("Journey Note");
          return;
        }
      }

      // Priority 4: Client context (only if no other specific context)
      if (clientId) {
        const client = await api.entities.Client.filter({ id: clientId }).then(r => r[0]);
        if (client) {
          setContextLabel(`Notes for ${client.full_name}`);
          setContextFilter({ type: 'client', id: clientId });
          setLinkedClient(clientId);
          setNoteType("Client Note");
          return;
        }
      }

      // List pages - show appropriate message
      setContextFilter(null);
      if (currentPageName === 'Clients') {
        setContextLabel('Select a client to see their notes');
      } else if (currentPageName === 'Sessions' || currentPageName === 'ClientSessions') {
        setContextLabel('Select a session to see session notes');
      } else if (currentPageName === 'Journeys' || currentPageName === 'ClientJourneys') {
        setContextLabel('Select a journey to see journey notes');
      } else {
        setContextLabel('');
      }
    };

    detectContext();
  }, [isOpen, currentPageName]);

  // Listen for context changes
  useEffect(() => {
    const handleContextChange = async () => {
      const detectContext = async () => {
        // First check if there's a global context set (for components like ClientDetails)
        const globalContext = window.__kbContext || {};
        
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = globalContext.sessionId || urlParams.get('sessionId');
        const clientJourneyId = globalContext.clientJourneyId || urlParams.get('clientJourneyId');
        const journeyId = globalContext.journeyId || urlParams.get('journeyId');
        const clientId = globalContext.clientId || urlParams.get('clientId');

        // Priority 1: Session context
        if (sessionId) {
          const session = await api.entities.Session.filter({ id: sessionId }).then(r => r[0]);
          if (session) {
            setContextLabel(`Notes for ${session.title}`);
            setContextFilter({ type: 'session', id: sessionId });
            setLinkedSession(sessionId);
            if (session.client_id) setLinkedClient(session.client_id);
            setNoteType("Session Note");
            return;
          }
        }

        // Priority 2: Client Journey context (specific journey instance)
        if (clientJourneyId) {
          const clientJourney = await api.entities.ClientJourney.filter({ id: clientJourneyId }).then(r => r[0]);
          const journey = clientJourney ? await api.entities.Journey.filter({ id: clientJourney.journey_id }).then(r => r[0]) : null;
          if (journey) {
            setContextLabel(`Notes for ${journey.title}`);
            setContextFilter({ type: 'journey', id: clientJourneyId });
            setLinkedJourney(clientJourneyId);
            if (clientJourney.client_id) setLinkedClient(clientJourney.client_id);
            setNoteType("Journey Note");
            return;
          }
        }

        // Priority 3: Journey template context
        if (journeyId) {
          const journey = await api.entities.Journey.filter({ id: journeyId }).then(r => r[0]);
          if (journey) {
            setContextLabel(`Notes for ${journey.title}`);
            setContextFilter({ type: 'journey', id: journeyId });
            setLinkedJourney(journeyId);
            setNoteType("Journey Note");
            return;
          }
        }

        // Priority 4: Client context (only if no other specific context)
        if (clientId) {
          const client = await api.entities.Client.filter({ id: clientId }).then(r => r[0]);
          if (client) {
            setContextLabel(`Notes for ${client.full_name}`);
            setContextFilter({ type: 'client', id: clientId });
            setLinkedClient(clientId);
            setNoteType("Client Note");
            return;
          }
        }

        // List pages - show appropriate message
        setContextFilter(null);
        if (currentPageName === 'Clients') {
          setContextLabel('Select a client to see their notes');
        } else if (currentPageName === 'Sessions' || currentPageName === 'ClientSessions') {
          setContextLabel('Select a session to see session notes');
        } else if (currentPageName === 'Journeys' || currentPageName === 'ClientJourneys') {
          setContextLabel('Select a journey to see journey notes');
        } else {
          setContextLabel('');
        }
      };

      detectContext();
    };
    
    window.addEventListener('kbContextChanged', handleContextChange);
    return () => window.removeEventListener('kbContextChanged', handleContextChange);
  }, [isOpen, currentPageName]);

  // Handle noteType changes - clear irrelevant links
  useEffect(() => {
    if (noteType === "My Note") {
      setLinkedClient("");
      setLinkedSession("");
      setLinkedJourney("");
      setLinkedTask("");
    } else if (noteType === "Client Note") {
      setLinkedSession("");
      setLinkedJourney("");
      setLinkedTask("");
    } else if (noteType === "Session Note") {
      setLinkedJourney("");
      setLinkedTask("");
    } else if (noteType === "Journey Note") {
      setLinkedSession("");
      setLinkedTask("");
    } else if (noteType === "Task Note") {
      setLinkedSession("");
      setLinkedJourney("");
    }
  }, [noteType]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const note = await api.entities.Note.create(data);
      
      // Update parent entity timestamps for cache invalidation
      if (data.linkedClient) {
        await api.entities.Client.update(data.linkedClient, {}).catch(() => {});
      }
      if (data.linkedSession) {
        await api.entities.Session.update(data.linkedSession, {}).catch(() => {});
      }
      if (data.linkedJourney) {
        await api.entities.ClientJourney.update(data.linkedJourney, {}).catch(() => {});
      }
      
      return note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes-slider'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const updatedNote = await api.entities.Note.update(id, data);
      
      // Update parent entity timestamps for cache invalidation
      if (data.linkedClient) {
        await api.entities.Client.update(data.linkedClient, {}).catch(() => {});
      }
      if (data.linkedSession) {
        await api.entities.Session.update(data.linkedSession, {}).catch(() => {});
      }
      if (data.linkedJourney) {
        await api.entities.ClientJourney.update(data.linkedJourney, {}).catch(() => {});
      }
      
      return updatedNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes-slider'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.Note.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes-slider'] })
  });

  const resetForm = () => {
    setContent("");
    setShowAddForm(false);
    setEditingNote(null);
    setSelectedNote(null);
  };

  const handleClose = () => {
    resetForm();
    setContextLabel("");
    setContextFilter(null);
    setLinkedClient("");
    setLinkedSession("");
    setLinkedJourney("");
    setLinkedTask("");
    onClose();
  };

  const handleAddNote = () => {
    setSelectedNote(null);
    setEditingNote(null);
    setShowAddForm(true);
  };

  const handleStartEdit = (note) => {
    setEditingNote(note);
    setContent(note.content);
    setNoteType(note.noteType || "My Note");
    setLinkedClient(note.linkedClient || "");
    setLinkedSession(note.linkedSession || "");
    setLinkedJourney(note.linkedJourney || "");
    setLinkedTask(note.linkedTask || "");
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setContent("");
    if (selectedNote) {
      // Return to detail view
    } else {
      setSelectedNote(null);
    }
  };

  const handleUpdateNote = async () => {
    if (!content.trim() || !editingNote) return;
    setIsSaving(true);
    
    const noteData = {
      content: content.trim(),
      noteType,
      linkedClient: linkedClient || null,
      linkedSession: linkedSession || null,
      linkedJourney: linkedJourney || null,
      linkedTask: linkedTask || null,
    };

    await updateMutation.mutateAsync({ id: editingNote.id, data: noteData });
    const updatedNote = { ...editingNote, ...noteData };
    setSelectedNote(updatedNote);
    setEditingNote(null);
    setContent("");
    setIsSaving(false);
  };

  const getUserRole = () => {
    // Use current view to determine role for note creation
    const currentView = localStorage.getItem('currentView') || 'coach';
    return currentView;
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    
    const noteData = {
      content: content.trim(),
      noteType,
      createdByRole: getUserRole(),
      linkedClient: linkedClient || null,
      linkedSession: linkedSession || null,
      linkedJourney: linkedJourney || null,
      linkedTask: linkedTask || null,
      isPinned: false
    };

    await createMutation.mutateAsync(noteData);
    resetForm();
    setIsSaving(false);
  };

  const handleTogglePin = async (note) => {
    await updateMutation.mutateAsync({ 
      id: note.id, 
      data: { isPinned: !note.isPinned } 
    });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(id);
      setSelectedNote(null);
      setEditingNote(null);
    }
  };

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));
  const sessionMap = Object.fromEntries(sessions.map(s => [s.id, s]));

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const showClientSelector = ["Client Note", "Session Note", "Journey Note", "Task Note"].includes(noteType);
  const showSessionSelector = noteType === "Session Note";
  const showJourneySelector = noteType === "Journey Note";
  const showTaskSelector = noteType === "Task Note";

  // Filter sessions by selected client
  const filteredSessions = linkedClient 
    ? sessions.filter(s => s.client_id === linkedClient)
    : sessions;

  // Filter journeys by selected client
  const filteredJourneys = linkedClient
    ? journeys.filter(j => j.client_id === linkedClient)
    : journeys;

  // Filter tasks by selected client
  const filteredTasks = linkedClient
    ? actions.filter(a => a.client_id === linkedClient)
    : actions;

  const sliderWidth = (selectedNote || showAddForm || editingNote) ? '750px' : '400px';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 h-full bg-white shadow-2xl z-50 flex border-l border-gray-200"
          style={{ width: sliderWidth }}
        >
          {/* Main Notes List Panel */}
          <div className={`flex flex-col ${(selectedNote || showAddForm || editingNote) ? 'w-[350px]' : 'w-full'} border-r border-gray-200`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-gray-900">Notes</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    className="bg-emerald-600 hover:bg-emerald-700 h-8"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Note
                  </Button>
                  <button
                    onClick={handleClose}
                    className="hover:bg-gray-200 p-1.5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              {contextLabel && (
                <p className="text-sm text-gray-600">{contextLabel}</p>
              )}
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {!contextFilter ? (
                  <div className="text-center py-12 text-gray-500">
                    <StickyNote className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">Navigate to a client, session, or journey to see related notes</p>
                  </div>
                ) : isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : sortedNotes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-sm">No notes yet. Click "Add Note" to create one.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedNotes.map(note => (
                      <Card 
                        key={note.id}
                        className={`cursor-pointer hover:shadow-md transition-shadow ${
                          note.isPinned ? 'border-emerald-300 bg-emerald-50/50' : ''
                        } ${selectedNote?.id === note.id ? 'ring-2 ring-emerald-400' : ''}`}
                        onClick={() => {
                          setSelectedNote(note);
                          setShowAddForm(false);
                          setEditingNote(null);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {note.noteType}
                            </Badge>
                            {note.isPinned && <Pin className="w-3 h-3 text-emerald-600" />}
                          </div>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap line-clamp-3">{note.content}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>{format(new Date(note.created_date), 'MMM d, h:mm a')}</span>
                            {note.updated_date && note.updated_date !== note.created_date && (
                              <span className="text-amber-600">(edited)</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Detail/Form Panel (stacked) */}
          <AnimatePresence>
            {(selectedNote || showAddForm || editingNote) && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="flex-1 flex flex-col border-l border-gray-200"
              >
                {editingNote || showAddForm ? (
                  <>
                    {/* Form Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">
                          {editingNote ? 'Edit Note' : 'New Note'}
                        </h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingNote(null);
                            setShowAddForm(false);
                            setContent("");
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Form Content */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-3">
                        <Select value={noteType} onValueChange={setNoteType}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select note type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="My Note">My Note</SelectItem>
                            <SelectItem value="Client Note">Client Note</SelectItem>
                            <SelectItem value="Session Note">Session Note</SelectItem>
                            <SelectItem value="Journey Note">Journey Note</SelectItem>
                            <SelectItem value="Task Note">Task Note</SelectItem>
                          </SelectContent>
                        </Select>

                        {showClientSelector && (
                          <Select value={linkedClient} onValueChange={setLinkedClient}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Link to client (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={null}>No client</SelectItem>
                              {clients.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {showSessionSelector && (
                          <Select value={linkedSession} onValueChange={setLinkedSession}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Link to session (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={null}>No session</SelectItem>
                              {filteredSessions.map(s => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.title} {s.date_time && `(${format(new Date(s.date_time), 'MMM d')})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {showJourneySelector && (
                          <Select value={linkedJourney} onValueChange={setLinkedJourney}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Link to journey (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={null}>No journey</SelectItem>
                              {filteredJourneys.map(j => (
                                <SelectItem key={j.id} value={j.id}>
                                  {clientMap[j.client_id]?.full_name || 'Unknown'} - Journey
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {showTaskSelector && (
                          <Select value={linkedTask} onValueChange={setLinkedTask}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Link to task (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={null}>No task</SelectItem>
                              {filteredTasks.map(t => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        <Textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Write your note..."
                          className="min-h-[200px] bg-white"
                        />

                        <div className="flex gap-2">
                          <Button 
                            onClick={editingNote ? handleUpdateNote : handleSave}
                            disabled={!content.trim() || isSaving}
                            className={editingNote ? "bg-amber-600 hover:bg-amber-700 flex-1" : "bg-emerald-600 hover:bg-emerald-700 flex-1"}
                          >
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            {editingNote ? 'Save Changes' : 'Save Note'}
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setEditingNote(null);
                              setShowAddForm(false);
                              setContent("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </ScrollArea>
                  </>
                ) : selectedNote && (
                  <>
                    {/* Detail Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge className="mb-2">{selectedNote.noteType}</Badge>
                          {selectedNote.isPinned && (
                            <Badge variant="outline" className="ml-2">
                              <Pin className="w-3 h-3 mr-1" />
                              Pinned
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedNote(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Detail Content */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedNote.content}</p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Created</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(selectedNote.created_date), 'MMM d, yyyy h:mm a')}
                          </p>
                          {selectedNote.updated_date && selectedNote.updated_date !== selectedNote.created_date && (
                            <>
                              <p className="text-xs font-semibold text-gray-700 mb-1 mt-2">Last edited</p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(selectedNote.updated_date), 'MMM d, yyyy h:mm a')}
                              </p>
                            </>
                          )}
                        </div>

                        {(selectedNote.linkedClient || selectedNote.linkedSession) && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-blue-900 mb-1">Linked To</p>
                            {selectedNote.linkedClient && clientMap[selectedNote.linkedClient] && (
                              <p className="text-sm text-gray-700">
                                Client: {clientMap[selectedNote.linkedClient].full_name}
                              </p>
                            )}
                            {selectedNote.linkedSession && sessionMap[selectedNote.linkedSession] && (
                              <p className="text-sm text-gray-700">
                                Session: {sessionMap[selectedNote.linkedSession].title}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStartEdit(selectedNote)}
                            className="flex-1"
                            variant="outline"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(selectedNote.id)}
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </ScrollArea>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}