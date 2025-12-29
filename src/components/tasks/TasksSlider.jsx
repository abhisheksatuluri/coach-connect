import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Save, Loader2, CheckSquare, Plus, Edit2, Trash2, Calendar, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TasksSlider({ isOpen, onClose, currentPageName }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [objectType, setObjectType] = useState(null);
  const [objectId, setObjectId] = useState(null);
  const [contextLabel, setContextLabel] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [contextVersion, setContextVersion] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("open");
  const [actionType, setActionType] = useState("follow_up");

  // Detail view state (for editing in detail panel)
  const [detailTitle, setDetailTitle] = useState("");
  const [detailDescription, setDetailDescription] = useState("");
  const [detailDueDate, setDetailDueDate] = useState("");
  const [detailPriority, setDetailPriority] = useState("medium");
  const [detailStatus, setDetailStatus] = useState("open");

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
    enabled: isOpen
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
    enabled: isOpen
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list(),
    enabled: isOpen
  });

  const { data: journeys = [] } = useQuery({
    queryKey: ['journeys'],
    queryFn: () => base44.entities.Journey.list(),
    enabled: isOpen
  });

  const { data: clientJourneys = [] } = useQuery({
    queryKey: ['client-journeys'],
    queryFn: () => base44.entities.ClientJourney.list(),
    enabled: isOpen
  });

  const { data: allTasks = [], isLoading } = useQuery({
    queryKey: ['tasks-slider', currentUser?.email, objectType, objectId],
    queryFn: async () => {
      if (!objectType || objectType === 'personal') {
        // Get personal tasks (no context links)
        const allUserTasks = await base44.entities.Task.list('-created_date', 200);
        return allUserTasks.filter(task => 
          task.created_by === currentUser?.email &&
          !task.client_id && !task.session_id && !task.journey_id
        );
      } else if (objectType === 'client') {
        return await base44.entities.Task.filter({ client_id: objectId });
      } else if (objectType === 'session') {
        return await base44.entities.Task.filter({ session_id: objectId });
      } else if (objectType === 'journey') {
        return await base44.entities.Task.filter({ journey_id: objectId });
      }
      return [];
    },
    enabled: isOpen && !!currentUser
  });

  // Sort tasks: incomplete first, then by due date, then by created_at
  const tasks = React.useMemo(() => {
    if (!allTasks) return [];
    return [...allTasks].sort((a, b) => {
      // Incomplete tasks first
      const aComplete = a.status === 'done';
      const bComplete = b.status === 'done';
      if (aComplete !== bComplete) return aComplete ? 1 : -1;
      
      // Then by due date (earlier first, null last)
      if (a.due_date && b.due_date) {
        return new Date(a.due_date) - new Date(b.due_date);
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      
      // Finally by created_at (newest first)
      return new Date(b.created_date) - new Date(a.created_date);
    });
  }, [allTasks]);

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));
  const sessionMap = Object.fromEntries(sessions.map(s => [s.id, s]));
  const journeyMap = Object.fromEntries(journeys.map(j => [j.id, j]));

  // Detect context
  useEffect(() => {
    if (!isOpen) return;

    const detectContext = async () => {
      const globalContext = window.__kbContext || {};
      const urlParams = new URLSearchParams(window.location.search);
      const url = window.location.pathname;
      
      const clientMatch = url.match(/\/clients\/([^\/]+)/);
      const sessionMatch = url.match(/\/sessions\/([^\/]+)/);
      const journeyMatch = url.match(/\/journeys\/([^\/]+)/);
      
      const clientId = globalContext.clientId || urlParams.get('clientId') || clientMatch?.[1];
      const sessionId = globalContext.sessionId || urlParams.get('sessionId') || sessionMatch?.[1];
      const journeyId = globalContext.journeyId || urlParams.get('journeyId') || journeyMatch?.[1];
      const clientJourneyId = globalContext.clientJourneyId || urlParams.get('clientJourneyId');

      // Check Notebook page for selected note
      if (currentPageName === 'Notebook') {
        const selectedNoteId = localStorage.getItem('selectedNoteId');
        console.log('[TasksSlider] Notebook page - selectedNoteId:', selectedNoteId);

        if (selectedNoteId && selectedNoteId !== '' && selectedNoteId !== 'undefined' && selectedNoteId !== 'null') {
          try {
            const notes = await base44.entities.Note.filter({ id: selectedNoteId });
            const note = notes[0];
            console.log('[TasksSlider] Fetched note:', note);

            if (note) {
              console.log('[TasksSlider] Note links - linkedSession:', note.linkedSession, 'linkedJourney:', note.linkedJourney, 'linkedClient:', note.linkedClient);
              console.log('[TasksSlider] Note legacy links - session_id:', note.session_id, 'journey_id:', note.journey_id, 'client_id:', note.client_id);

              // Priority 1: Session (check both linkedSession and session_id)
              const sessionId = note.linkedSession || note.session_id;
              if (sessionId) {
                const sessions = await base44.entities.Session.filter({ id: sessionId });
                const session = sessions[0];
                console.log('[TasksSlider] Found linked session:', session);

                if (session) {
                  setObjectType('session');
                  setObjectId(sessionId);
                  setContextLabel(`Tasks for ${session.title}`);
                  console.log('[TasksSlider] Context set to session:', session.title);
                  return;
                }
              }

              // Priority 2: Journey (check both linkedJourney and journey_id)
              const journeyId = note.linkedJourney || note.journey_id;
              if (journeyId) {
                const clientJourneys = await base44.entities.ClientJourney.filter({ id: journeyId });
                const clientJourney = clientJourneys[0];

                if (clientJourney) {
                  const journeys = await base44.entities.Journey.filter({ id: clientJourney.journey_id });
                  const journey = journeys[0];
                  console.log('[TasksSlider] Found linked journey:', journey);

                  if (journey) {
                    setObjectType('journey');
                    setObjectId(journeyId);
                    setContextLabel(`Tasks for ${journey.title}`);
                    console.log('[TasksSlider] Context set to journey:', journey.title);
                    return;
                  }
                }
              }

              // Priority 3: Client (check both linkedClient and client_id)
              const clientId = note.linkedClient || note.client_id;
              if (clientId) {
                const clients = await base44.entities.Client.filter({ id: clientId });
                const client = clients[0];
                console.log('[TasksSlider] Found linked client:', client);

                if (client) {
                  setObjectType('client');
                  setObjectId(clientId);
                  setContextLabel(`Tasks for ${client.full_name}`);
                  console.log('[TasksSlider] Context set to client:', client.full_name);
                  return;
                }
              }

              // Fallback: No direct links on note, check if we can infer from Notebook tab/filters
              console.log('[TasksSlider] Note has no linked objects, checking fallback context');
              const notebookActiveTab = localStorage.getItem('notebookActiveTab');
              const notebookSelectedClientId = localStorage.getItem('notebookSelectedClientId');
              const notebookSelectedJourneyId = localStorage.getItem('notebookSelectedJourneyId');
              
              console.log('[TasksSlider] Fallback data - tab:', notebookActiveTab, 'client:', notebookSelectedClientId, 'journey:', notebookSelectedJourneyId);
              
              // If on Client Notes tab with a specific client selected
              if (notebookActiveTab === 'client-notes' && notebookSelectedClientId && notebookSelectedClientId !== '') {
                const clients = await base44.entities.Client.filter({ id: notebookSelectedClientId });
                const client = clients[0];
                console.log('[TasksSlider] Using fallback client from dropdown:', client);
                
                if (client) {
                  setObjectType('client');
                  setObjectId(notebookSelectedClientId);
                  setContextLabel(`Tasks for ${client.full_name}`);
                  console.log('[TasksSlider] Context set to fallback client:', client.full_name);
                  return;
                }
              }
              
              // If on Journey Notes tab with a specific journey selected
              if (notebookActiveTab === 'journey-notes' && notebookSelectedJourneyId && notebookSelectedJourneyId !== '') {
                const clientJourneys = await base44.entities.ClientJourney.filter({ id: notebookSelectedJourneyId });
                const clientJourney = clientJourneys[0];
                
                if (clientJourney) {
                  const journeys = await base44.entities.Journey.filter({ id: clientJourney.journey_id });
                  const journey = journeys[0];
                  console.log('[TasksSlider] Using fallback journey from dropdown:', journey);
                  
                  if (journey) {
                    setObjectType('journey');
                    setObjectId(notebookSelectedJourneyId);
                    setContextLabel(`Tasks for ${journey.title}`);
                    console.log('[TasksSlider] Context set to fallback journey:', journey.title);
                    return;
                  }
                }
              }
              
              console.log('[TasksSlider] No fallback context available, showing personal tasks');
            }
          } catch (error) {
            console.error('[TasksSlider] Error fetching note context:', error);
          }
        } else {
          console.log('[TasksSlider] No valid selectedNoteId, showing personal tasks');
        }
      }

      if (sessionId) {
        const session = await base44.entities.Session.filter({ id: sessionId }).then(r => r[0]);
        if (session) {
          setObjectType('session');
          setObjectId(sessionId);
          setContextLabel(`Tasks for ${session.title}`);
          return;
        }
      }

      if (clientJourneyId) {
        const clientJourney = await base44.entities.ClientJourney.filter({ id: clientJourneyId }).then(r => r[0]);
        const journey = clientJourney ? await base44.entities.Journey.filter({ id: clientJourney.journey_id }).then(r => r[0]) : null;
        if (journey) {
          setObjectType('journey');
          setObjectId(clientJourneyId);
          setContextLabel(`Tasks for ${journey.title}`);
          return;
        }
      }

      if (journeyId) {
        const journey = await base44.entities.Journey.filter({ id: journeyId }).then(r => r[0]);
        if (journey) {
          setObjectType('journey');
          setObjectId(journeyId);
          setContextLabel(`Tasks for ${journey.title}`);
          return;
        }
      }

      if (clientId) {
        const client = await base44.entities.Client.filter({ id: clientId }).then(r => r[0]);
        if (client) {
          setObjectType('client');
          setObjectId(clientId);
          setContextLabel(`Tasks for ${client.full_name}`);
          return;
        }
      }

      setObjectType('personal');
      setObjectId(null);
      setContextLabel('Personal Tasks');
    };

    detectContext();
  }, [isOpen, currentPageName, contextVersion]);

  // Listen for context changes
  useEffect(() => {
    const handleContextChange = () => {
      setContextVersion(v => v + 1);
      setSelectedTask(null);
      setShowAddForm(false);
    };

    window.addEventListener('kbContextChanged', handleContextChange);
    window.addEventListener('noteSelectionChanged', handleContextChange);
    return () => {
      window.removeEventListener('kbContextChanged', handleContextChange);
      window.removeEventListener('noteSelectionChanged', handleContextChange);
    };
  }, []);

  // Watch for localStorage changes when on Notebook page - poll every 500ms
  useEffect(() => {
    if (currentPageName !== 'Notebook' || !isOpen) return;

    // Initialize tracking
    const currentSelectedNoteId = localStorage.getItem('selectedNoteId');
    localStorage.setItem('_lastTasksSliderNoteId', currentSelectedNoteId || '');

    const interval = setInterval(() => {
      const newSelectedNoteId = localStorage.getItem('selectedNoteId');
      const lastSelectedNoteId = localStorage.getItem('_lastTasksSliderNoteId');

      if (newSelectedNoteId !== lastSelectedNoteId) {
        console.log('[TasksSlider] Note selection changed:', lastSelectedNoteId, '->', newSelectedNoteId);
        localStorage.setItem('_lastTasksSliderNoteId', newSelectedNoteId || '');
        setContextVersion(v => v + 1);
        setSelectedTask(null);
        setShowAddForm(false);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [currentPageName, isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setStatus("open");
    setActionType("follow_up");
    setShowAddForm(false);
    setEditingTask(null);
  };

  const handleAddTask = () => {
    setShowAddForm(true);
    setSelectedTask(null);
    setEditingTask(null);
    setHasUnsavedChanges(false);
  };

  const handleSaveNewTask = async () => {
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim() || null,
      priority: priority,
      status: status,
      due_date: dueDate || null,
      actionType: actionType
    };

    // Auto-link based on context
    if (objectType === 'client' && objectId) {
      taskData.client_id = objectId;
      taskData.taskContext = 'client';
    } else if (objectType === 'session' && objectId) {
      taskData.session_id = objectId;
      // Get client from session
      const session = sessions.find(s => s.id === objectId);
      if (session && session.client_id) {
        taskData.client_id = session.client_id;
      }
      taskData.taskContext = 'session';
    } else if (objectType === 'journey' && objectId) {
      taskData.journey_id = objectId;
      // Get client from client journey
      const clientJourney = clientJourneys.find(cj => cj.id === objectId);
      if (clientJourney && clientJourney.client_id) {
        taskData.client_id = clientJourney.client_id;
      }
      taskData.taskContext = 'journey';
    } else {
      taskData.taskContext = 'personal';
    }

    await createMutation.mutateAsync(taskData);
    resetForm();
  };

  const createMutation = useMutation({
    mutationFn: async (taskData) => {
      const task = await base44.entities.Task.create(taskData);
      
      // Update linked entity timestamp
      if (taskData.client_id) {
        await base44.entities.Client.update(taskData.client_id, {}).catch(() => {});
      }
      if (taskData.session_id) {
        await base44.entities.Session.update(taskData.session_id, {}).catch(() => {});
      }
      if (taskData.journey_id) {
        await base44.entities.ClientJourney.update(taskData.journey_id, {}).catch(() => {});
      }
      
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-slider'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const task = await base44.entities.Task.update(id, data);
      
      // Update linked entity timestamp
      if (data.client_id) {
        await base44.entities.Client.update(data.client_id, {}).catch(() => {});
      }
      if (data.session_id) {
        await base44.entities.Session.update(data.session_id, {}).catch(() => {});
      }
      if (data.journey_id) {
        await base44.entities.ClientJourney.update(data.journey_id, {}).catch(() => {});
      }
      
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-slider'] });
      resetForm();
      setSelectedTask(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-slider'] });
      setSelectedTask(null);
    }
  });

  const handleSave = () => {
    if (!title.trim()) return;

    let taskContext = 'personal';
    const taskData = {
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate || null,
      priority,
      status
    };

    if (objectType === 'session' && objectId) {
      taskData.session_id = objectId;
      taskContext = 'session';
    } else if (objectType === 'journey' && objectId) {
      taskData.journey_id = objectId;
      taskContext = 'journey';
    } else if (objectType === 'client' && objectId) {
      taskData.client_id = objectId;
      taskContext = 'client';
    }

    taskData.taskContext = taskContext;

    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data: taskData });
    } else {
      createMutation.mutate(taskData);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setDueDate(task.due_date || "");
    setPriority(task.priority || "medium");
    setStatus(task.status || "open");
    setShowAddForm(true);
    setSelectedTask(null);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSelectTask = (task) => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Do you want to discard them?')) {
        setHasUnsavedChanges(false);
        loadTaskToDetail(task);
      }
    } else {
      loadTaskToDetail(task);
    }
  };

  const loadTaskToDetail = (task) => {
    setSelectedTask(task);
    setDetailTitle(task.title);
    setDetailDescription(task.description || "");
    setDetailDueDate(task.due_date || "");
    setDetailPriority(task.priority || "medium");
    setDetailStatus(task.status || "open");
    setShowAddForm(false);
    setEditingTask(null);
    setHasUnsavedChanges(false);
  };

  const handleDetailChange = () => {
    if (!selectedTask) return;
    const changed = 
      detailTitle !== selectedTask.title ||
      detailDescription !== (selectedTask.description || "") ||
      detailDueDate !== (selectedTask.due_date || "") ||
      detailPriority !== (selectedTask.priority || "medium") ||
      detailStatus !== (selectedTask.status || "open");
    setHasUnsavedChanges(changed);
  };

  React.useEffect(() => {
    if (selectedTask) {
      handleDetailChange();
    }
  }, [detailTitle, detailDescription, detailDueDate, detailPriority, detailStatus]);

  const handleSaveDetailChanges = async () => {
    if (!selectedTask || !detailTitle.trim()) return;

    const taskData = {
      title: detailTitle.trim(),
      description: detailDescription.trim(),
      due_date: detailDueDate || null,
      priority: detailPriority,
      status: detailStatus
    };

    await updateMutation.mutateAsync({ id: selectedTask.id, data: taskData });
    setHasUnsavedChanges(false);
    
    // Update selectedTask with new data
    setSelectedTask({ ...selectedTask, ...taskData });
  };

  const handleCloseDetail = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Do you want to discard them?')) {
        setSelectedTask(null);
        setHasUnsavedChanges(false);
      }
    } else {
      setSelectedTask(null);
    }
  };

  const navigateToContext = () => {
    if (!selectedTask) return;

    if (selectedTask.client_id && clientMap[selectedTask.client_id]) {
      navigate(createPageUrl('Clients') + '?clientId=' + selectedTask.client_id);
      onClose();
    } else if (selectedTask.session_id && sessionMap[selectedTask.session_id]) {
      navigate(createPageUrl('Sessions') + '?sessionId=' + selectedTask.session_id);
      onClose();
    } else if (selectedTask.journey_id) {
      const clientJourney = clientJourneys.find(cj => cj.id === selectedTask.journey_id);
      if (clientJourney) {
        navigate(createPageUrl('Journeys') + '?clientJourneyId=' + selectedTask.journey_id);
        onClose();
      }
    }
  };

  const sliderWidth = (selectedTask || showAddForm) ? '750px' : '400px';

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const priorityDots = {
    low: 'bg-green-500',
    medium: 'bg-orange-500',
    high: 'bg-red-500'
  };

  const statusColors = {
    open: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800'
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === 'done' ? 'open' : 'done';
    await updateMutation.mutateAsync({ 
      id: task.id, 
      data: { status: newStatus } 
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 border-l border-gray-200 flex"
        style={{ width: sliderWidth }}
      >
        {/* Main Task List Panel */}
        <div className={`flex flex-col ${(selectedTask || showAddForm) ? 'w-[350px]' : 'w-full'} border-r border-gray-200`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-900">Tasks ({tasks.length})</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleAddTask}
                  className="bg-purple-600 hover:bg-purple-700 h-8"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </Button>
                <button
                  onClick={onClose}
                  className="hover:bg-gray-200 p-1.5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            {contextLabel && (
              <p className="text-sm text-gray-600">{contextLabel}</p>
            )}
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-4">

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {(!objectType || objectType === 'personal') && !showAddForm && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">📋 About Tasks</h3>
                      <p className="text-sm text-gray-700 mb-2">
                        Tasks help you track action items for your coaching practice.
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        Select a client, session, or journey to see related tasks.
                      </p>
                      <p className="text-sm text-gray-700">
                        Or create personal tasks for your own to-do items.
                      </p>
                    </div>
                  )}

                  {tasks.length === 0 && !showAddForm ? (
                    <div className="text-center py-12 text-gray-500">
                      <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">No tasks yet. Click "Add Task" to create one.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map(task => (
                        <Card 
                          key={task.id}
                          className={`hover:shadow-md transition-shadow ${
                            selectedTask?.id === task.id ? 'ring-2 ring-purple-400' : ''
                          } ${task.status === 'done' ? 'opacity-60' : ''}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Checkbox */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTaskStatus(task);
                                }}
                                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  task.status === 'done' 
                                    ? 'bg-green-500 border-green-500' 
                                    : 'border-gray-300 hover:border-purple-400'
                                }`}
                              >
                                {task.status === 'done' && (
                                  <CheckSquare className="w-4 h-4 text-white" fill="white" />
                                )}
                              </button>

                              {/* Task content */}
                              <div 
                                className="flex-1 cursor-pointer"
                                onClick={() => handleSelectTask(task)}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h3 className={`font-semibold text-gray-900 ${task.status === 'done' ? 'line-through' : ''}`}>
                                    {task.title}
                                  </h3>
                                  <div className="flex items-center gap-1">
                                    {/* Priority dot */}
                                    <div 
                                      className={`w-2 h-2 rounded-full ${priorityDots[task.priority || 'medium']}`}
                                      title={`${task.priority || 'medium'} priority`}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs">
                                    {task.taskContext || 'personal'}
                                  </Badge>
                                  {task.due_date && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${isOverdue(task.due_date) ? 'bg-red-50 text-red-700 border-red-300' : ''}`}
                                    >
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {isOverdue(task.due_date) ? 'Overdue' : format(new Date(task.due_date), 'MMM d')}
                                    </Badge>
                                  )}
                                </div>

                                {task.description && (
                                  <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Detail/Form Panel */}
        <AnimatePresence>
          {(selectedTask || showAddForm) && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="flex-1 flex flex-col border-l border-gray-200"
            >
              {showAddForm || editingTask ? (
                <>
                  {/* Form Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">
                        {editingTask ? 'Edit Task' : 'New Task'}
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={resetForm}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Title *</label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Task title"
                          className="bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Task description"
                          className="min-h-[100px] bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Due Date</label>
                        <Input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
                        <Select value={priority} onValueChange={setPriority}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                        <Select value={actionType} onValueChange={setActionType}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="follow_up">Follow Up</SelectItem>
                            <SelectItem value="resource_sharing">Resource Sharing</SelectItem>
                            <SelectItem value="scheduling">Scheduling</SelectItem>
                            <SelectItem value="documentation">Documentation</SelectItem>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="research">Research</SelectItem>
                            <SelectItem value="coordination">Coordination</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="intervention_setup">Intervention Setup</SelectItem>
                            <SelectItem value="check_in">Check In</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Context Display */}
                      {objectType && objectId ? (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-200">
                          <p className="text-xs font-semibold text-purple-900 mb-1 uppercase tracking-wide">Linked To</p>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              objectType === 'client' ? 'bg-emerald-100 text-emerald-800' :
                              objectType === 'session' ? 'bg-blue-100 text-blue-800' :
                              objectType === 'journey' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {objectType === 'client' ? '👤 Client' :
                               objectType === 'session' ? '🎥 Session' :
                               objectType === 'journey' ? '🗺️ Journey' :
                               'Personal'}
                            </Badge>
                            <span className="text-sm font-medium text-gray-900">
                              {contextLabel.replace('Tasks for ', '')}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-gray-100 text-gray-800">
                              📋 Personal Task
                            </Badge>
                            <span className="text-sm text-gray-600">Not linked to any object</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={handleSave}
                          disabled={!title.trim() || createMutation.isPending || updateMutation.isPending}
                          className="bg-purple-600 hover:bg-purple-700 flex-1"
                        >
                          {(createMutation.isPending || updateMutation.isPending) ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          {editingTask ? 'Save Changes' : 'Create Task'}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={resetForm}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </>
              ) : selectedTask && (
                <>
                  {/* Detail Header */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Task Details</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCloseDetail}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Detail Content */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {/* Title */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Task Title</label>
                        <Input
                          value={detailTitle}
                          onChange={(e) => setDetailTitle(e.target.value)}
                          className="text-lg font-semibold bg-white"
                        />
                      </div>

                      {/* Status Toggle */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setDetailStatus('open')}
                            variant={detailStatus === 'open' ? 'default' : 'outline'}
                            className={detailStatus === 'open' ? 'bg-gray-600' : ''}
                            size="sm"
                          >
                            Incomplete
                          </Button>
                          <Button
                            onClick={() => setDetailStatus('done')}
                            variant={detailStatus === 'done' ? 'default' : 'outline'}
                            className={detailStatus === 'done' ? 'bg-green-600' : ''}
                            size="sm"
                          >
                            Complete
                          </Button>
                        </div>
                      </div>

                      {/* Type Badge */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                        <Badge variant="outline" className="text-sm">
                          {selectedTask.taskContext || 'personal'}
                        </Badge>
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
                        <Select value={detailPriority} onValueChange={setDetailPriority}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Due Date */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Due Date</label>
                        <Input
                          type="date"
                          value={detailDueDate}
                          onChange={(e) => setDetailDueDate(e.target.value)}
                          className="bg-white"
                        />
                        {detailDueDate && isOverdue(detailDueDate) && (
                          <p className="text-xs text-red-600 mt-1">This task is overdue</p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                        <Textarea
                          value={detailDescription}
                          onChange={(e) => setDetailDescription(e.target.value)}
                          placeholder="Add task description..."
                          className="min-h-[120px] bg-white"
                        />
                      </div>

                      {/* Context Link */}
                      {(selectedTask.client_id || selectedTask.session_id || selectedTask.journey_id) && (
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <p className="text-xs font-semibold text-purple-900 mb-2">Linked To</p>
                          <button
                            onClick={navigateToContext}
                            className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 font-medium"
                          >
                            {selectedTask.client_id && clientMap[selectedTask.client_id] && (
                              <>
                                <span>Client: {clientMap[selectedTask.client_id].full_name}</span>
                                <ExternalLink className="w-3 h-3" />
                              </>
                            )}
                            {selectedTask.session_id && sessionMap[selectedTask.session_id] && (
                              <>
                                <span>Session: {sessionMap[selectedTask.session_id].title}</span>
                                <ExternalLink className="w-3 h-3" />
                              </>
                            )}
                            {selectedTask.journey_id && (() => {
                              const clientJourney = clientJourneys.find(cj => cj.id === selectedTask.journey_id);
                              const journey = clientJourney ? journeyMap[clientJourney.journey_id] : journeyMap[selectedTask.journey_id];
                              return journey ? (
                                <>
                                  <span>Journey: {journey.title}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </>
                              ) : null;
                            })()}
                          </button>
                        </div>
                      )}

                      {/* Source Info */}
                      {selectedTask.source_timestamp && selectedTask.session_id && sessionMap[selectedTask.session_id] && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-xs font-semibold text-blue-900 mb-1">Source</p>
                          <p className="text-sm text-gray-700">
                            From: {sessionMap[selectedTask.session_id].title}
                            {sessionMap[selectedTask.session_id].date_time && (
                              <> • {format(new Date(sessionMap[selectedTask.session_id].date_time), 'MMM d, yyyy')}</>
                            )}
                          </p>
                          {selectedTask.confidence && (
                            <p className="text-xs text-gray-600 mt-1">
                              AI Confidence: {Math.round(selectedTask.confidence * 100)}%
                            </p>
                          )}
                        </div>
                      )}

                      {/* Created/Updated Info */}
                      <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                        <p>Created: {format(new Date(selectedTask.created_date), 'MMM d, yyyy h:mm a')}</p>
                        {selectedTask.updated_date && selectedTask.updated_date !== selectedTask.created_date && (
                          <p className="mt-1">Updated: {format(new Date(selectedTask.updated_date), 'MMM d, yyyy h:mm a')}</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handleSaveDetailChanges}
                          disabled={!hasUnsavedChanges || !detailTitle.trim() || updateMutation.isPending}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          {hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
                        </Button>
                        <Button
                          onClick={() => handleDelete(selectedTask.id)}
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}