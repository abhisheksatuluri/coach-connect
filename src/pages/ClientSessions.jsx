import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Video,
  Calendar,
  Clock,
  User,
  Play,
  FileText,
  Loader2,
  AlertCircle,
  ChevronRight,
  NotebookPen,
  X
} from "lucide-react";
import { format, isAfter } from "date-fns";

export default function ClientSessionsPage() {
  const [clientId, setClientId] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem('viewingAsClientId');
    if (storedId) {
      setClientId(storedId);
    }
  }, []);

  const { data: client } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => api.entities.Client.filter({ id: clientId }),
    enabled: !!clientId,
    select: (data) => data[0]
  });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['client-sessions', clientId],
    queryFn: () => api.entities.Session.filter({ client_id: clientId }),
    enabled: !!clientId
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.entities.User.list(),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.auth.me(),
  });

  const { data: allNotes = [] } = useQuery({
    queryKey: ['client-session-notes', clientId, currentUser?.email],
    queryFn: () => api.entities.Note.filter({
      createdByRole: 'client'
    }),
    enabled: !!clientId && !!currentUser
  });

  // Filter notes - client can only see their own notes
  const notes = allNotes.filter(note =>
    note.created_by === currentUser?.email
  );

  const userMap = Object.fromEntries(users.map(u => [u.email, u]));

  // Get notes for a specific session
  const getSessionNotes = (sessionId) => {
    return notes.filter(n => n.linkedSession === sessionId);
  };

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) =>
    new Date(b.date_time || b.created_date) - new Date(a.date_time || a.created_date)
  );

  const getStatusBadge = (session) => {
    const now = new Date();
    const sessionDate = session.date_time ? new Date(session.date_time) : null;

    if (session.status === 'cancelled') {
      return <Badge className="bg-gray-100 text-gray-700">Cancelled</Badge>;
    }
    if (session.status === 'completed' || session.status === 'summary_ready') {
      return <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>;
    }
    if (sessionDate && isAfter(sessionDate, now)) {
      return <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>;
    }
    if (session.status === 'live') {
      return <Badge className="bg-red-100 text-red-700">Live</Badge>;
    }
    return <Badge className="bg-amber-100 text-amber-700">{session.status || 'Pending'}</Badge>;
  };

  const isCompleted = (session) => {
    return session.status === 'completed' || session.status === 'summary_ready';
  };

  if (!clientId) {
    return (
      <div className="p-8 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Client Selected</h2>
              <p className="text-gray-600">Please select a client from the dropdown in the header.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
          <p className="text-gray-600 mt-1">
            {client ? `Sessions for ${client.full_name}` : 'Your coaching sessions'}
          </p>
        </div>

        {/* Sessions List */}
        {sortedSessions.length === 0 ? (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="py-12 text-center">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No Sessions Yet</h3>
              <p className="text-gray-500">Your coaching sessions will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedSessions.map(session => {
              const coach = session.coach_email ? userMap[session.coach_email] : null;
              const sessionNotes = getSessionNotes(session.id);
              const completed = isCompleted(session);

              return (
                <Card
                  key={session.id}
                  className="bg-white hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedSession(session)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Video className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{session.title}</h3>
                            {coach && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <User className="w-3 h-3" />
                                <span>with {coach.full_name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                          {session.date_time && (
                            <>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{format(new Date(session.date_time), 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{format(new Date(session.date_time), 'h:mm a')}</span>
                              </div>
                            </>
                          )}
                          {sessionNotes.length > 0 && (
                            <div className="flex items-center gap-1 text-purple-600">
                              <NotebookPen className="w-4 h-4" />
                              <span>{sessionNotes.length} note{sessionNotes.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(session)}

                        <div className="flex items-center gap-2 mt-2">
                          {completed && session.recording_file_id && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                              <Play className="w-3 h-3 mr-1" />
                              Recording
                            </Badge>
                          )}
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Session Detail Modal */}
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          coach={selectedSession?.coach_email ? userMap[selectedSession.coach_email] : null}
          notes={selectedSession ? getSessionNotes(selectedSession.id) : []}
        />
      </div>
    </div>
  );
}

function SessionDetailModal({ session, onClose, coach, notes }) {
  if (!session) return null;

  const completed = session.status === 'completed' || session.status === 'summary_ready';

  return (
    <Dialog open={!!session} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Video className="w-5 h-5 text-emerald-600" />
            </div>
            {session.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Session Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium text-gray-900">
                  {session.date_time
                    ? format(new Date(session.date_time), 'EEEE, MMMM d, yyyy \'at\' h:mm a')
                    : 'Not scheduled'
                  }
                </p>
              </div>
              {coach && (
                <div>
                  <p className="text-sm text-gray-500">Coach</p>
                  <p className="font-medium text-gray-900">{coach.full_name}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-900">{session.duration || 60} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-gray-900 capitalize">{session.status}</p>
              </div>
            </div>
          </div>

          {/* Recording Section */}
          {completed && session.recording_file_id && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Play className="w-4 h-4 text-blue-600" />
                Session Recording
              </h4>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  // Open recording - this would need a function to get signed URL
                  window.open(`https://drive.google.com/file/d/${session.recording_file_id}/view`, '_blank');
                }}
              >
                <Play className="w-4 h-4" />
                Watch Recording
              </Button>
            </div>
          )}

          {/* Client's Notes */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <NotebookPen className="w-4 h-4 text-purple-600" />
              My Notes
            </h4>

            {notes.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <NotebookPen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No notes added yet</p>
                <p className="text-gray-400 text-xs mt-1">Use the Notes button on the right to add notes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map(note => (
                  <div key={note.id} className="bg-purple-50 rounded-lg p-3">
                    <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {format(new Date(note.created_date), 'MMM d, yyyy \'at\' h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pre-session Notes (if any, from coach) */}
          {session.preSessionNotes && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Topics to Discuss
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap">{session.preSessionNotes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}