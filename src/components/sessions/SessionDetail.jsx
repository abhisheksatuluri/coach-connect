import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  X, Video, FileText, Sparkles, CheckCircle, Clock, 
  ExternalLink, AlertCircle, Target, AlertTriangle, HelpCircle,
  Download, Calendar, User, Mail, RefreshCw, CheckSquare, Loader2, StickyNote, Pin, Plus
} from "lucide-react";
import { format, isValid } from "date-fns";
import { motion } from "framer-motion";

import SessionArtifactsViewer from "./SessionArtifactsViewer";
import AIInsightsDisplay from "./AIInsightsDisplay";
import TranscriptReferencesView from "./TranscriptReferencesView";
import NotesSection from "@/components/notes/NotesSection";
import FilesSection from "@/components/files/FilesSection";
import { setNoteContextSession, clearNoteContext } from "@/components/notes/useNoteContext";

export default function SessionDetail({ session, onClose }) {
  const queryClient = useQueryClient();
  const [isBackfilling, setIsBackfilling] = React.useState(false);
  const [backfillResult, setBackfillResult] = React.useState(null);
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [aiInsights, setAiInsights] = React.useState(null);

  // Set note context and KB context when this session detail view is open
  useEffect(() => {
    if (session?.id) {
      setNoteContextSession(session.id, session.client_id);
      // Set global KB context
      window.__kbContext = { sessionId: session.id, clientId: session.client_id };
      window.dispatchEvent(new CustomEvent('kbContextChanged'));
    }
    return () => {
      clearNoteContext();
      // Clear global KB context
      window.__kbContext = {};
      window.dispatchEvent(new CustomEvent('kbContextChanged'));
    };
  }, [session?.id, session?.client_id]);

  const { data: tasks = [] } = useQuery({
    queryKey: ['session-tasks', session.id],
    queryFn: () => base44.entities.Task.filter({ session_id: session.id }),
  });

  const { data: client } = useQuery({
    queryKey: ['client', session.client_id],
    queryFn: () => session.client_id ? base44.entities.Client.get(session.client_id) : null,
    enabled: !!session.client_id,
  });

  const { data: contact } = useQuery({
    queryKey: ['contact', session.contact_id],
    queryFn: () => session.contact_id ? base44.entities.Contact.get(session.contact_id) : null,
    enabled: !!session.contact_id,
  });

  const { data: appliedReferences = [] } = useQuery({
    queryKey: ['applied-references', session.id],
    queryFn: () => base44.entities.AppliedReference.filter({ session_id: session.id })
  });

  const sortedReferences = [...appliedReferences].sort((a, b) => 
    (b.relevanceScore || 0) - (a.relevanceScore || 0)
  );

  const completeSessionMutation = useMutation({
    mutationFn: (id) => base44.entities.Session.update(id, { 
      status: 'completed',
      ended_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setIsCompleting(false);
      onClose();
    },
    onError: (error) => {
      console.error("Failed to complete session:", error);
      alert("Failed to complete session. Please try again.");
      setIsCompleting(false);
    }
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateSessionAnalysis', {
        session_id: session.id
      });
      
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to generate insights');
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      setAiInsights(data);
      alert('AI insights generated successfully!');
    },
    onError: (error) => {
      console.error("Failed to generate insights:", error);
      alert(`Failed to generate insights: ${error.message}`);
    }
  });

  let parsedSummary = null;
  if (session.summary) {
    try {
      parsedSummary = JSON.parse(session.summary);
    } catch (e) {
      console.error('Failed to parse summary:', e);
    }
  }

  const formatDate = (dateString, formatString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isValid(date) ? format(date, formatString) : 'Invalid Date';
  };

  const statusColors = {
    'scheduled': 'bg-blue-100 text-blue-800',
    'live': 'bg-green-100 text-green-800',
    'processing': 'bg-yellow-100 text-yellow-800',
    'summary_ready': 'bg-purple-100 text-purple-800',
    'failed': 'bg-red-100 text-red-800',
    'completed': 'bg-gray-100 text-gray-800',
  };

  const handleBackfill = async () => {
    setIsBackfilling(true);
    setBackfillResult(null);
    
    try {
      const { data } = await base44.functions.invoke('meet/backfillArtifacts', {
        sessionId: session.id
      });
      
      setBackfillResult({ success: true, ...data });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session-tasks', session.id] });
      queryClient.invalidateQueries({ queryKey: ['session', session.id] });
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setBackfillResult({ 
        success: false, 
        error: error.response?.data?.error || error.message 
      });
    } finally {
      setIsBackfilling(false);
    }
  };

  const handleCompleteSession = async () => {
    if (confirm('Mark this session as completed and move to Past Sessions?')) {
      setIsCompleting(true);
      completeSessionMutation.mutate(session.id);
    }
  };

  const showBackfillOption = session.meet_space_name && 
    (!session.recording_file_id || !session.transcript_doc_id || !session.gemini_notes_doc_id);

  const hasAnyArtifacts = session.recording_file_id || session.transcript_doc_id || session.gemini_notes_doc_id;
  const hasTranscriptOrNotes = session.transcript_doc_id || session.gemini_notes_doc_id;
  const canGenerateInsights = hasTranscriptOrNotes && 
    (session.status === 'summary_ready' || session.status === 'completed');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{session.title}</h2>
              <div className="flex flex-wrap gap-3 text-sm">
                {client && (
                  <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                    <User className="w-4 h-4" />
                    {client.full_name}
                  </span>
                )}
                {session.date_time && (
                  <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4" />
                    {formatDate(session.date_time, 'MMM d, yyyy h:mm a')}
                  </span>
                )}
                <Badge className={`${statusColors[session.status]} border-0`}>
                  {session.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
            {/* Pre-Session Notes */}
            {session.preSessionNotes && (
              <Card className="bg-amber-50 border-amber-300 border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                    <StickyNote className="w-5 h-5" />
                    Pre-Session Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800 whitespace-pre-wrap">{session.preSessionNotes}</p>
                </CardContent>
              </Card>
            )}

            {/* Manual Controls */}
          {(showBackfillOption || (session.status !== 'completed' && session.status !== 'cancelled') || canGenerateInsights) && (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  Manual Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {showBackfillOption && (
                  <div>
                    <p className="text-sm text-gray-700 mb-3">
                      If artifacts (recording, transcript, or Gemini Notes) exist in Google Drive but aren't showing here, click below to search and attach them.
                    </p>
                    <Button
                      onClick={handleBackfill}
                      disabled={isBackfilling}
                      variant="outline"
                      className="w-full"
                    >
                      {isBackfilling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Searching Drive...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Search & Attach Artifacts from Drive
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {session.status !== 'completed' && session.status !== 'cancelled' && (
                  <div>
                    <p className="text-sm text-gray-700 mb-3">
                      If the meeting has ended but the session is still showing as active, you can manually complete it.
                    </p>
                    <Button
                      onClick={handleCompleteSession}
                      disabled={isCompleting}
                      variant="outline"
                      className="w-full"
                    >
                      {isCompleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-4 h-4 mr-2" />
                          Mark Session as Completed
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {canGenerateInsights && (
                  <div>
                    <p className="text-sm text-gray-700 mb-3">
                      Generate AI-powered insights including knowledge base references, client recommendations, and coach actions.
                    </p>
                    <Button
                      onClick={() => generateInsightsMutation.mutate()}
                      disabled={generateInsightsMutation.isPending}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {generateInsightsMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating insights...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {aiInsights ? '🔄 Regenerate AI Insights' : '✨ Generate AI Insights'}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Insights Display */}
          {aiInsights && (
            <AIInsightsDisplay 
              insights={aiInsights} 
              sessionId={session.id} 
              clientId={session.client_id} 
            />
          )}
          
          {backfillResult && (
            <Alert className={backfillResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              <AlertDescription className={backfillResult.success ? "text-green-800" : "text-red-800"}>
                {backfillResult.success ? (
                  <div>
                    <p className="font-semibold mb-2">✓ Backfill Complete!</p>
                    {backfillResult.foundArtifacts ? (
                      <ul className="text-sm space-y-1">
                        {backfillResult.updates.recording_file_id && <li>• Found recording</li>}
                        {backfillResult.updates.transcript_doc_id && <li>• Found transcript</li>}
                        {backfillResult.updates.gemini_notes_doc_id && <li>• Found Gemini Notes</li>}
                        {backfillResult.updates.summary_generated && <li>• Generated AI summary</li>}
                      </ul>
                    ) : (
                      <p className="text-sm">No new artifacts found in Drive.</p>
                    )}
                    <p className="text-sm mt-2">Page will reload in 2 seconds...</p>
                  </div>
                ) : (
                  <p>✗ Error: {backfillResult.error}</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {!session.recording_file_id && !session.transcript_doc_id && session.meet_space_name && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800 text-sm">
                <p className="font-semibold mb-2">⚠️ First time using Meet webhooks?</p>
                <p>Make sure webhook subscription is active by running the <code className="bg-blue-100 px-1 rounded">meet/subscribeWebhook</code> function once from Dashboard → Code → Functions.</p>
                <p className="mt-2">After subscription, artifacts (recording, transcript, notes) will automatically attach to future sessions.</p>
              </AlertDescription>
            </Alert>
          )}

          {(session.meet_link || session.meet_join_link) && (
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Meeting Link</p>
                      <p className="text-sm text-gray-600">Join or share this link</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.open(session.meet_link || session.meet_join_link, '_blank')}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Meet
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {session.coach_email && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  Session Hosts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Host</p>
                    <p className="font-medium">{session.meet_space_name ? 'hello@mindsaimedia.com' : session.coach_email}</p>
                  </div>
                </div>
                {session.coach_email && session.meet_space_name && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Co-host</p>
                      <p className="font-medium">{session.coach_email}</p>
                    </div>
                    {session.cohost_granted === false && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-800">
                        Requires Google Account
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TRANSCRIPT & REFERENCES SIDE-BY-SIDE */}
          {hasTranscriptOrNotes ? (
            <TranscriptReferencesView sessionId={session.id} />
          ) : (
            /* SESSION ARTIFACTS VIEWER - Only show when not using side-by-side view */
            hasAnyArtifacts && (
              <SessionArtifactsViewer sessionId={session.id} />
            )
          )}

          {/* AI Summary */}
          {parsedSummary && (
            <>
              {/* Summary Bullets */}
              {parsedSummary.summary_bullets?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Session Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {parsedSummary.summary_bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Client Goals */}
              {parsedSummary.client_goals?.length > 0 && (
                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-emerald-600" />
                      Health Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {parsedSummary.client_goals.map((goal, i) => (
                        <li key={i} className="flex items-start gap-2 p-2 bg-emerald-50 rounded-lg">
                          <Target className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Decisions */}
              {parsedSummary.decisions?.length > 0 && (
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      Key Decisions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {parsedSummary.decisions.map((decision, i) => (
                        <li key={i} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{decision}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Risks */}
              {parsedSummary.risks?.length > 0 && (
                <Card className="border-red-200 bg-red-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Health Concerns & Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {parsedSummary.risks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-2 p-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Unanswered Questions */}
              {parsedSummary.unanswered_questions?.length > 0 && (
                <Card className="border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-amber-600" />
                      Follow-up Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {parsedSummary.unanswered_questions.map((question, i) => (
                        <li key={i} className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                          <HelpCircle className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{question}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Tasks */}
          {tasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Action Items ({tasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border-2 ${
                        task.status === 'done'
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-orange-50 border-orange-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <Badge
                          className={
                            task.status === 'done'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        {task.assignee && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {task.assignee}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(task.due_date, 'MMM d, yyyy')}
                          </span>
                        )}
                        {task.confidence && (
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {Math.round(task.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                      {task.source_timestamp && (
                        <p className="text-xs text-gray-500 mt-2">
                          From: {task.source_timestamp}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Notes */}
          {session.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{session.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Notes Section */}
          <NotesSection 
            linkedSession={session.id} 
            linkedClient={session.client_id} 
          />

          {/* Files Section */}
          <FilesSection 
            linkedSession={session.id} 
            linkedClient={session.client_id} 
          />

          {/* No Data Yet */}
          {!parsedSummary && !hasAnyArtifacts && tasks.length === 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Processing Session Data</h3>
                <p className="text-gray-600 text-sm">
                  {session.status === 'live'
                    ? 'Session is currently in progress. Recording and transcription will be available after the meeting ends.'
                    : session.status === 'processing'
                    ? 'Processing recording and transcript. This may take 5-15 minutes.'
                    : 'Session artifacts will appear here once available.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}