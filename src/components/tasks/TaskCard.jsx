import React, { useState } from "react";
import api from "@/api/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, Calendar, Mail, Route, StickyNote, Video,
  MessageSquareQuote, Lightbulb, User, ExternalLink, MoreVertical,
  CheckCircle, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isValid } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

const actionTypeLabels = {
  follow_up: "Follow Up",
  resource_sharing: "Resource Sharing",
  scheduling: "Scheduling",
  documentation: "Documentation",
  planning: "Planning",
  research: "Research",
  coordination: "Coordination",
  review: "Review",
  intervention_setup: "Intervention Setup",
  check_in: "Check In"
};

const actionTypeBorderColors = {
  follow_up: "border-l-blue-500",
  resource_sharing: "border-l-green-500",
  scheduling: "border-l-purple-500",
  documentation: "border-l-gray-500",
  planning: "border-l-teal-500",
  research: "border-l-orange-500",
  coordination: "border-l-pink-500",
  review: "border-l-yellow-500",
  intervention_setup: "border-l-red-500",
  check_in: "border-l-lime-500"
};

export default function TaskCard({ 
  task, 
  client, 
  session,
  onToggleComplete,
  onOpenOptions,
  onOpenEmailComposer,
  onScheduleSession,
  index = 0
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);
  const isCompleted = task.status === 'Done';
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch client's active journey
  const { data: clientJourneys = [] } = useQuery({
    queryKey: ['client-journeys', task.client_id],
    queryFn: () => api.entities.ClientJourney.filter({ 
      client_id: task.client_id,
      status: "Active"
    }),
    enabled: !!task.client_id && isHovered
  });

  // Fetch journey steps for order number
  const activeJourney = clientJourneys[0];
  const { data: journeySteps = [] } = useQuery({
    queryKey: ['journey-steps', activeJourney?.journey_id],
    queryFn: () => api.entities.JourneyStep.filter({ 
      journey_id: activeJourney?.journey_id 
    }),
    enabled: !!activeJourney?.journey_id
  });

  // Fetch client's upcoming sessions
  const { data: upcomingSessions = [] } = useQuery({
    queryKey: ['upcoming-sessions', task.client_id],
    queryFn: async () => {
      const sessions = await api.entities.Session.filter({ 
        client_id: task.client_id 
      });
      const now = new Date();
      return sessions
        .filter(s => s.status === 'scheduled' && new Date(s.date_time) > now)
        .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
    },
    enabled: !!task.client_id && isHovered
  });

  const handleAddToJourney = async (e) => {
    e.stopPropagation();
    if (!activeJourney) {
      toast({
        title: "No active journey",
        description: `${client?.full_name || 'This client'} doesn't have an active journey`,
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    setProcessingAction('journey');
    try {
      const maxOrder = journeySteps.reduce((max, step) => Math.max(max, step.order_number || 0), 0);
      
      const newStep = await api.entities.JourneyStep.create({
        journey_id: activeJourney.journey_id,
        order_number: maxOrder + 1,
        title: task.title,
        description: task.description || '',
        step_type: 'Task',
        is_required: false,
        is_active: true
      });

      await api.entities.ClientJourneyStep.create({
        client_journey_id: activeJourney.id,
        journey_step_id: newStep.id,
        status: 'Not Started'
      });

      queryClient.invalidateQueries({ queryKey: ['journey-steps'] });
      toast({
        title: `Added to ${client?.full_name}'s journey`,
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Failed to add to journey",
        description: error.message,
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleAddToSessionNotes = async (e) => {
    e.stopPropagation();
    const nextSession = upcomingSessions[0];
    
    if (!nextSession) {
      toast({
        title: "No upcoming session",
        description: `No upcoming session scheduled for ${client?.full_name || 'this client'}`,
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    setProcessingAction('notes');
    try {
      const taskNote = `\n\n--- Task from AI Analysis ---\n${task.title}${task.description ? `\n${task.description}` : ''}`;
      const existingNotes = nextSession.preSessionNotes || '';
      
      await api.entities.Session.update(nextSession.id, {
        preSessionNotes: existingNotes + taskNote
      });

      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-sessions'] });
      
      const sessionDate = format(new Date(nextSession.date_time), 'MMM d, yyyy');
      toast({
        title: `Added to session notes`,
        description: `Session on ${sessionDate}`,
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Failed to add to session notes",
        description: error.message,
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleScheduleSession = (e) => {
    e.stopPropagation();
    onScheduleSession({
      client_id: task.client_id,
      preSessionNotes: `${task.title}${task.description ? `\n\n${task.description}` : ''}`
    });
  };

  const handleSendEmail = async (e) => {
    e.stopPropagation();
    // Fetch full client to ensure we have email
    let fullClient = client;
    if (!client?.email) {
      const clientId = task.client_id || session?.client_id;
      if (clientId) {
        try {
          fullClient = await api.entities.Client.get(clientId);
          console.log('Fetched client for email:', fullClient);
        } catch (err) {
          console.error('Failed to fetch client:', err);
        }
      }
    }
    onOpenEmailComposer(task, fullClient);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : null;
  };

  const getDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = today - due;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const borderColor = actionTypeBorderColors[task.actionType] || "border-l-gray-400";
  const daysOverdue = getDaysOverdue(task.dueDate);

  const handleCardClick = (e) => {
    // Don't trigger if clicking on interactive elements
    if (e.target.closest('a') || e.target.closest('button')) {
      return;
    }
    onOpenOptions(task);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.03 }}
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      className={`
        rounded-lg border border-l-4 ${borderColor}
        shadow-sm transition-all duration-200 cursor-pointer
        ${isCompleted ? 'bg-gray-50 opacity-70' : 'bg-white'}
        ${isHovered && !isCompleted ? 'shadow-lg' : 'hover:shadow-md'}
        overflow-hidden
      `}
    >
      {/* Default State - Always Visible */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`font-semibold text-sm leading-tight ${
                isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}>
                {task.title}
              </h4>
              {task.sentToClient && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        <Mail className="w-3 h-3" />
                        Sent
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sent to client on {task.sentToClientAt ? formatDate(task.sentToClientAt) : 'unknown date'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className={`text-xs mt-1 ${isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
              {actionTypeLabels[task.actionType] || task.actionType}
              {task.priority && !isCompleted && (
                <>
                  <span className="mx-1">•</span>
                  <span className={task.priority === 'High' ? 'text-red-600 font-medium' : ''}>
                    {task.priority}
                  </span>
                </>
              )}
              {task.dueDate && !isCompleted && (
                <>
                  <span className="mx-1">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(task.dueDate)}
                    {daysOverdue > 0 && (
                      <span className="text-red-600 font-medium">({daysOverdue}d overdue)</span>
                    )}
                  </span>
                </>
              )}
            </p>
            <Link
              to={`${createPageUrl('Sessions')}?sessionId=${task.session_id}`}
              onClick={(e) => e.stopPropagation()}
              className={`text-xs hover:underline mt-1 inline-block ${
                isCompleted ? 'text-gray-400 hover:text-gray-600' : 'text-blue-500 hover:text-blue-700'
              }`}
            >
              From: {session?.title || 'Unknown Session'}
              {session?.date_time && ` • ${formatDate(session.date_time)}`}
            </Link>
            {isCompleted && task.updated_date && (
              <p className="text-xs text-gray-400 mt-1">
                Completed on {formatDate(task.updated_date)}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task, !isCompleted);
            }}
            className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${
              isCompleted
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-gray-300 hover:border-emerald-500'
            }`}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted && <Check className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded State - On Hover (only for non-completed) */}
      <AnimatePresence>
        {isHovered && !isCompleted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="border-t border-gray-100"
          >
            <div className="p-3 space-y-3 bg-gray-50/50">
              {/* Description / Why this task */}
              {task.description && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-medium text-gray-600">Why this task?</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Source Context / Based on */}
              <div className="bg-blue-50 rounded-lg p-2.5 border-l-4 border-blue-300">
                <div className="flex items-center gap-1.5 mb-1">
                  <MessageSquareQuote className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-medium text-blue-700">Based on</span>
                </div>
                {task.sourceContext ? (
                  <>
                    <p className="text-sm text-blue-800 italic">
                      "{task.sourceContext}"
                    </p>
                    <p className="text-xs text-blue-600 mt-1">— Client, during session</p>
                  </>
                ) : (
                  <Link
                    to={`${createPageUrl('Sessions')}?sessionId=${task.session_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View session for full context →
                  </Link>
                )}
              </div>

              {/* Client Info */}
              {client && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                    {client.profile_image ? (
                      <img 
                        src={client.profile_image} 
                        alt={client.full_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs font-medium">
                        {client.full_name?.[0]?.toUpperCase() || 'C'}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`${createPageUrl('Clients')}?clientId=${client.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-gray-700 hover:text-emerald-600 hover:underline"
                  >
                    {client.full_name}
                  </Link>
                </div>
              )}

              {/* Sent to Client Status */}
              {task.sentToClient && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-md w-fit">
                  <Mail className="w-3.5 h-3.5" />
                  <span>✓ Sent to client on {formatDate(task.sentToClientAt)}</span>
                </div>
              )}

              {/* Quick Action Icon Buttons */}
              <TooltipProvider delayDuration={200}>
                <div className="flex items-center gap-1 pt-1">
                  {/* Email */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleSendEmail}
                        disabled={processingAction === 'email'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          task.sentToClient 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : 'hover:bg-blue-100 text-gray-500 hover:text-blue-600'
                        }`}
                      >
                        {task.sentToClient ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {task.sentToClient 
                        ? `Sent on ${formatDate(task.sentToClientAt)}`
                        : 'Send to Client'
                      }
                    </TooltipContent>
                  </Tooltip>

                  {/* Journey */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleAddToJourney}
                        disabled={processingAction === 'journey'}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-purple-100 text-gray-500 hover:text-purple-600 transition-all disabled:opacity-50"
                      >
                        {processingAction === 'journey' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Route className="w-4 h-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Add to Journey</TooltipContent>
                  </Tooltip>

                  {/* Session Notes */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleAddToSessionNotes}
                        disabled={processingAction === 'notes'}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-amber-100 text-gray-500 hover:text-amber-600 transition-all disabled:opacity-50"
                      >
                        {processingAction === 'notes' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <StickyNote className="w-4 h-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Add to Next Session</TooltipContent>
                  </Tooltip>

                  {/* Schedule Session */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleScheduleSession}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-100 text-gray-500 hover:text-emerald-600 transition-all"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Schedule Session</TooltipContent>
                  </Tooltip>

                  <div className="w-px h-5 bg-gray-200 mx-1" />

                  {/* More Options */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenOptions(task);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>More Options</TooltipContent>
                  </Tooltip>

                  {/* View Session Link */}
                  <Link
                    to={`${createPageUrl('Sessions')}?sessionId=${task.session_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="ml-auto"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>View Session</TooltipContent>
                    </Tooltip>
                  </Link>
                </div>
              </TooltipProvider>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}