import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyNotesTab from "@/components/notebook/MyNotesTab";
import ClientNotesTab from "@/components/notebook/ClientNotesTab";
import SessionNotesTab from "@/components/notebook/SessionNotesTab";
import JourneyNotesTab from "@/components/notebook/JourneyNotesTab";
import FilesTab from "@/components/notebook/FilesTab";
import NoteDetailPanel from "@/components/notebook/NoteDetailPanel";

export default function NotebookPage() {
  const queryClient = useQueryClient();
  const [selectedNoteId, setSelectedNoteId] = useState(localStorage.getItem('selectedNoteId') || '');
  const [activeTab, setActiveTab] = useState("my-notes");

  // Fetch all necessary data for the detail panel
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.entities.Session.list(),
  });

  const { data: journeys = [] } = useQuery({
    queryKey: ['journeys'],
    queryFn: () => api.entities.Journey.list(),
  });

  const { data: clientJourneys = [] } = useQuery({
    queryKey: ['client-journeys'],
    queryFn: () => api.entities.ClientJourney.list(),
  });

  const { data: selectedNote } = useQuery({
    queryKey: ['note', selectedNoteId],
    queryFn: async () => {
      if (!selectedNoteId) return null;
      const notes = await api.entities.Note.filter({ id: selectedNoteId });
      return notes[0] || null;
    },
    enabled: !!selectedNoteId
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Note.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', selectedNoteId] });
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => api.entities.Note.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setSelectedNoteId('');
      localStorage.setItem('selectedNoteId', '');
      window.dispatchEvent(new Event('noteSelectionChanged'));
    }
  });

  const handleNoteSelect = (noteId) => {
    console.log('[Notebook] Note clicked, setting selectedNoteId:', noteId);
    console.log('[Notebook] Note ID type:', typeof noteId);

    // Ensure noteId is converted to string and stored
    const noteIdString = String(noteId);
    localStorage.setItem('selectedNoteId', noteIdString);
    setSelectedNoteId(noteIdString);

    console.log('[Notebook] localStorage now contains:', localStorage.getItem('selectedNoteId'));
    window.dispatchEvent(new Event('noteSelectionChanged'));
  };

  const handleCloseDetail = () => {
    console.log('[Notebook] Closing detail panel');
    localStorage.setItem('selectedNoteId', '');
    setSelectedNoteId('');
    window.dispatchEvent(new Event('noteSelectionChanged'));
  };

  useEffect(() => {
    const handleNoteSelection = (e) => {
      if (e.detail?.noteId) {
        handleNoteSelect(e.detail.noteId);
      }
    };

    window.addEventListener('selectNote', handleNoteSelection);

    // Clear selection when navigating away from Notebook
    return () => {
      console.log('[Notebook] Component unmounting, clearing selection');
      localStorage.setItem('selectedNoteId', '');
      window.removeEventListener('selectNote', handleNoteSelection);
    };
  }, []);

  // Clear selection when changing tabs
  const handleTabChange = (value) => {
    console.log('[Notebook] Tab changed to:', value);
    console.log('[Notebook] Clearing selection due to tab change');
    setActiveTab(value);

    // Store active tab for fallback context detection
    localStorage.setItem('notebookActiveTab', value);

    // Clear selection when switching to any tab
    localStorage.setItem('selectedNoteId', '');
    setSelectedNoteId('');
    console.log('[Notebook] localStorage cleared, now contains:', localStorage.getItem('selectedNoteId'));
    window.dispatchEvent(new Event('noteSelectionChanged'));
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200 bg-white">
        <h1 className="text-3xl font-bold text-gray-900">Notebook</h1>
        <p className="text-gray-600 mt-1">Your notes and documentation</p>
      </div>

      {/* Main Content - Side Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Note List */}
        <div className="w-[40%] min-w-[350px] flex flex-col border-r border-gray-200 bg-gray-50">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col h-full">
            <TabsList className="m-4 grid grid-cols-5 w-auto">
              <TabsTrigger value="my-notes">My Notes</TabsTrigger>
              <TabsTrigger value="client-notes">Client Notes</TabsTrigger>
              <TabsTrigger value="session-notes">Session Notes</TabsTrigger>
              <TabsTrigger value="journey-notes">Journey Notes</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="my-notes" className="h-full m-0 p-4">
                <MyNotesTab selectedNoteId={selectedNoteId} onNoteSelect={handleNoteSelect} />
              </TabsContent>

              <TabsContent value="client-notes" className="h-full m-0 p-4">
                <ClientNotesTab selectedNoteId={selectedNoteId} onNoteSelect={handleNoteSelect} />
              </TabsContent>

              <TabsContent value="session-notes" className="h-full m-0 p-4">
                <SessionNotesTab onSelectNote={handleNoteSelect} />
              </TabsContent>

              <TabsContent value="journey-notes" className="h-full m-0 p-4">
                <JourneyNotesTab onSelectNote={handleNoteSelect} />
              </TabsContent>

              <TabsContent value="files" className="h-full m-0 p-4">
                <FilesTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Side - Note Detail Panel */}
        {activeTab !== 'files' && (
          <NoteDetailPanel
            note={selectedNote}
            onUpdate={(id, data) => updateNoteMutation.mutate({ id, data })}
            onDelete={(id) => deleteNoteMutation.mutate(id)}
            onClose={handleCloseDetail}
            clients={clients}
            sessions={sessions}
            journeys={journeys}
            clientJourneys={clientJourneys}
          />
        )}
        {activeTab === 'files' && (
          <div className="flex-1 bg-gray-50" />
        )}
      </div>
    </div>
  );
}