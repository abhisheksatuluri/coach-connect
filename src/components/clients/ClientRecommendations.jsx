import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2, Circle, BookOpen, ExternalLink, Trash2, ChevronDown, ChevronUp
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

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

export default function ClientRecommendations({ client, sessions }) {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const queryClient = useQueryClient();

  const { data: recommendations = [] } = useQuery({
    queryKey: ['clientRecommendations', client.id],
    queryFn: () => base44.entities.ClientRecommendation.filter({ client_id: client.id }),
  });

  const { data: appliedReferences = [] } = useQuery({
    queryKey: ['appliedReferences', client.id],
    queryFn: () => base44.entities.AppliedReference.filter({ client_id: client.id }),
  });

  const { data: knowledgeBaseArticles = [] } = useQuery({
    queryKey: ['knowledgeBase'],
    queryFn: () => base44.entities.KnowledgeBase.list(),
  });

  const updateRecommendationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ClientRecommendation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientRecommendations', client.id] });
    },
  });

  const deleteRecommendationMutation = useMutation({
    mutationFn: (id) => base44.entities.ClientRecommendation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientRecommendations', client.id] });
    },
  });

  const handleMarkComplete = (rec) => {
    updateRecommendationMutation.mutate({
      id: rec.id,
      data: {
        status: "Completed",
        completed_at: new Date().toISOString()
      }
    });
  };

  const handleUpdateNotes = (recId, notes) => {
    updateRecommendationMutation.mutate({
      id: recId,
      data: { coach_notes: notes }
    });
  };

  const handleRemove = (recId) => {
    if (confirm('Remove this recommendation?')) {
      deleteRecommendationMutation.mutate(recId);
    }
  };

  const getSessionTitle = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    return session ? session.title : 'Unknown Session';
  };

  const getSessionDate = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    return session?.date_time ? format(new Date(session.date_time), 'MMM d, yyyy') : '';
  };

  const getKBArticle = (kbId) => {
    return knowledgeBaseArticles.find(kb => kb.id === kbId);
  };

  // Filter recommendations
  const activeRecs = recommendations
    .filter(r => r.status === "Active" || r.status === "Not Started")
    .filter(r => categoryFilter === "All" || r.category === categoryFilter)
    .filter(r => priorityFilter === "All" || r.priority === priorityFilter)
    .sort((a, b) => {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.applied_at) - new Date(a.applied_at);
    });

  const completedRecs = recommendations
    .filter(r => r.status === "Completed")
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

  const displayedCompletedRecs = showAllCompleted ? completedRecs : completedRecs.slice(0, 10);

  // Group applied references by knowledge base article
  const groupedReferences = appliedReferences.reduce((acc, ref) => {
    if (!acc[ref.knowledge_base_id]) {
      acc[ref.knowledge_base_id] = {
        kb_id: ref.knowledge_base_id,
        sessions: [],
        match_types: new Set()
      };
    }
    acc[ref.knowledge_base_id].sessions.push({
      session_id: ref.session_id,
      applied_at: ref.applied_at,
      match_type: ref.match_type
    });
    acc[ref.knowledge_base_id].match_types.add(ref.match_type);
    return acc;
  }, {});

  const referencesList = Object.values(groupedReferences).map(ref => ({
    ...ref,
    sessions: ref.sessions.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
  }));

  // Calculate stats
  const totalRecs = recommendations.length;
  const completedCount = completedRecs.length;
  const activeCount = activeRecs.length;
  const completionRate = totalRecs > 0 ? Math.round((completedCount / totalRecs) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalRecs}</p>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
            <p className="text-sm text-gray-600">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{completionRate}%</p>
            <p className="text-sm text-gray-600">Completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Nutrition">Nutrition</SelectItem>
                  <SelectItem value="Exercise">Exercise</SelectItem>
                  <SelectItem value="Sleep">Sleep</SelectItem>
                  <SelectItem value="Behavior Change">Behavior Change</SelectItem>
                  <SelectItem value="Mindset">Mindset</SelectItem>
                  <SelectItem value="Hydration">Hydration</SelectItem>
                  <SelectItem value="Stress Management">Stress Management</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 1: ACTIVE RECOMMENDATIONS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Active Recommendations ({activeRecs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeRecs.length > 0 ? (
            activeRecs.map((rec) => (
              <Card key={rec.id} className="border-2 border-gray-200">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {rec.status === "Not Started" ? (
                        <Circle className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-medium text-gray-900 mb-2">{rec.recommendation_text}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={categoryColors[rec.category] || categoryColors.Other}>
                          {rec.category}
                        </Badge>
                        <Badge variant="outline" className={priorityColors[rec.priority]}>
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline" className={rec.status === "Not Started" ? "bg-yellow-50" : "bg-blue-50"}>
                          {rec.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        From session:{" "}
                        <Link
                          to={createPageUrl('Sessions')}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {getSessionTitle(rec.session_id)}
                        </Link>
                        {" "}on {getSessionDate(rec.session_id)}
                      </p>
                      <div className="mb-3">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Coach Notes</label>
                        <Textarea
                          defaultValue={rec.coach_notes || ""}
                          onBlur={(e) => handleUpdateNotes(rec.id, e.target.value)}
                          placeholder="Add notes about this recommendation..."
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleMarkComplete(rec)}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark Complete
                        </Button>
                        <Button
                          onClick={() => handleRemove(rec.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Circle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>No active recommendations. AI will generate recommendations after coaching sessions.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: COMPLETED RECOMMENDATIONS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Completed Recommendations ({completedRecs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {completedRecs.length > 0 ? (
            <>
              {displayedCompletedRecs.map((rec) => (
                <Accordion key={rec.id} type="single" collapsible>
                  <AccordionItem value={rec.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{rec.recommendation_text}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-sm text-gray-600">
                              Completed on: {format(new Date(rec.completed_at), 'MMM d, yyyy')}
                            </span>
                            <span className="text-sm text-gray-600">•</span>
                            <Link
                              to={createPageUrl('Sessions')}
                              className="text-sm text-blue-600 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              From: {getSessionTitle(rec.session_id)}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-3">
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Badge className={categoryColors[rec.category] || categoryColors.Other}>
                            {rec.category}
                          </Badge>
                          <Badge variant="outline" className={priorityColors[rec.priority]}>
                            {rec.priority}
                          </Badge>
                        </div>
                        {rec.coach_notes && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-1">Coach Notes:</p>
                            <p className="text-sm text-gray-600">{rec.coach_notes}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
              {completedRecs.length > 10 && !showAllCompleted && (
                <Button
                  onClick={() => setShowAllCompleted(true)}
                  variant="outline"
                  className="w-full"
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show All ({completedRecs.length})
                </Button>
              )}
              {showAllCompleted && completedRecs.length > 10 && (
                <Button
                  onClick={() => setShowAllCompleted(false)}
                  variant="outline"
                  className="w-full"
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Show Less
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>No completed recommendations yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 3: KNOWLEDGE BASE REFERENCES */}
      <Accordion type="single" collapsible>
        <AccordionItem value="references" className="border rounded-lg bg-gray-50">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">📚 Knowledge Base Articles ({referencesList.length} articles referenced)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {referencesList.length > 0 ? (
              <div className="space-y-3">
                {referencesList.map((ref) => {
                  const article = getKBArticle(ref.kb_id);
                  return (
                    <div key={ref.kb_id} className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <BookOpen className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <Link
                            to={createPageUrl('KnowledgeBase')}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 mb-1"
                          >
                            {article ? article.title : `Knowledge Base Article (ID: ${ref.kb_id})`}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <p className="text-sm text-gray-600 mb-2">
                            Referenced in {ref.sessions.length} session{ref.sessions.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-gray-600">
                            Most recent:{" "}
                            <Link
                              to={createPageUrl('Sessions')}
                              className="text-blue-600 hover:underline"
                            >
                              {getSessionTitle(ref.sessions[0].session_id)}
                            </Link>
                            {" "}on {format(new Date(ref.sessions[0].applied_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No knowledge base references applied yet.</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}