import React, { useState } from "react";
import api from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronDown, ChevronUp, BookOpen, Tag, AlertTriangle, 
  Target, CheckCircle, ExternalLink, Loader2
} from "lucide-react";
import { format } from "date-fns";

const priorityColors = {
  High: "bg-red-100 text-red-800 border-red-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Low: "bg-blue-100 text-blue-800 border-blue-200"
};

const categoryColors = {
  Nutrition: "bg-orange-100 text-orange-800",
  Exercise: "bg-green-100 text-green-800",
  Sleep: "bg-purple-100 text-purple-800",
  "Behavior Change": "bg-blue-100 text-blue-800",
  Mindset: "bg-pink-100 text-pink-800",
  Hydration: "bg-cyan-100 text-cyan-800",
  "Stress Management": "bg-amber-100 text-amber-800",
  Other: "bg-gray-100 text-gray-800"
};

function CollapsibleSection({ title, icon: Icon, defaultOpen = true, count, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="border-2">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="w-5 h-5" />
            {title}
            {count !== undefined && (
              <Badge variant="outline" className="ml-2">
                {count}
              </Badge>
            )}
          </CardTitle>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </CardHeader>
      {isOpen && <CardContent className="pt-6">{children}</CardContent>}
    </Card>
  );
}

export default function AIInsightsDisplay({ insights, sessionId, clientId }) {
  const [selectedRefs, setSelectedRefs] = useState(new Set());
  const [selectedRecs, setSelectedRecs] = useState(new Set());
  const [selectedActions, setSelectedActions] = useState(new Set());
  
  const [appliedRefs, setAppliedRefs] = useState(new Set());
  const [addedRecs, setAddedRecs] = useState(new Set());
  const [doneActions, setDoneActions] = useState(new Set());
  
  const queryClient = useQueryClient();

  const applyReferencesMutation = useMutation({
    mutationFn: async (references) => {
      const user = await api.auth.me();
      const promises = references.map(ref => 
        api.entities.AppliedReference.create({
          client_id: clientId,
          session_id: sessionId,
          knowledge_base_id: ref.kb_id,
          match_type: ref.match_type,
          match_reason: ref.match_reason,
          applied_at: new Date().toISOString(),
          applied_by: user.email
        })
      );
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  const addRecommendationsMutation = useMutation({
    mutationFn: async (recommendations) => {
      const user = await api.auth.me();
      const promises = recommendations.map(rec => 
        api.entities.ClientRecommendation.create({
          client_id: clientId,
          session_id: sessionId,
          recommendation_text: rec.text,
          category: rec.category,
          priority: rec.priority,
          source: "AI Generated",
          status: "Not Started",
          applied_at: new Date().toISOString(),
          applied_by: user.email,
          coach_notes: `Rationale: ${rec.rationale}`
        })
      );
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  const toggleRefSelection = (refId) => {
    const newSelected = new Set(selectedRefs);
    if (newSelected.has(refId)) {
      newSelected.delete(refId);
    } else {
      newSelected.add(refId);
    }
    setSelectedRefs(newSelected);
  };

  const toggleRecSelection = (recId) => {
    const newSelected = new Set(selectedRecs);
    if (newSelected.has(recId)) {
      newSelected.delete(recId);
    } else {
      newSelected.add(recId);
    }
    setSelectedRecs(newSelected);
  };

  const toggleActionSelection = (actionId) => {
    const newSelected = new Set(selectedActions);
    if (newSelected.has(actionId)) {
      newSelected.delete(actionId);
    } else {
      newSelected.add(actionId);
    }
    setSelectedActions(newSelected);
  };

  const handleApplyReferences = async () => {
    // References are already saved by generateSessionAnalysis, no need to apply again
    alert('References are already saved to the database');
    return;

    try {
      await applyReferencesMutation.mutateAsync(refsToApply);
      
      selectedRefs.forEach(refId => {
        setAppliedRefs(prev => new Set([...prev, refId]));
      });
      setSelectedRefs(new Set());
      
      alert(`${refsToApply.length} reference${refsToApply.length > 1 ? 's' : ''} applied`);
    } catch (error) {
      alert(`Failed to apply references: ${error.message}`);
    }
  };

  const handleAddRecommendations = async () => {
    const recommendations = insights.recommendations || [];
    const recsToAdd = [];
    
    recommendations.forEach((rec, idx) => {
      const recId = `rec-${idx}`;
      if (selectedRecs.has(recId)) {
        recsToAdd.push({
          text: rec.text,
          category: rec.category,
          priority: rec.priority,
          rationale: rec.rationale
        });
      }
    });

    if (recsToAdd.length === 0) return;

    try {
      await addRecommendationsMutation.mutateAsync(recsToAdd);
      
      selectedRecs.forEach(recId => {
        setAddedRecs(prev => new Set([...prev, recId]));
      });
      setSelectedRecs(new Set());
      
      alert(`${recsToAdd.length} recommendation${recsToAdd.length > 1 ? 's' : ''} added to client's plan`);
    } catch (error) {
      alert(`Failed to add recommendations: ${error.message}`);
    }
  };

  const handleMarkActionsComplete = () => {
    selectedActions.forEach(actionId => {
      setDoneActions(prev => new Set([...prev, actionId]));
    });
    
    const count = selectedActions.size;
    setSelectedActions(new Set());
    alert(`${count} action${count > 1 ? 's' : ''} marked complete`);
  };

  const references = insights.references || [];
  const recommendations = insights.recommendations || [];
  const coachActions = insights.coach_actions || [];

  const totalRefs = references.length;

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-purple-600" />
          AI Insights
        </CardTitle>
        <p className="text-sm text-gray-600">
          Generated on {format(new Date(), 'MMM d, yyyy h:mm a')}
        </p>
        <div className="flex gap-3 mt-3">
          <Badge variant="outline" className="bg-white">
            📚 {totalRefs} References
          </Badge>
          <Badge variant="outline" className="bg-white">
            💊 {recommendations.length} Recommendations
          </Badge>
          <Badge variant="outline" className="bg-white">
            📋 {coachActions.length} Coach Actions
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SECTION 1: REFERENCES */}
        <CollapsibleSection 
          title="Knowledge Base References" 
          icon={BookOpen} 
          count={totalRefs}
        >
          {totalRefs === 0 ? (
            <p className="text-gray-500 text-center py-4">No knowledge base references found</p>
          ) : (
            <>
              <div className="space-y-3">
                {references.map((ref, idx) => {
                  const scoreColor = ref.relevanceScore >= 8 
                    ? "bg-green-100 text-green-800 border-green-300" 
                    : ref.relevanceScore >= 5 
                    ? "bg-yellow-100 text-yellow-800 border-yellow-300" 
                    : "bg-red-100 text-red-800 border-red-300";
                  
                  return (
                    <div key={idx} className="p-4 bg-white border-2 border-blue-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap flex-1">
                          <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="font-semibold text-gray-900">{ref.kb_title}</span>
                        </div>
                        <Badge className={`${scoreColor} border-2 font-bold`}>
                          {ref.relevanceScore}/10
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Match Reason:</span> {ref.matchReason}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  ℹ️ References are automatically saved to the session. View detailed matches in the <strong>References</strong> tab.
                </p>
              </div>
            </>
          )}
        </CollapsibleSection>

        {/* SECTION 2: RECOMMENDATIONS */}
        <CollapsibleSection 
          title="Client Recommendations" 
          icon={Target} 
          count={recommendations.length}
        >
          {recommendations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recommendations generated</p>
          ) : (
            <>
              <div className="space-y-3">
                {sortedRecommendations.map((rec, idx) => {
                  const recId = `rec-${idx}`;
                  const isSelected = selectedRecs.has(recId);
                  const isAdded = addedRecs.has(recId);
                  return (
                    <div key={idx} className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => !isAdded && toggleRecSelection(recId)}
                          className="mt-1"
                          disabled={isAdded}
                        />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-lg mb-2">{rec.text}</p>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {rec.category && (
                              <Badge className={categoryColors[rec.category] || categoryColors.Other}>
                                {rec.category}
                              </Badge>
                            )}
                            {rec.priority && (
                              <Badge variant="outline" className={priorityColors[rec.priority]}>
                                {rec.priority} Priority
                              </Badge>
                            )}
                            {isAdded && (
                              <Badge className="bg-green-100 text-green-800">
                                ✅ Added to Plan
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Rationale:</span> {rec.rationale}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <Button
                  onClick={handleAddRecommendations}
                  disabled={selectedRecs.size === 0 || addRecommendationsMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {addRecommendationsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      ✓ Add Selected to Client's Plan ({selectedRecs.size} selected)
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CollapsibleSection>

        {/* SECTION 3: COACH ACTIONS */}
        <CollapsibleSection 
          title="Coach Actions" 
          icon={CheckCircle} 
          count={coachActions.length}
        >
          {coachActions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No coach actions suggested</p>
          ) : (
            <>
              <div className="space-y-3">
                {coachActions.map((action, idx) => {
                  const actionId = `action-${idx}`;
                  const isSelected = selectedActions.has(actionId);
                  const isDone = doneActions.has(actionId);
                  return (
                    <div key={idx} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => !isDone && toggleActionSelection(actionId)}
                          className="mt-1"
                          disabled={isDone}
                        />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 mb-2">{action.description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {action.action_type && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-800">
                                {action.action_type.replace('_', ' ')}
                              </Badge>
                            )}
                            {action.priority && (
                              <Badge variant="outline" className={priorityColors[action.priority]}>
                                {action.priority}
                              </Badge>
                            )}
                            {isDone && (
                              <Badge className="bg-green-100 text-green-800">
                                ✅ Done
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <Button
                  onClick={handleMarkActionsComplete}
                  disabled={selectedActions.size === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  ✓ Mark Selected as Done ({selectedActions.size} selected)
                </Button>
              </div>
            </>
          )}
        </CollapsibleSection>
      </CardContent>
    </Card>
  );
}