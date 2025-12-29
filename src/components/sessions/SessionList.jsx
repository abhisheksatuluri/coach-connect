import React from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isValid } from "date-fns";
import { Video, Calendar, Clock, ExternalLink, Edit, Trash2, User, RefreshCw, StickyNote } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import SessionDetail from './SessionDetail';

const statusColors = {
  'needs-response': "bg-yellow-100 text-yellow-800 border-yellow-200",
  'scheduled': "bg-blue-100 text-blue-800 border-blue-200",
  'upcoming': "bg-purple-100 text-purple-800 border-purple-200",
  'in-progress': "bg-green-100 text-green-800 border-green-200",
  'completed': "bg-gray-100 text-gray-800 border-gray-200",
  'cancelled': "bg-red-100 text-red-800 border-red-200",
  'declined': "bg-orange-100 text-orange-800 border-orange-200",
};

const statusLabels = {
  'needs-response': 'Needs Response',
  'scheduled': 'Scheduled',
  'upcoming': 'Upcoming',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'declined': 'Declined',
};

export default function SessionList({ sessions, clients, onEdit, onDelete }) {
  const [syncingSessionId, setSyncingSessionId] = React.useState(null);
  const [selectedSession, setSelectedSession] = React.useState(null);

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.full_name || 'Unknown Client';
  };

  const getParticipantName = (session) => {
    if (session.client_id) {
      return getClientName(session.client_id);
    }
    if (session.participant_emails && session.participant_emails.length > 0) {
      return session.participant_emails[0];
    }
    return 'Unknown Participant';
  };

  const formatDate = (dateString, formatString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isValid(date) ? format(date, formatString) : 'Invalid Date';
  };

  const getSessionStatus = (session) => {
    const now = new Date();
    
    if (!session.date_time || !isValid(new Date(session.date_time))) {
      return 'scheduled';
    }
    
    const startTime = new Date(session.date_time);
    const endTime = new Date(startTime.getTime() + (session.duration || 30) * 60000);

    // Priority 1: Check if cancelled by organizer
    if (session.google_calendar_status === 'cancelled') {
      return 'cancelled';
    }

    // Priority 2: Check client response
    if (session.client_response_status === 'declined') {
      return 'declined';
    }

    if (session.client_response_status === 'needsAction') {
      return 'needs-response';
    }

    // Priority 3: Time-based statuses
    if (now < startTime) {
      // Check if this is the next upcoming session
      const futureSessions = sessions
        .filter(s => {
          if (!s.date_time || !isValid(new Date(s.date_time))) return false;
          const sTime = new Date(s.date_time);
          return sTime > now && 
                 s.google_calendar_status !== 'cancelled' &&
                 s.client_response_status !== 'declined' &&
                 s.client_response_status !== 'needsAction';
        })
        .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
      
      if (futureSessions[0]?.id === session.id) {
        return 'upcoming';
      }
      return 'scheduled';
    }

    if (now >= startTime && now < endTime) {
      return 'in-progress';
    }

    return 'completed';
  };

  const handleSyncStatus = async (sessionId, e) => {
    e.stopPropagation();
    setSyncingSessionId(sessionId);
    
    try {
      await base44.functions.invoke('syncGoogleCalendarStatus', { sessionId });
      window.location.reload();
    } catch (error) {
      console.error('Failed to sync status:', error);
      alert('Failed to sync status: ' + (error.message || 'Unknown error'));
    } finally {
      setSyncingSessionId(null);
    }
  };

  // Sort sessions by status priority
  const sortedSessions = [...sessions].sort((a, b) => {
    const statusA = getSessionStatus(a);
    const statusB = getSessionStatus(b);
    
    const statusPriority = {
      'in-progress': 1,
      'upcoming': 2,
      'needs-response': 3,
      'scheduled': 4,
      'completed': 5,
      'declined': 6,
      'cancelled': 7,
    };

    const priorityA = statusPriority[statusA] || 99;
    const priorityB = statusPriority[statusB] || 99;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Within same status, sort by date (handle invalid dates)
    const dateA = a.date_time && isValid(new Date(a.date_time)) ? new Date(a.date_time).getTime() : 0;
    const dateB = b.date_time && isValid(new Date(b.date_time)) ? new Date(b.date_time).getTime() : 0;
    return dateA - dateB;
  });

  const activeSessions = sortedSessions.filter(s => {
    const status = getSessionStatus(s);
    return ['in-progress', 'upcoming', 'needs-response', 'scheduled'].includes(status);
  });

  const pastSessions = sortedSessions.filter(s => {
    const status = getSessionStatus(s);
    return ['completed', 'declined', 'cancelled'].includes(status);
  });

  const renderSession = (session, index) => {
    const sessionStatus = getSessionStatus(session);
    
    return (
      <motion.div
        key={session.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 cursor-pointer hover:shadow-lg transition-all duration-200"
        onClick={() => setSelectedSession(session)}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900">{session.title}</h3>
              {session.preSessionNotes && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <StickyNote className="w-4 h-4 text-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm whitespace-pre-wrap">{session.preSessionNotes}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {getClientName(session.client_id)}
              </span>
              {session.date_time && (
                <>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(session.date_time, 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(session.date_time, 'h:mm a')} ({session.duration || 30} min)
                  </span>
                </>
              )}
            </div>
            {session.notes && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{session.notes}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
            <Badge variant="outline" className={statusColors[sessionStatus]}>
              {statusLabels[sessionStatus]}
            </Badge>
            {session.google_event_id && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => handleSyncStatus(session.id, e)}
                disabled={syncingSessionId === session.id}
                title="Sync status from Google Calendar"
              >
                <RefreshCw className={`w-4 h-4 ${syncingSessionId === session.id ? 'animate-spin' : ''}`} />
              </Button>
            )}
            {(session.meet_link || session.meet_join_link) && sessionStatus !== 'cancelled' && sessionStatus !== 'declined' && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(session.meet_link || session.meet_join_link, '_blank');
                }}
                className="bg-gradient-to-r from-blue-500 to-cyan-600"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Meeting
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(session);
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
              }}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {activeSessions.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Video className="w-5 h-5 text-blue-600" />
                Active Sessions ({activeSessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {activeSessions.map((session, index) => renderSession(session, index))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSessions.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12">
              <div className="text-center text-gray-500">
                <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No active sessions</p>
                <p className="text-sm">Click "Start a Session" to schedule your first meeting</p>
              </div>
            </CardContent>
          </Card>
        )}

        {pastSessions.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                Past Sessions ({pastSessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {pastSessions.map((session, index) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{session.title}</h4>
                          {session.preSessionNotes && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <StickyNote className="w-3 h-3 text-amber-500" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-sm whitespace-pre-wrap">{session.preSessionNotes}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                          <span>{getParticipantName(session)}</span>
                          <span>•</span>
                          <span>{formatDate(session.date_time, 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={statusColors[getSessionStatus(session)]}>
                          {statusLabels[getSessionStatus(session)]}
                        </Badge>
                        {session.google_event_id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSyncStatus(session.id, e);
                            }}
                            disabled={syncingSessionId === session.id}
                            title="Sync status from Google Calendar"
                          >
                            <RefreshCw className={`w-3 h-3 ${syncingSessionId === session.id ? 'animate-spin' : ''}`} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedSession && (
        <SessionDetail
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  );
}