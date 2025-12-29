import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, BookOpen, Tag, AlertTriangle, CheckSquare,
  ChevronDown, ChevronUp, ExternalLink, RefreshCw, 
  ArrowRight, Mail, Plus, Calendar, Loader2, CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const priorityColors = {
  High: "bg-red-100 text-red-800 border-red-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Low: "bg-blue-100 text-blue-800 border-blue-200"
};

const categoryColors = {
  Nutrition: "bg-orange-100 text-orange-800",
  Exercise: "bg-green-100 text-green-800",
  Sleep: "bg-indigo-100 text-indigo-800",
  "Behavior Change": "bg-purple-100 text-purple-800",
  Mindset: "bg-pink-100 text-pink-800",
  Hydration: "bg-cyan-100 text-cyan-800",
  "Stress Management": "bg-amber-100 text-amber-800",
  Other: "bg-gray-100 text-gray-800"
};

export default function AISessionInsights({ sessionId, clientId }) {
  const [analysisData, setAnalysisData] = useState(null);
  const [appliedReferences, setAppliedReferences] = useState(new Set());
  const [addedRecommendations, setAddedRecommendations] = useState(new Set());
  const [completedActions, setCompletedActions] = useState(new Set());
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Check for existing applied references
  const { data: existingReferences = [] } = useQuery({
    queryKey: ['appliedReferences', sessionId],
    queryFn: () => base44.entities.AppliedReference.filter({ session_id: sessionId }),
    enabled: !!sessionId,
  });

  // Check for existing recommendations
  const { data: existingRecommendations = [] } = useQuery({
    queryKey: ['clientRecommendations', sessionId],
    queryFn: () => base44.entities.ClientRecommendation.filter({ session_id: sessionId }),
    enabled: !!sessionId,
  });

  React.useEffect(() => {
    if (existingReferences.length > 0) {
      const refs = new Set(existingReferences.map(r => r.knowledge_base_id));
      setAppliedReferences(refs);
    }
  }, [existingReferences]);

  React.useEffect(() => {
    if (existingRecommendations.length > 0) {
      const recs = new Set(existingRecommendations.map(r => r.recommendation_text));
      setAddedRecommendations(recs);
    }
  }, [existingRecommendations]);

  const generateAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateSessionAnalysis', {
        session_id: sessionId
      });
      
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to generate analysis');
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      setAnalysisData(data);
    },
  });

  const applyReferenceMutation = useMutation({
    mutationFn: async ({ kbId, matchType, matchReason }) => {
      return await base44.entities.AppliedReference.create({
        client_id: clientId,
        session_id: sessionId,
        knowledge_base_id: kbId,
        match_type: matchType,
        match_reason: matchReason,
        applied_at: new Date().toISOString(),
        applied_by: user?.id
      });
    },
    onSuccess: (_, variables) => {
      setAppliedReferences(prev => new Set([...prev, variables.kbId]));
      queryClient.invalidateQueries({ queryKey: ['appliedReferences', sessionId] });
    },
  });

  const addRecommendationMutation = useMutation({
    mutationFn: async (recommendation) => {
      return await base44.entities.ClientRecommendation.create({
        client_id: clientId,
        session_id: sessionId,
        recommendation_text: recommendation.text,
        category: recommendation.category,
        priority: recommendation.priority,
        source: "AI Generated",
        status: "Not Started",
        applied_at: new Date().toISOString(),
        applied_by: user?.id,
        coach_notes: recommendation.rationale
      });
    },
    onSuccess: (_, recommendation) => {
      setAddedRecommendations(prev => new Set([...prev, recommendation.text]));
      queryClient.invalidateQueries({ queryKey: ['clientRecommendations', sessionId] });
    },
  });

  const handleApplyReference = (kbId, matchType, matchReason) => {
    applyReferenceMutation.mutate({ kbId, matchType, matchReason });
  };

  const handleAddRecommendation = (recommendation) => {
    addRecommendationMutation.mutate(recommendation);
  };

  const handleToggleAction = (actionId) => {
    setCompletedActions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(actionId)) {
        newSet.delete(actionId);
      } else {
        newSet.add(actionId);
      }
      return newSet;
    });
  };

  const hasAnyReferences = analysisData?.references && (
    (analysisData.references.keyword_matches?.length > 0) ||
    (analysisData.references.topic_matches?.length > 0) ||
    (analysisData.references.symptom_matches?.length > 0)
  );

  const hasRecommendations = analysisData?.recommendations?.length > 0;
  const hasCoachActions = analysisData?.coach_actions?.length > 0;

  const ReferenceItem = ({ match, matchType, icon: Icon, color }) => {
    const isApplied = appliedReferences.has(match.kb_id);
    
    return (
      <div className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isApplied}
            onChange={() => !isApplied && handleApplyReference(match.kb_id, matchType, match.reason)}
            disabled={isApplied}
            className="mt-1 w-4 h-4 cursor-pointer"
          />
          <Icon className={`w-4 h-4 ${color} mt-1 flex-shrink-0`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-gray-900">"{match.keyword || match.topic || match.symptom}"</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className={`${color.replace('text-', 'text-')} hover:underline cursor-pointer font-medium`}>
                {match.kb_title}
              </span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
              {isApplied && <Badge className="bg-green-100 text-green-800 text-xs">Applied</Badge>}
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Reason:</span> {match.reason}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-xl mb-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              AI Session Insights
            </CardTitle>
            {analysisData && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>Analysis generated: {format(new Date(), 'MMM d, yyyy h:mm a')}</span>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Powered by AI
                </Badge>
              </div>
            )}
          </div>
          <Button
            onClick={() => generateAnalysisMutation.mutate()}
            disabled={generateAnalysisMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {generateAnalysisMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing session...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {analysisData ? 'Regenerate Insights' : 'Generate AI Insights'}
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {generateAnalysisMutation.isError && (
        <CardContent className="pt-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            Error: {generateAnalysisMutation.error?.message || 'Failed to generate analysis'}
          </div>
        </CardContent>
      )}

      {analysisData && (
        <CardContent className="p-6">
          <Accordion type="multiple" defaultValue={["references", "recommendations", "actions"]} className="space-y-4">
            {/* SUBSECTION 1: KNOWLEDGE BASE REFERENCES */}
            <AccordionItem value="references" className="border border-gray-200 rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Knowledge Base References</span>
                  {hasAnyReferences && (
                    <Badge variant="outline" className="ml-2">
                      {(analysisData.references.keyword_matches?.length || 0) +
                       (analysisData.references.topic_matches?.length || 0) +
                       (analysisData.references.symptom_matches?.length || 0)}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-6">
                {hasAnyReferences ? (
                  <>
                    {/* Keyword Matches */}
                    {analysisData.references.keyword_matches?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          🔑 Keyword Matches
                        </h4>
                        <div className="space-y-2">
                          {analysisData.references.keyword_matches.map((match, idx) => (
                            <ReferenceItem
                              key={idx}
                              match={match}
                              matchType="Keyword Match"
                              icon={Tag}
                              color="text-purple-600"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Topic Matches */}
                    {analysisData.references.topic_matches?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          📚 Topic Matches
                        </h4>
                        <div className="space-y-2">
                          {analysisData.references.topic_matches.map((match, idx) => (
                            <ReferenceItem
                              key={idx}
                              match={match}
                              matchType="Topic Match"
                              icon={BookOpen}
                              color="text-blue-600"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Symptom Matches */}
                    {analysisData.references.symptom_matches?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          ⚠️ Symptom Matches
                        </h4>
                        <div className="space-y-2">
                          {analysisData.references.symptom_matches.map((match, idx) => (
                            <ReferenceItem
                              key={idx}
                              match={match}
                              matchType="Symptom Match"
                              icon={AlertTriangle}
                              color="text-orange-600"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    No knowledge base references found for this session.
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* SUBSECTION 2: CLIENT RECOMMENDATIONS */}
            <AccordionItem value="recommendations" className="border border-gray-200 rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold">Client Recommendations</span>
                  {hasRecommendations && (
                    <Badge variant="outline" className="ml-2">
                      {analysisData.recommendations.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {hasRecommendations ? (
                  <div className="space-y-3">
                    {[...analysisData.recommendations]
                      .sort((a, b) => {
                        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                      })
                      .map((rec, idx) => {
                        const isAdded = addedRecommendations.has(rec.text);
                        return (
                          <div key={idx} className="p-4 border-2 border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isAdded}
                                onChange={() => !isAdded && handleAddRecommendation(rec)}
                                disabled={isAdded}
                                className="mt-1 w-4 h-4 cursor-pointer"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <p className="text-base font-medium text-gray-900">{rec.text}</p>
                                  <div className="flex gap-2 flex-shrink-0">
                                    <Badge className={categoryColors[rec.category] || categoryColors.Other}>
                                      {rec.category}
                                    </Badge>
                                    <Badge variant="outline" className={priorityColors[rec.priority]}>
                                      {rec.priority}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  <span className="font-medium">Rationale:</span> {rec.rationale}
                                </p>
                                {isAdded && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Added to Plan
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    No recommendations generated.
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* SUBSECTION 3: COACH ACTIONS */}
            <AccordionItem value="actions" className="border border-gray-200 rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold">Coach Actions</span>
                  {hasCoachActions && (
                    <Badge variant="outline" className="ml-2">
                      {analysisData.coach_actions.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {hasCoachActions ? (
                  <div className="space-y-3">
                    {analysisData.coach_actions.map((action, idx) => {
                      const isCompleted = completedActions.has(idx);
                      const actionId = `action-${idx}`;
                      
                      return (
                        <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start gap-3 mb-3">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => handleToggleAction(idx)}
                              className="mt-1 w-4 h-4 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <p className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {action.description}
                                </p>
                                <Badge variant="outline" className={priorityColors[action.priority]}>
                                  {action.priority}
                                </Badge>
                              </div>
                              {action.step_details && (
                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-2">
                                  <p><strong>Step:</strong> {action.step_details.title}</p>
                                  <p><strong>Type:</strong> {action.step_details.type}</p>
                                  <p><strong>Duration:</strong> {action.step_details.duration_days} days</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {action.action_type === 'send_email' && (
                            <Button size="sm" variant="outline" disabled className="w-full" title="Coming soon">
                              <Mail className="w-4 h-4 mr-2" />
                              Draft Email
                            </Button>
                          )}
                          {action.action_type === 'add_journey_step' && (
                            <Button size="sm" variant="outline" disabled className="w-full" title="Coming soon">
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Journey
                            </Button>
                          )}
                          {action.action_type === 'create_task' && (
                            <Button size="sm" variant="outline" disabled className="w-full" title="Coming soon">
                              <CheckSquare className="w-4 h-4 mr-2" />
                              Create Task
                            </Button>
                          )}
                          {action.action_type === 'schedule_call' && (
                            <Button size="sm" variant="outline" disabled className="w-full" title="Coming soon">
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule Call
                            </Button>
                          )}
                          {!['send_email', 'add_journey_step', 'create_task', 'schedule_call'].includes(action.action_type) && (
                            <Button size="sm" variant="outline" disabled className="w-full" title="Coming soon">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    No coach actions suggested.
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      )}
    </Card>
  );
}