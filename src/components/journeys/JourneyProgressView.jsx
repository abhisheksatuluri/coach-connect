import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle, Circle, Clock, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import NotesSection from "@/components/notes/NotesSection";
import FilesSection from "@/components/files/FilesSection";
import { setNoteContextJourney, clearNoteContext } from "@/components/notes/useNoteContext";

const statusColors = {
  "Not Started": "bg-gray-100 text-gray-800 border-gray-200",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
  "Completed": "bg-green-100 text-green-800 border-green-200",
  "Skipped": "bg-yellow-100 text-yellow-800 border-yellow-200"
};

const stepTypeColors = {
  "Task": "bg-blue-100 text-blue-800",
  "Exercise": "bg-orange-100 text-orange-800",
  "Video": "bg-purple-100 text-purple-800",
  "Audio": "bg-pink-100 text-pink-800",
  "Text Lesson": "bg-green-100 text-green-800",
  "Reflection": "bg-indigo-100 text-indigo-800",
  "Milestone": "bg-yellow-100 text-yellow-800",
  "Assessment": "bg-red-100 text-red-800",
  "Check-in": "bg-teal-100 text-teal-800"
};

export default function JourneyProgressView({ clientJourney, client, journey, onClose }) {
  const [feedbackStep, setFeedbackStep] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const queryClient = useQueryClient();

  // Set note context and KB context when this journey progress view is open
  useEffect(() => {
    if (clientJourney?.id) {
      console.log('[JourneyProgressView] Setting journey context:', clientJourney.id, journey?.title);
      setNoteContextJourney(clientJourney.id, clientJourney.client_id, journey?.title);
      // Set global KB context
      window.__kbContext = { clientJourneyId: clientJourney.id, clientId: clientJourney.client_id };
      window.dispatchEvent(new CustomEvent('kbContextChanged'));
    }
    return () => {
      clearNoteContext();
      // Clear global KB context
      window.__kbContext = {};
      window.dispatchEvent(new CustomEvent('kbContextChanged'));
    };
  }, [clientJourney?.id, clientJourney?.client_id, journey?.title]);

  const { data: clientJourneySteps = [] } = useQuery({
    queryKey: ['clientJourneySteps', clientJourney.id],
    queryFn: () => base44.entities.ClientJourneyStep.filter({ client_journey_id: clientJourney.id }),
  });

  const { data: journeySteps = [] } = useQuery({
    queryKey: ['journeySteps', journey?.id],
    queryFn: () => base44.entities.JourneyStep.filter({ journey_id: journey.id }),
    enabled: !!journey?.id
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (clientJourneyStepId) => {
      await base44.entities.ClientJourneyStep.update(clientJourneyStepId, {
        status: 'Completed',
        completed_at: new Date().toISOString()
      });

      // Calculate progress
      const updatedSteps = await base44.entities.ClientJourneyStep.filter({ 
        client_journey_id: clientJourney.id 
      });
      const completedCount = updatedSteps.filter(s => s.status === 'Completed').length;
      const progressPercentage = Math.round((completedCount / updatedSteps.length) * 100);

      // Update ClientJourney progress
      await base44.entities.ClientJourney.update(clientJourney.id, {
        progress_percentage: progressPercentage,
        current_step_number: completedCount + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientJourneySteps'] });
      queryClient.invalidateQueries({ queryKey: ['clientJourneys'] });
    }
  });

  const addFeedbackMutation = useMutation({
    mutationFn: ({ stepId, feedback }) => 
      base44.entities.ClientJourneyStep.update(stepId, { coach_feedback: feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientJourneySteps'] });
      setFeedbackStep(null);
      setFeedbackText("");
    }
  });

  const getStepDetails = (journeyStepId) => {
    return journeySteps.find(s => s.id === journeyStepId);
  };

  const sortedClientSteps = [...clientJourneySteps].sort((a, b) => {
    const stepA = getStepDetails(a.journey_step_id);
    const stepB = getStepDetails(b.journey_step_id);
    return (stepA?.order_number || 0) - (stepB?.order_number || 0);
  });

  const completedSteps = clientJourneySteps.filter(s => s.status === 'Completed').length;

  return (
    <div className="space-y-6">
      <Button onClick={onClose} variant="outline" className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to All Journeys
      </Button>

      {/* Progress Overview */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{client?.full_name}'s Journey</CardTitle>
              <p className="text-gray-600">{journey?.title}</p>
            </div>
            <Badge variant="outline" className={statusColors[clientJourney.status]}>
              {clientJourney.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {journey?.description && (
              <p className="text-gray-700">{journey.description}</p>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Overall Progress</span>
                <span>{completedSteps} of {clientJourneySteps.length} steps completed</span>
              </div>
              <Progress value={clientJourney.progress_percentage || 0} className="h-3" />
              <p className="text-sm text-gray-600 text-right">{clientJourney.progress_percentage || 0}%</p>
            </div>

            <div className="flex gap-6 text-sm text-gray-600 pt-2">
              {clientJourney.started_at && (
                <span>Started: {format(new Date(clientJourney.started_at), 'MMM d, yyyy')}</span>
              )}
              {clientJourney.completed_at && (
                <span>Completed: {format(new Date(clientJourney.completed_at), 'MMM d, yyyy')}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps List */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl">Journey Steps</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {sortedClientSteps.map((clientStep) => {
              const stepDetails = getStepDetails(clientStep.journey_step_id);
              if (!stepDetails) return null;

              return (
                <div key={clientStep.id} className="p-4 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold flex-shrink-0">
                      {stepDetails.order_number}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{stepDetails.title}</h4>
                          <p className="text-sm text-gray-600">{stepDetails.description}</p>
                        </div>
                        <Badge variant="outline" className={statusColors[clientStep.status]}>
                          {clientStep.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={stepTypeColors[stepDetails.step_type]}>
                          {stepDetails.step_type}
                        </Badge>
                        {stepDetails.duration_days && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {stepDetails.duration_days} day{stepDetails.duration_days > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {clientStep.client_response && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-medium text-blue-900 mb-1">Client Response:</p>
                          <p className="text-sm text-blue-800">{clientStep.client_response}</p>
                        </div>
                      )}

                      {clientStep.coach_feedback && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs font-medium text-green-900 mb-1">Coach Feedback:</p>
                          <p className="text-sm text-green-800">{clientStep.coach_feedback}</p>
                        </div>
                      )}

                      {clientStep.completed_at && (
                        <p className="text-xs text-gray-500">
                          Completed: {format(new Date(clientStep.completed_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        {clientStep.status !== 'Completed' && (
                          <Button
                            size="sm"
                            onClick={() => markCompleteMutation.mutate(clientStep.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </Button>
                        )}
                        
                        {feedbackStep === clientStep.id ? (
                          <div className="flex-1 flex gap-2">
                            <Textarea
                              placeholder="Add coach feedback..."
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              className="flex-1"
                              rows={2}
                            />
                            <div className="flex flex-col gap-1">
                              <Button
                                size="sm"
                                onClick={() => addFeedbackMutation.mutate({
                                  stepId: clientStep.id,
                                  feedback: feedbackText
                                })}
                                disabled={!feedbackText.trim()}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setFeedbackStep(null);
                                  setFeedbackText("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setFeedbackStep(clientStep.id);
                              setFeedbackText(clientStep.coach_feedback || "");
                            }}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            {clientStep.coach_feedback ? 'Edit Feedback' : 'Add Feedback'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <NotesSection 
        linkedJourney={clientJourney.id} 
        linkedClient={clientJourney.client_id}
        journeyTitle={journey?.title}
      />

      {/* Files Section */}
      <FilesSection 
        linkedJourney={clientJourney.id} 
        linkedClient={clientJourney.client_id}
      />
    </div>
  );
}