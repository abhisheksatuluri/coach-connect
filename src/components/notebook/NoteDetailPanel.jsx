import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit2, Save, Trash2, ExternalLink, X, FileText, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function NoteDetailPanel({ 
  note, 
  onUpdate, 
  onDelete,
  onClose,
  clients = [],
  sessions = [],
  journeys = [],
  clientJourneys = []
}) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    if (note) {
      setEditedContent(note.content || "");
      setIsEditing(false);
    }
  }, [note?.id]);

  const handleOpenKnowledgeSlider = () => {
    window.dispatchEvent(new CustomEvent('openKBSlider'));
  };

  const handleSave = async () => {
    if (editedContent.trim()) {
      await onUpdate(note.id, { content: editedContent.trim() });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      onDelete(note.id);
    }
  };

  const handleNavigateToLinked = () => {
    if (note.linkedClient) {
      navigate(createPageUrl('Clients') + '?clientId=' + note.linkedClient);
    } else if (note.linkedSession) {
      navigate(createPageUrl('Sessions') + '?sessionId=' + note.linkedSession);
    } else if (note.linkedJourney) {
      navigate(createPageUrl('Journeys') + '?clientJourneyId=' + note.linkedJourney);
    }
  };

  const getLinkedObjectLabel = () => {
    if (note.linkedClient) {
      const client = clients.find(c => c.id === note.linkedClient);
      return client ? `Client: ${client.full_name}` : 'Client (unknown)';
    }
    if (note.linkedSession) {
      const session = sessions.find(s => s.id === note.linkedSession);
      return session ? `Session: ${session.title}` : 'Session (unknown)';
    }
    if (note.linkedJourney) {
      const clientJourney = clientJourneys.find(cj => cj.id === note.linkedJourney);
      if (clientJourney) {
        const journey = journeys.find(j => j.id === clientJourney.journey_id);
        return journey ? `Journey: ${journey.title}` : 'Journey (unknown)';
      }
      return 'Journey (unknown)';
    }
    return null;
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Select a note to view details</p>
        </div>
      </div>
    );
  }

  const linkedLabel = getLinkedObjectLabel();

  return (
    <div className="flex-1 flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Note Details</h2>
                <p className="text-xs text-gray-400 mt-1">ID: {note.id}</p>
              </div>
              {onClose && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="h-7 w-7 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {linkedLabel && (
              <button
                onClick={handleNavigateToLinked}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-2"
              >
                <span>{linkedLabel}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={handleOpenKnowledgeSlider}
              className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-800 font-medium"
            >
              <BookOpen className="w-4 h-4" />
              <span>Open Knowledge for related articles</span>
            </button>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Created: {format(new Date(note.created_date), 'MMM d, yyyy h:mm a')}</span>
          {note.updated_date && note.updated_date !== note.created_date && (
            <span className="text-amber-600">
              Updated: {format(new Date(note.updated_date), 'MMM d, yyyy h:mm a')}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[300px] text-base"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={!editedContent.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditedContent(note.content || "");
                    setIsEditing(false);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <p className="text-gray-800 whitespace-pre-wrap text-base leading-relaxed">
                {note.content}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer with metadata and linked objects */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-4">
        {/* Display Linked Objects */}
        {(note.linkedClient || note.linkedSession || note.linkedJourney) && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Linked To</p>
            
            {note.linkedClient && (() => {
              const client = clients.find(c => c.id === note.linkedClient);
              return client ? (
                <button
                  onClick={() => navigate(createPageUrl('Clients') + '?clientId=' + note.linkedClient)}
                  className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 font-medium bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 w-full text-left"
                >
                  <span>👤 Client: {client.full_name}</span>
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </button>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                  Client ID: {note.linkedClient} (not found)
                </div>
              );
            })()}
            
            {note.linkedSession && (() => {
              const session = sessions.find(s => s.id === note.linkedSession);
              return session ? (
                <button
                  onClick={() => navigate(createPageUrl('Sessions') + '?sessionId=' + note.linkedSession)}
                  className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 font-medium bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 w-full text-left"
                >
                  <span>🎥 Session: {session.title}</span>
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </button>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                  Session ID: {note.linkedSession} (not found)
                </div>
              );
            })()}
            
            {note.linkedJourney && (() => {
              const clientJourney = clientJourneys.find(cj => cj.id === note.linkedJourney);
              const journey = clientJourney ? journeys.find(j => j.id === clientJourney.journey_id) : journeys.find(j => j.id === note.linkedJourney);
              return journey ? (
                <button
                  onClick={() => navigate(createPageUrl('Journeys') + '?clientJourneyId=' + note.linkedJourney)}
                  className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 font-medium bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 w-full text-left"
                >
                  <span>🗺️ Journey: {journey.title}</span>
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </button>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                  Journey ID: {note.linkedJourney} (not found)
                </div>
              );
            })()}
          </div>
        )}
        
        {/* Note Type Badges */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          <Badge variant="outline">{note.noteType || 'My Note'}</Badge>
          {note.createdByRole && (
            <Badge variant="secondary" className="capitalize">{note.createdByRole}</Badge>
          )}
        </div>
      </div>
    </div>
  );
}