import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  X, Mail, Route, StickyNote, Calendar, CheckCircle, Trash2, Loader2, User 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import EmailComposerModal from "./EmailComposerModal";

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

export default function TaskOptionsModal({ task, client: clientProp, onClose, onScheduleSession }) {
  const [isProcessing, setIsProcessing] = useState(null);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Resolve client ID - try task.client_id first, then fallback to session
  const { data: session } = useQuery({
    queryKey: ['session', task.session_id],
    queryFn: () => base44.entities.Session.get(task.session_id),
    enabled: !task.client_id && !!task.session_id
  });

  const resolvedClientId = task.client_id || session?.client_id;

  // Fetch full client record if not provided or incomplete
  const { data: fetchedClient } = useQuery({
    queryKey: ['client', resolvedClientId],
    queryFn: async () => {
      console.log('Fetching client with ID:', resolvedClientId);
      const clientData = await base44.entities.Client.get(resolvedClientId);
      console.log('Fetched client:', clientData);
      return clientData;
    },
    enabled: !!resolvedClientId && (!clientProp || !clientProp.email)
  });

  // Use fetched client if prop is missing email, otherwise use prop
  const client = (clientProp?.email) ? clientProp : (fetchedClient || clientProp);
  
  console.log('TaskOptionsModal - clientProp:', clientProp);
  console.log('TaskOptionsModal - fetchedClient:', fetchedClient);
  console.log('TaskOptionsModal - resolved client:', client);

  // Fetch client's active journey
  const { data: clientJourneys = [] } = useQuery({
    queryKey: ['client-journeys', resolvedClientId],
    queryFn: () => base44.entities.ClientJourney.filter({ 
      client_id: resolvedClientId,
      status: "Active"
    }),
    enabled: !!resolvedClientId
  });

  // Fetch client's upcoming sessions
  const { data: upcomingSessions = [] } = useQuery({
    queryKey: ['upcoming-sessions', resolvedClientId],
    queryFn: async () => {
      const sessions = await base44.entities.Session.filter({ 
        client_id: resolvedClientId 
      });
      const now = new Date();
      return sessions
        .filter(s => s.status === 'scheduled' && new Date(s.date_time) > now)
        .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
    },
    enabled: !!resolvedClientId
  });

  // Fetch journey steps to determine next order number
  const activeJourney = clientJourneys[0];
  const { data: journeySteps = [] } = useQuery({
    queryKey: ['journey-steps', activeJourney?.journey_id],
    queryFn: () => base44.entities.JourneyStep.filter({ 
      journey_id: activeJourney?.journey_id 
    }),
    enabled: !!activeJourney?.journey_id
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Action.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => base44.entities.Action.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      toast({ title: "Task deleted", duration: 2000 });
      onClose();
    }
  });

  const createJourneyStepMutation = useMutation({
    mutationFn: (data) => base44.entities.JourneyStep.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-steps'] });
    }
  });

  const createClientJourneyStepMutation = useMutation({
    mutationFn: (data) => base44.entities.ClientJourneyStep.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-journey-steps'] });
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Session.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-sessions'] });
    }
  });

  const handleSendToClient = () => {
    setShowEmailComposer(true);
  };

  const handleAddToJourney = async () => {
    if (!activeJourney) {
      toast({
        title: "No active journey",
        description: `${client?.full_name || 'This client'} doesn't have an active journey`,
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    setIsProcessing('journey');
    try {
      // Create a new JourneyStep
      const maxOrder = journeySteps.reduce((max, step) => Math.max(max, step.order_number || 0), 0);
      
      const newStep = await createJourneyStepMutation.mutateAsync({
        journey_id: activeJourney.journey_id,
        order_number: maxOrder + 1,
        title: task.title,
        description: task.description || '',
        step_type: 'Task',
        is_required: false,
        is_active: true
      });

      // Create ClientJourneyStep to track progress
      await createClientJourneyStepMutation.mutateAsync({
        client_journey_id: activeJourney.id,
        journey_step_id: newStep.id,
        status: 'Not Started'
      });

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
      setIsProcessing(null);
    }
  };

  const handleAddToSessionNotes = async () => {
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

    setIsProcessing('notes');
    try {
      const taskNote = `\n\n--- Task from AI Analysis ---\n${task.title}${task.description ? `\n${task.description}` : ''}`;
      const existingNotes = nextSession.preSessionNotes || '';
      
      await updateSessionMutation.mutateAsync({
        id: nextSession.id,
        data: {
          preSessionNotes: existingNotes + taskNote
        }
      });

      const sessionDate = format(new Date(nextSession.date_time), 'MMM d, yyyy');
      toast({
        title: `Added to session notes for ${sessionDate}`,
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
      setIsProcessing(null);
    }
  };

  const handleScheduleSession = () => {
    onScheduleSession({
      client_id: resolvedClientId,
      preSessionNotes: `${task.title}${task.description ? `\n\n${task.description}` : ''}`
    });
    onClose();
  };

  const handleMarkComplete = async () => {
    setIsProcessing('complete');
    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data: { status: 'Done' }
      });
      toast({ title: "Task marked as complete", duration: 2000 });
      onClose();
    } catch (error) {
      toast({
        title: "Failed to update task",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  const actionCards = [
    {
      id: 'email',
      icon: Mail,
      title: "Send to Client",
      description: "Email this task to the client asking them to take action",
      onClick: handleSendToClient,
      color: "blue"
    },
    {
      id: 'journey',
      icon: Route,
      title: "Add to Client's Journey",
      description: "Add this as a step in the client's active journey",
      onClick: handleAddToJourney,
      color: "purple"
    },
    {
      id: 'notes',
      icon: StickyNote,
      title: "Add to Next Session Notes",
      description: "Include this in notes for the client's next scheduled session",
      onClick: handleAddToSessionNotes,
      color: "amber"
    },
    {
      id: 'schedule',
      icon: Calendar,
      title: "Schedule Session",
      description: "Create a new session to discuss this with the client",
      onClick: handleScheduleSession,
      color: "emerald"
    }
  ];

  const colorClasses = {
    blue: "hover:bg-blue-50 hover:border-blue-300",
    purple: "hover:bg-purple-50 hover:border-purple-300",
    amber: "hover:bg-amber-50 hover:border-amber-300",
    emerald: "hover:bg-emerald-50 hover:border-emerald-300"
  };

  const iconColorClasses = {
    blue: "text-blue-600 bg-blue-100",
    purple: "text-purple-600 bg-purple-100",
    amber: "text-amber-600 bg-amber-100",
    emerald: "text-emerald-600 bg-emerald-100"
  };

  if (showEmailComposer) {
    return (
      <EmailComposerModal
        task={task}
        client={client}
        onClose={() => setShowEmailComposer(false)}
        onSuccess={() => {
          toast({ title: "Email sent successfully!", duration: 2000 });
          onClose();
        }}
      />
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{task.title}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-white/20 text-white border-0">
                    {actionTypeLabels[task.actionType] || task.actionType}
                  </Badge>
                  {client && (
                    <span className="flex items-center gap-1 text-sm text-white/90">
                      <User className="w-3 h-3" />
                      {client.full_name}
                    </span>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Action Options */}
          <div className="p-5 space-y-3">
            {actionCards.map((card) => (
              <button
                key={card.id}
                onClick={card.onClick}
                disabled={isProcessing === card.id}
                className={`w-full p-4 rounded-xl border-2 border-gray-200 text-left transition-all ${colorClasses[card.color]} disabled:opacity-50`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColorClasses[card.color]}`}>
                    {isProcessing === card.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <card.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{card.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{card.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex items-center justify-between gap-3 bg-gray-50">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkComplete}
                disabled={isProcessing === 'complete'}
                className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {isProcessing === 'complete' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Mark Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleteTaskMutation.isPending}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                {deleteTaskMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}