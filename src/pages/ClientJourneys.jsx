import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  MapIcon,
  CheckCircle,
  Circle,
  Calendar,
  Loader2,
  AlertCircle,
  ChevronRight,
  Play,
  Video,
  Headphones,
  FileText,
  Target,
  Star,
  Trophy
} from "lucide-react";
import { format } from "date-fns";

export default function ClientJourneysPage() {
  const [clientId, setClientId] = useState(null);
  const [selectedJourney, setSelectedJourney] = useState(null);

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

  const { data: clientJourneys = [], isLoading } = useQuery({
    queryKey: ['client-journeys', clientId],
    queryFn: () => api.entities.ClientJourney.filter({ client_id: clientId }),
    enabled: !!clientId
  });

  const { data: journeys = [] } = useQuery({
    queryKey: ['journeys'],
    queryFn: () => api.entities.Journey.list(),
  });

  const { data: journeySteps = [] } = useQuery({
    queryKey: ['journey-steps'],
    queryFn: () => api.entities.JourneyStep.list(),
  });

  const { data: clientJourneySteps = [] } = useQuery({
    queryKey: ['client-journey-steps'],
    queryFn: () => api.entities.ClientJourneyStep.list(),
  });

  const journeyMap = Object.fromEntries(journeys.map(j => [j.id, j]));

  // Get journey progress
  const getJourneyData = (clientJourney) => {
    const journey = journeyMap[clientJourney.journey_id];
    const steps = journeySteps
      .filter(s => s.journey_id === clientJourney.journey_id)
      .sort((a, b) => a.order_number - b.order_number);

    const stepStatuses = clientJourneySteps.filter(
      cjs => cjs.client_journey_id === clientJourney.id
    );

    const stepStatusMap = Object.fromEntries(
      stepStatuses.map(s => [s.journey_step_id, s])
    );

    const completedCount = stepStatuses.filter(s => s.status === 'Completed').length;
    const percentage = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

    return {
      journey,
      steps,
      stepStatusMap,
      completedCount,
      totalSteps: steps.length,
      percentage
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      case 'Paused': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">My Journeys</h1>
          <p className="text-gray-600 mt-1">
            Track your wellness journey progress
          </p>
        </div>

        {/* Journeys List */}
        {clientJourneys.length === 0 ? (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="py-12 text-center">
              <MapIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No Journeys Yet</h3>
              <p className="text-gray-500">Your coach will assign you a journey to start your wellness path.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {clientJourneys.map(clientJourney => {
              const data = getJourneyData(clientJourney);
              const isComplete = data.percentage === 100;

              return (
                <Card
                  key={clientJourney.id}
                  className={`bg-white hover:shadow-md transition-shadow cursor-pointer ${isComplete ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-white' : ''
                    }`}
                  onClick={() => setSelectedJourney(clientJourney)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isComplete ? 'bg-emerald-100' : 'bg-purple-100'
                            }`}>
                            {isComplete ? (
                              <Trophy className="w-6 h-6 text-emerald-600" />
                            ) : (
                              <MapIcon className="w-6 h-6 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {data.journey?.title || 'Journey'}
                            </h3>
                            <Badge className={getStatusColor(clientJourney.status)}>
                              {clientJourney.status}
                            </Badge>
                          </div>
                        </div>

                        {data.journey?.description && (
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                            {data.journey.description}
                          </p>
                        )}

                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">
                              {data.completedCount} of {data.totalSteps} steps completed
                            </span>
                            <span className="text-sm font-semibold text-purple-700">
                              {data.percentage}%
                            </span>
                          </div>
                          <Progress value={data.percentage} className="h-2" />
                        </div>

                        {clientJourney.started_at && (
                          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>Started {format(new Date(clientJourney.started_at), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400 mt-4" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Journey Detail Modal */}
        <JourneyDetailModal
          clientJourney={selectedJourney}
          journeyData={selectedJourney ? getJourneyData(selectedJourney) : null}
          onClose={() => setSelectedJourney(null)}
        />
      </div>
    </div>
  );
}

function JourneyDetailModal({ clientJourney, journeyData, onClose }) {
  if (!clientJourney || !journeyData) return null;

  const { journey, steps, stepStatusMap, completedCount, totalSteps, percentage } = journeyData;

  const getStepIcon = (step) => {
    switch (step.step_type) {
      case 'Video': return Video;
      case 'Audio': return Headphones;
      case 'Exercise': return Target;
      case 'Milestone': return Trophy;
      default: return FileText;
    }
  };

  const getStepStatus = (step) => {
    const status = stepStatusMap[step.id];
    return status?.status || 'Not Started';
  };

  const isStepCompleted = (step) => {
    return getStepStatus(step) === 'Completed';
  };

  const getCurrentStepIndex = () => {
    for (let i = 0; i < steps.length; i++) {
      if (!isStepCompleted(steps[i])) {
        return i;
      }
    }
    return steps.length; // All complete
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <Dialog open={!!clientJourney} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <MapIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <span className="block">{journey?.title || 'Journey'}</span>
              <Badge className={`mt-1 ${percentage === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                {percentage === 100 ? '🎉 Completed!' : `${percentage}% Complete`}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-gray-900">Your Progress</span>
              </div>
              <span className="text-2xl font-bold text-purple-700">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-3" />
            <p className="text-sm text-gray-600 mt-2">
              {completedCount} of {totalSteps} steps completed
            </p>
          </div>

          {journey?.description && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{journey.description}</p>
            </div>
          )}

          {/* Journey Timeline */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Journey Steps</h4>
            <div className="space-y-0">
              {steps.map((step, index) => {
                const completed = isStepCompleted(step);
                const isCurrent = index === currentStepIndex;
                const isUpcoming = index > currentStepIndex;
                const StepIcon = getStepIcon(step);
                const stepStatus = stepStatusMap[step.id];

                return (
                  <div key={step.id} className="relative">
                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div className={`absolute left-5 top-12 w-0.5 h-full -ml-px ${completed ? 'bg-emerald-300' : 'bg-gray-200'
                        }`} />
                    )}

                    <div className={`relative flex gap-4 p-4 rounded-xl transition-all ${isCurrent ? 'bg-purple-50 border-2 border-purple-200' :
                      completed ? 'bg-emerald-50/50' : 'bg-gray-50/50'
                      }`}>
                      {/* Step Indicator */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${completed ? 'bg-emerald-500' :
                        isCurrent ? 'bg-purple-500' : 'bg-gray-300'
                        }`}>
                        {completed ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-white font-semibold text-sm">{index + 1}</span>
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className={`font-medium ${completed ? 'text-emerald-700' :
                              isCurrent ? 'text-purple-900' : 'text-gray-600'
                              }`}>
                              {step.title}
                            </h5>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                <StepIcon className="w-3 h-3 mr-1" />
                                {step.step_type}
                              </Badge>
                              {step.duration_days && (
                                <span className="text-xs text-gray-500">
                                  {step.duration_days} day{step.duration_days !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>

                          {completed && (
                            <Badge className="bg-emerald-100 text-emerald-700 shrink-0">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Done
                            </Badge>
                          )}
                          {isCurrent && !completed && (
                            <Badge className="bg-purple-100 text-purple-700 shrink-0">
                              <Play className="w-3 h-3 mr-1" />
                              Current
                            </Badge>
                          )}
                        </div>

                        {step.description && (
                          <p className={`text-sm mt-2 ${isUpcoming ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            {step.description}
                          </p>
                        )}

                        {/* Resources */}
                        {(step.video_url || step.audio_url) && !isUpcoming && (
                          <div className="flex gap-2 mt-3">
                            {step.video_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(step.video_url, '_blank');
                                }}
                              >
                                <Video className="w-3 h-3" />
                                Watch Video
                              </Button>
                            )}
                            {step.audio_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(step.audio_url, '_blank');
                                }}
                              >
                                <Headphones className="w-3 h-3" />
                                Listen
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Completion Info */}
                        {stepStatus?.completed_at && (
                          <p className="text-xs text-emerald-600 mt-2">
                            Completed on {format(new Date(stepStatus.completed_at), 'MMM d, yyyy')}
                          </p>
                        )}

                        {/* Coach Feedback */}
                        {stepStatus?.coach_feedback && (
                          <div className="mt-3 bg-blue-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-blue-700 mb-1">Coach Feedback:</p>
                            <p className="text-sm text-blue-900">{stepStatus.coach_feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completion Message */}
          {percentage === 100 && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-center text-white">
              <Trophy className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-1">Congratulations! 🎉</h3>
              <p className="text-emerald-100">
                You've completed this journey! Your dedication is inspiring.
              </p>
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