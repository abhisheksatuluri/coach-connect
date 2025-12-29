import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StickyNote, Pin, Plus, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { setNoteContextClient, setNoteContextSession, setNoteContextJourney } from "./useNoteContext";

export default function NotesSection({ 
  linkedClient, 
  linkedSession, 
  linkedJourney,
  journeyTitle,
  title = "Notes" 
}) {
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();
  
  // Get current view for privacy filtering
  const currentView = localStorage.getItem('currentView') || 'coach';

  // Fetch current user
  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  // Build query filter - prioritize specific context over general
  const noteFilter = {};
  if (linkedSession) {
    noteFilter.linkedSession = linkedSession;
  } else if (linkedJourney) {
    noteFilter.linkedJourney = linkedJourney;
  } else if (linkedClient) {
    noteFilter.linkedClient = linkedClient;
  }

  // Fetch notes
  const { data: allNotes = [] } = useQuery({
    queryKey: ['notes', 'section', linkedClient, linkedSession, linkedJourney, currentView],
    queryFn: () => base44.entities.Note.filter(noteFilter),
    enabled: !!(linkedClient || linkedSession || linkedJourney)
  });

  // Filter notes by current view role
  const notes = allNotes.filter(note => note.createdByRole === currentView);

  // Sort notes: pinned first, then by date descending
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Note.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      alert('Note deleted');
    }
  });

  const handleAddNote = () => {
    // Set the appropriate context before opening the slider
    if (linkedSession) {
      setNoteContextSession(linkedSession, linkedClient);
    } else if (linkedJourney) {
      setNoteContextJourney(linkedJourney, linkedClient, journeyTitle);
    } else if (linkedClient) {
      setNoteContextClient(linkedClient);
    }
    
    // Trigger the global notes slider
    window.dispatchEvent(new CustomEvent('openNotesSlider'));
  };

  const handleEditNote = (note, e) => {
    e.stopPropagation(); // Prevent collapsing the note
    
    // Set the appropriate context before opening the slider
    if (linkedSession) {
      setNoteContextSession(linkedSession, linkedClient);
    } else if (linkedJourney) {
      setNoteContextJourney(linkedJourney, linkedClient, journeyTitle);
    } else if (linkedClient) {
      setNoteContextClient(linkedClient);
    }
    
    // Dispatch custom event with note data for editing
    window.dispatchEvent(new CustomEvent('editNote', { detail: note }));
  };

  const handleDeleteNote = async (note, e) => {
    e.stopPropagation(); // Prevent collapsing the note
    
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(note.id);
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="border-b border-emerald-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StickyNote className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-xl">{title}</CardTitle>
            {notes.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {notes.length}
              </Badge>
            )}
          </div>
          <Button 
            onClick={handleAddNote}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {sortedNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <StickyNote className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No notes yet. Click 'Add Note' to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedNotes.map(note => {
              const isExpanded = expandedNoteId === note.id;
              const truncatedContent = note.content.length > 150 
                ? note.content.substring(0, 150) + '...' 
                : note.content;
              const canEditDelete = currentUser && note.created_by === currentUser.email;
              
              return (
                <Card 
                  key={note.id}
                  className="bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer border-gray-200"
                  onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {note.noteType}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {format(new Date(note.created_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {note.isPinned && (
                        <Pin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {isExpanded ? note.content : truncatedContent}
                    </p>
                    {note.content.length > 150 && (
                      <p className="text-xs text-emerald-600 mt-2">
                        {isExpanded ? 'Click to collapse' : 'Click to expand'}
                      </p>
                    )}
                    {isExpanded && canEditDelete && (
                      <div className="flex gap-2 justify-end mt-3 pt-3 border-t border-gray-200">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleEditNote(note, e)}
                          className="h-8"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleDeleteNote(note, e)}
                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}