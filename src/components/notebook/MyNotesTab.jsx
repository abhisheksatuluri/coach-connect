import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, Save, X, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

function NoteCard({ note, isSelected, onClick }) {
  const preview = note.content.length > 100 
    ? note.content.substring(0, 100) + '...' 
    : note.content;

  return (
    <Card 
      className={`bg-white hover:shadow-md transition-all cursor-pointer ${
        isSelected ? 'border-l-4 border-l-emerald-500 bg-emerald-50' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="mb-2">
          <p className="text-gray-600 text-sm line-clamp-2">{preview}</p>
        </div>
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

function NoteForm({ note, onSave, onCancel, isLoading }) {
  const [content, setContent] = useState(note?.content || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSave(content.trim());
    }
  };

  return (
    <Card className="bg-white border-2 border-emerald-200">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note..."
            className="min-h-[100px]"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button type="submit" disabled={!content.trim() || isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function MyNotesTab({ selectedNoteId, onNoteSelect }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current view and user context
  const currentView = localStorage.getItem('currentView') || 'coach';

  React.useEffect(() => {
    const loadUser = async () => {
      const user = await api.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: allNotes = [], isLoading } = useQuery({
    queryKey: ['notes', 'my-notes', currentView, currentUser?.email],
    queryFn: async () => {
      // Fetch all notes - we'll filter on the client side
      const notes = await api.entities.Note.list();
      // Filter for My Notes: noteType is "My Note" OR no noteType and no links
      return notes.filter(note => 
        note.noteType === 'My Note' || 
        (!note.noteType && !note.linkedClient && !note.linkedSession && !note.linkedJourney && !note.linkedTask)
      );
    },
    enabled: !!currentUser
  });

  // Filter notes by role only (all coaches see all coach notes, etc.)
  const notes = allNotes.filter(note => {
    if (note.createdByRole && note.createdByRole !== currentView) return false;
    return true;
  });

  const sortedNotes = [...notes].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const createMutation = useMutation({
    mutationFn: (content) => api.entities.Note.create({ 
      content, 
      noteType: 'My Note',
      createdByRole: currentView
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setShowForm(false);
    }
  });



  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Notes</h2>
          <p className="text-gray-500 text-sm mt-1">Personal notes</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          disabled={showForm} 
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-1" /> New
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        {showForm && (
          <NoteForm
            onSave={(content) => {
              createMutation.mutate(content);
              setShowForm(false);
            }}
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
              <p className="text-gray-500 text-sm">No notes yet.</p>
            </CardContent>
          </Card>
        ) : (
          sortedNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              isSelected={selectedNoteId === note.id}
              onClick={() => onNoteSelect(note.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}