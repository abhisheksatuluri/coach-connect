import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Calendar, User, Sparkles, Plus, Check, Circle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { format, isValid } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import TaskOptionsModal from "@/components/tasks/TaskOptionsModal";
import SessionForm from "@/components/sessions/SessionForm";
import RecommendedActionCard from "@/components/tasks/RecommendedActionCard";
import TaskCard from "@/components/tasks/TaskCard";
import PractitionerSelectionModal from "@/components/tasks/PractitionerSelectionModal";

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

export default function TasksPage() {
  // Left column filters (Recommended Actions)
  const [leftClientFilter, setLeftClientFilter] = useState("all");
  const [leftTypeFilter, setLeftTypeFilter] = useState("all");
  
  // Right column filters (Tasks)
  const [rightObjectTypeFilter, setRightObjectTypeFilter] = useState("all"); // all, personal, client, session, journey
  const [rightSpecificObjectFilter, setRightSpecificObjectFilter] = useState("all");
  const [rightTypeFilter, setRightTypeFilter] = useState("all");
  
  const [showCompleted, setShowCompleted] = useState(false);
  const [showDismissed, setShowDismissed] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionFormPrefill, setSessionFormPrefill] = useState(null);
  const [practitionerModalAction, setPractitionerModalAction] = useState(null);
  const [resendingActionId, setResendingActionId] = useState(null);
  const [cancellingActionId, setCancellingActionId] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: actions = [], isLoading } = useQuery({
    queryKey: ['actions'],
    queryFn: () => base44.entities.Action.list('-createdAt'),
  });

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date'),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: journeys = [] } = useQuery({
    queryKey: ['journeys'],
    queryFn: () => base44.entities.Journey.list(),
  });

  const { data: clientJourneys = [] } = useQuery({
    queryKey: ['client-journeys'],
    queryFn: () => base44.entities.ClientJourney.list(),
  });

  // Fetch approval requests for pending/rejected actions
  const { data: approvalRequests = [] } = useQuery({
    queryKey: ['approval-requests'],
    queryFn: () => base44.entities.ApprovalRequest.list('-requestedAt'),
  });

  // Fetch practitioners for displaying who the request was sent to
  const { data: practitioners = [] } = useQuery({
    queryKey: ['practitioners'],
    queryFn: () => base44.entities.Practitioner.list(),
  });

  // Helper to get the latest approval request for an action
  const getApprovalRequestForAction = (actionId) => {
    return approvalRequests
      .filter(ar => ar.action_id === actionId)
      .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))[0];
  };

  // Helper to get practitioner for an approval request
  const getPractitionerForRequest = (approvalRequest) => {
    if (!approvalRequest) return null;
    return practitioners.find(p => p.id === approvalRequest.practitioner_id);
  };

  const updateActionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Action.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
    },
  });

  // Resolve client for an action - try action.client_id first, then fallback to session.client_id
  const resolveClientForAction = (action) => {
    // First try direct client_id on action
    if (action.client_id) {
      const client = clients.find(c => c.id === action.client_id);
      if (client) return client;
    }
    
    // Fallback: get client from the linked session
    const session = sessions.find(s => s.id === action.session_id);
    if (session?.client_id) {
      const client = clients.find(c => c.id === session.client_id);
      if (client) return client;
    }
    
    return null;
  };

  const getClientName = (action) => {
    const client = resolveClientForAction(action);
    return client?.full_name || 'Unknown Client';
  };

  const getSessionInfo = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return { title: 'Unknown Session', date: null };
    return {
      title: session.title,
      date: session.date_time
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : null;
  };

  // Group actions by client (using resolved client name)
  const groupByClient = (actionsList) => {
    const grouped = {};
    actionsList.forEach(action => {
      const clientName = getClientName(action);
      if (!grouped[clientName]) {
        grouped[clientName] = [];
      }
      grouped[clientName].push(action);
    });
    return grouped;
  };

  // Filter recommended actions (isApplied = false)
  const recommendedActions = actions
    .filter(a => !a.isApplied)
    .filter(a => showDismissed ? true : !a.isDismissed)
    .filter(a => leftClientFilter === "all" || a.client_id === leftClientFilter)
    .filter(a => leftTypeFilter === "all" || a.actionType === leftTypeFilter);
  
  const dismissedCount = actions.filter(a => !a.isApplied && a.isDismissed).length;

  // Get recent sessions for filter (last 30 days or last 20 sessions)
  const recentSessions = React.useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return sessions
      .filter(s => !s.date_time || new Date(s.date_time) >= thirtyDaysAgo)
      .slice(0, 20)
      .sort((a, b) => new Date(b.date_time || 0) - new Date(a.date_time || 0));
  }, [sessions]);

  // Filter tasks based on dropdown filters
  const filteredTasks = tasks
    // Filter by object type (first dropdown)
    .filter(t => {
      if (rightObjectTypeFilter === "all") return true;
      if (rightObjectTypeFilter === "personal") {
        return t.taskContext === "personal" || (!t.client_id && !t.session_id && !t.journey_id);
      }
      if (rightObjectTypeFilter === "client") {
        return t.taskContext === "client" || !!t.client_id;
      }
      if (rightObjectTypeFilter === "session") {
        return t.taskContext === "session" || !!t.session_id;
      }
      if (rightObjectTypeFilter === "journey") {
        return t.taskContext === "journey" || !!t.journey_id;
      }
      return true;
    })
    // Filter by specific object (second dropdown)
    .filter(t => {
      if (rightSpecificObjectFilter === "all") return true;
      if (rightObjectTypeFilter === "client") {
        return t.client_id === rightSpecificObjectFilter;
      }
      if (rightObjectTypeFilter === "session") {
        return t.session_id === rightSpecificObjectFilter;
      }
      if (rightObjectTypeFilter === "journey") {
        return t.journey_id === rightSpecificObjectFilter;
      }
      return true;
    })
    // Filter by task type (third dropdown)
    .filter(t => rightTypeFilter === "all" || t.actionType === rightTypeFilter)
    // Filter by completion status
    .filter(t => showCompleted || t.status !== 'done')
    // Sort: incomplete first, then by due date (nulls last), then by created date
    .sort((a, b) => {
      // Incomplete tasks first
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      
      // Then by due date (nulls last)
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;
      if (a.due_date && b.due_date) {
        const dateCompare = new Date(a.due_date) - new Date(b.due_date);
        if (dateCompare !== 0) return dateCompare;
      }
      
      // Finally by created date descending
      return new Date(b.created_date) - new Date(a.created_date);
    });

  // Filter applied actions (isApplied = true) for left column
  const appliedActions = actions.filter(a => a.isApplied);

  const groupedRecommended = groupByClient(recommendedActions);
  
  // Get context info for a task
  const getTaskContext = (task) => {
    if (task.session_id) {
      const session = sessions.find(s => s.id === task.session_id);
      const client = session?.client_id ? clients.find(c => c.id === session.client_id) : null;
      return {
        type: 'session',
        label: session?.title || 'Unknown Session',
        sublabel: client?.full_name
      };
    }
    if (task.journey_id) {
      const clientJourney = clientJourneys.find(cj => cj.id === task.journey_id);
      const journey = clientJourney ? journeys.find(j => j.id === clientJourney.journey_id) : null;
      const client = clientJourney?.client_id ? clients.find(c => c.id === clientJourney.client_id) : null;
      return {
        type: 'journey',
        label: journey?.title || 'Unknown Journey',
        sublabel: client?.full_name
      };
    }
    if (task.client_id) {
      const client = clients.find(c => c.id === task.client_id);
      return {
        type: 'client',
        label: client?.full_name || 'Unknown Client',
        sublabel: null
      };
    }
    return {
      type: 'personal',
      label: 'Personal',
      sublabel: null
    };
  };

  const handleAcceptAction = (action) => {
    // If action requires approval, open the practitioner selection modal instead
    if (action.requiresApproval === true) {
      setPractitionerModalAction(action);
      return;
    }
    
    // Otherwise, accept directly
    updateActionMutation.mutate({
      id: action.id,
      data: {
        isApplied: true,
        appliedAt: new Date().toISOString()
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Action added to Tasks",
          duration: 2000,
        });
      }
    });
  };

  const handleDismissAction = (action) => {
    updateActionMutation.mutate({
      id: action.id,
      data: {
        isDismissed: true,
        dismissedAt: new Date().toISOString()
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Action dismissed",
          duration: 2000,
        });
      }
    });
  };

  const handleRestoreAction = (action) => {
    updateActionMutation.mutate({
      id: action.id,
      data: {
        isDismissed: false,
        dismissedAt: null
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Action restored",
          duration: 2000,
        });
      }
    });
  };

  // Handle resending approval request
  const handleResendApproval = async (action, approvalRequest) => {
    if (!approvalRequest) return;
    
    setResendingActionId(action.id);
    try {
      await base44.functions.invoke('sendApprovalRequestEmail', {
        actionId: action.id,
        practitionerId: approvalRequest.practitioner_id
      });
      
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      toast({
        title: "Approval request resent",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Failed to resend request",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setResendingActionId(null);
    }
  };

  // Handle cancelling approval request
  const handleCancelApproval = async (action, approvalRequest) => {
    if (!approvalRequest) return;
    
    setCancellingActionId(action.id);
    try {
      // Update approval request status to cancelled
      await base44.entities.ApprovalRequest.update(approvalRequest.id, {
        status: 'Rejected',
        responseNotes: 'Cancelled by coach'
      });
      
      // Reset action approval status
      await base44.entities.Action.update(action.id, {
        approvalStatus: 'Not Required'
      });
      
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      
      toast({
        title: "Approval request cancelled",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Failed to cancel request",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setCancellingActionId(null);
    }
  };

  // Handle requesting approval from a different practitioner
  const handleRequestNewApproval = (action) => {
    setPractitionerModalAction(action);
  };

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleToggleComplete = (task, markAsDone) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: {
        status: markAsDone ? 'done' : 'open'
      }
    }, {
      onSuccess: () => {
        if (markAsDone) {
          toast({ title: "Task completed", duration: 2000 });
        }
      }
    });
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

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage AI-generated actions and tasks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN - Recommended Actions */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg flex flex-col h-[calc(100vh-200px)]">
            <CardHeader className="border-b border-purple-100 flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Recommended Actions ({recommendedActions.length})
              </CardTitle>
              <div className="flex gap-2 mt-3">
                <Select value={leftClientFilter} onValueChange={setLeftClientFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={leftTypeFilter} onValueChange={setLeftTypeFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(actionTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1">
              {Object.keys(groupedRecommended).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedRecommended).map(([clientName, clientActions]) => (
                    <div key={clientName}>
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-gray-500" />
                        <h3 className="font-semibold text-gray-700">{clientName}</h3>
                        <Badge variant="outline" className="text-xs">{clientActions.length}</Badge>
                      </div>
                      <AnimatePresence mode="popLayout">
                        <div className="space-y-2">
                          {clientActions.map((action, index) => {
                            const session = sessions.find(s => s.id === action.session_id);
                            const client = resolveClientForAction(action);
                            const approvalRequest = getApprovalRequestForAction(action.id);
                            const practitioner = getPractitionerForRequest(approvalRequest);
                            return (
                              <RecommendedActionCard
                                key={action.id}
                                action={action}
                                client={client}
                                session={session}
                                approvalRequest={approvalRequest}
                                practitioner={practitioner}
                                onAccept={handleAcceptAction}
                                onDismiss={handleDismissAction}
                                onRestore={handleRestoreAction}
                                onResendApproval={handleResendApproval}
                                onCancelApproval={handleCancelApproval}
                                onRequestNewApproval={handleRequestNewApproval}
                                isResending={resendingActionId === action.id}
                                isCancelling={cancellingActionId === action.id}
                                index={index}
                              />
                            );
                          })}
                        </div>
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recommended actions</p>
                  <p className="text-sm text-gray-400">Generate analysis from session transcripts</p>
                </div>
              )}
              
              {/* Show Dismissed Toggle */}
              {dismissedCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
                  <Switch
                    id="show-dismissed"
                    checked={showDismissed}
                    onCheckedChange={setShowDismissed}
                  />
                  <Label htmlFor="show-dismissed" className="text-sm text-gray-600 cursor-pointer">
                    Show dismissed ({dismissedCount})
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* RIGHT COLUMN - Tasks */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg flex flex-col h-[calc(100vh-200px)]">
            <CardHeader className="border-b border-emerald-100 flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Tasks ({filteredTasks.length})
              </CardTitle>
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex gap-2">
                  {/* First dropdown - Object Type */}
                  <Select 
                    value={rightObjectTypeFilter} 
                    onValueChange={(value) => {
                      setRightObjectTypeFilter(value);
                      setRightSpecificObjectFilter("all");
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="All Tasks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="personal">Personal Tasks</SelectItem>
                      <SelectItem value="client">Client Tasks</SelectItem>
                      <SelectItem value="session">Session Tasks</SelectItem>
                      <SelectItem value="journey">Journey Tasks</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Second dropdown - Specific Object (dynamic) */}
                  {rightObjectTypeFilter === "client" && (
                    <Select value={rightSpecificObjectFilter} onValueChange={setRightSpecificObjectFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="All Clients" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Clients</SelectItem>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {rightObjectTypeFilter === "session" && (
                    <Select value={rightSpecificObjectFilter} onValueChange={setRightSpecificObjectFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="All Sessions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sessions</SelectItem>
                        {recentSessions.map(session => (
                          <SelectItem key={session.id} value={session.id}>
                            {session.title} {session.date_time && `(${format(new Date(session.date_time), 'MMM d')})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {rightObjectTypeFilter === "journey" && (
                    <Select value={rightSpecificObjectFilter} onValueChange={setRightSpecificObjectFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="All Journeys" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Journeys</SelectItem>
                        {journeys.map(journey => (
                          <SelectItem key={journey.id} value={journey.id}>
                            {journey.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Third dropdown - Task Type */}
                <Select value={rightTypeFilter} onValueChange={setRightTypeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(actionTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Switch
                  id="show-completed"
                  checked={showCompleted}
                  onCheckedChange={setShowCompleted}
                />
                <Label htmlFor="show-completed" className="text-sm text-gray-600 cursor-pointer">
                  Show completed
                </Label>
              </div>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto flex-1">
              {filteredTasks.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.map((task, index) => {
                      const context = getTaskContext(task);
                      const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
                      
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.02 }}
                          className={`p-4 rounded-lg border bg-white hover:shadow-md transition-shadow ${
                            task.status === 'done' ? 'opacity-60' : ''
                          } ${isOverdue ? 'border-red-300 bg-red-50/50' : 'border-gray-200'}`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleComplete(task, task.status !== 'done')}
                              className="mt-1 flex-shrink-0"
                            >
                              {task.status === 'done' ? (
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400 hover:text-emerald-600" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className={`font-semibold text-gray-900 ${task.status === 'done' ? 'line-through' : ''}`}>
                                  {task.title}
                                </h3>
                                {task.priority && (
                                  <Badge 
                                    variant={task.priority === 'high' ? 'destructive' : 'outline'}
                                    className="text-xs"
                                  >
                                    {task.priority}
                                  </Badge>
                                )}
                              </div>
                              
                              {task.description && (
                                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                {/* Context indicator */}
                                <Badge variant="outline" className="bg-blue-50">
                                  {context.label}
                                </Badge>
                                {context.sublabel && (
                                  <span className="text-gray-500">• {context.sublabel}</span>
                                )}
                                
                                {task.assignee && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {task.assignee}
                                  </span>
                                )}
                                
                                {task.due_date && (
                                  <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(task.due_date), 'MMM d, yyyy')}
                                    {isOverdue && ' (Overdue)'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tasks found</p>
                  <p className="text-sm text-gray-400">Try adjusting your filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Task Options Modal */}
        {selectedTask && (
          <TaskOptionsModal
            task={selectedTask}
            client={selectedTask._resolvedClient || resolveClientForAction(selectedTask)}
            onClose={() => setSelectedTask(null)}
            onScheduleSession={(prefill) => {
              setSessionFormPrefill(prefill);
              setShowSessionForm(true);
            }}
          />
        )}

        {/* Practitioner Selection Modal */}
        {practitionerModalAction && (
          <PractitionerSelectionModal
            action={practitionerModalAction}
            onClose={() => setPractitionerModalAction(null)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['actions'] });
              queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
            }}
          />
        )}

        {/* Session Form Modal */}
        {showSessionForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <SessionForm
                clients={clients}
                initialData={sessionFormPrefill}
                onSubmit={() => {
                  setShowSessionForm(false);
                  setSessionFormPrefill(null);
                  toast({ title: "Session scheduled", duration: 2000 });
                }}
                onCancel={() => {
                  setShowSessionForm(false);
                  setSessionFormPrefill(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}