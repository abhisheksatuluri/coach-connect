import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, BookOpen, Tag, AlertTriangle, Plus, Edit, 
  Mail, CheckSquare, ChevronDown, ChevronUp, ExternalLink, RefreshCw, ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200"
};

function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <h4 className="font-semibold text-gray-900">{title}</h4>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

export default function AISessionInsights({ client, sessions }) {
  const [expandedContent, setExpandedContent] = useState({});
  const queryClient = useQueryClient();

  // Parse AI data
  let references = null;
  let recommendations = null;

  try {
    if (client.ai_references) {
      references = typeof client.ai_references === 'string' 
        ? JSON.parse(client.ai_references) 
        : client.ai_references;
    }
  } catch (e) {
    console.error('Error parsing ai_references:', e);
  }

  try {
    if (client.ai_recommendations) {
      recommendations = typeof client.ai_recommendations === 'string'
        ? JSON.parse(client.ai_recommendations)
        : client.ai_recommendations;
    }
  } catch (e) {
    console.error('Error parsing ai_recommendations:', e);
  }

  // Get session info
  const session = sessions?.find(s => s.id === client.ai_session_id);

  // Find latest completed session for regeneration
  const latestCompletedSession = sessions
    ?.filter(s => s.status === 'completed' && s.client_id === client.id)
    ?.sort((a, b) => new Date(b.date_time) - new Date(a.date_time))[0];

  const regenerateAnalysisMutation = useMutation({
    mutationFn: async () => {
      if (!latestCompletedSession) {
        throw new Error('No completed sessions found');
      }
      
      const response = await base44.functions.invoke('generateSessionAnalysis', {
        session_id: latestCompletedSession.id
      });
      
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to generate analysis');
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      alert('AI analysis regenerated successfully!');
    },
    onError: (error) => {
      alert(`Failed to regenerate analysis: ${error.message}`);
    }
  });

  const toggleContent = (id) => {
    setExpandedContent(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const hasAnyData = references || recommendations;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-xl mb-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
              AI Session Insights
            </CardTitle>
            
            {/* Metadata Bar */}
            {hasAnyData ? (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="space-y-1 text-sm">
                    {client.ai_generated_at && (
                      <p className="text-gray-700">
                        <strong>Last generated:</strong>{' '}
                        {format(new Date(client.ai_generated_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    )}
                    {session && (
                      <p className="text-gray-700">
                        <strong>From session:</strong>{' '}
                        <Link 
                          to={createPageUrl('Sessions')} 
                          className="text-purple-600 hover:text-purple-700 underline font-medium"
                        >
                          {session.title}
                        </Link>
                      </p>
                    )}
                  </div>
                  
                  {latestCompletedSession && (
                    <Button
                      onClick={() => regenerateAnalysisMutation.mutate()}
                      disabled={regenerateAnalysisMutation.isPending}
                      size="sm"
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-100 whitespace-nowrap"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${regenerateAnalysisMutation.isPending ? 'animate-spin' : ''}`} />
                      {regenerateAnalysisMutation.isPending ? 'Regenerating...' : 'Regenerate Analysis'}
                    </Button>
                  )}
                </div>
              </div>
            ) : latestCompletedSession && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-blue-900">
                    Generate AI insights from completed sessions to see references and recommendations.
                  </p>
                  <Button
                    onClick={() => regenerateAnalysisMutation.mutate()}
                    disabled={regenerateAnalysisMutation.isPending}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${regenerateAnalysisMutation.isPending ? 'animate-spin' : ''}`} />
                    {regenerateAnalysisMutation.isPending ? 'Generating...' : 'Generate Analysis'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="references" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="references">
              <BookOpen className="w-4 h-4 mr-2" />
              References
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <CheckSquare className="w-4 h-4 mr-2" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          {/* TAB 1 - REFERENCES */}
          <TabsContent value="references" className="space-y-6">
            {references && (
              references.keyword_matches?.length > 0 || 
              references.topic_matches?.length > 0 || 
              references.symptom_matches?.length > 0
            ) ? (
              <>
                {/* Keyword Matches */}
                {references.keyword_matches && references.keyword_matches.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      🔑 Keyword Matches
                    </h3>
                    <div className="space-y-2">
                      {references.keyword_matches.map((match, idx) => (
                        <div key={idx} className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-2">
                            <Tag className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">"{match.keyword}"</span>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                <span className="text-purple-600 hover:text-purple-700 cursor-pointer font-medium">
                                  {match.kb_title}
                                </span>
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Reason:</span> {match.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Topic Matches */}
                {references.topic_matches && references.topic_matches.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      📚 Topic Matches
                    </h3>
                    <div className="space-y-2">
                      {references.topic_matches.map((match, idx) => (
                        <div key={idx} className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-2">
                            <BookOpen className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">"{match.topic}"</span>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                                  {match.kb_title}
                                </span>
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Reason:</span> {match.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Symptom Matches */}
                {references.symptom_matches && references.symptom_matches.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      ⚠️ Symptom Matches
                    </h3>
                    <div className="space-y-2">
                      {references.symptom_matches.map((match, idx) => (
                        <div key={idx} className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">"{match.symptom}"</span>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                <span className="text-orange-600 hover:text-orange-700 cursor-pointer font-medium">
                                  {match.kb_title}
                                </span>
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Reason:</span> {match.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  No knowledge base references yet. Complete a coaching session to get AI-matched articles.
                </p>
              </div>
            )}
          </TabsContent>

          {/* TAB 2 - RECOMMENDATIONS */}
          <TabsContent value="recommendations" className="space-y-6">
            {recommendations && (
              recommendations.clarifications?.length > 0 ||
              recommendations.journey_amendments?.length > 0 ||
              recommendations.communications?.length > 0 ||
              recommendations.other_actions?.length > 0
            ) ? (
              <>
                {/* SECTION A - CLARIFICATIONS */}
                {recommendations.clarifications && recommendations.clarifications.length > 0 && (
                  <CollapsibleSection 
                    title={`💬 Clarifications & Discussion (${recommendations.clarifications.length})`}
                    defaultOpen={true}
                  >
                    <div className="space-y-3">
                      {recommendations.clarifications.map((item, idx) => (
                        <div key={idx} className="p-3 border border-gray-200 rounded-lg flex items-start gap-3">
                          <CheckSquare className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <p className="font-medium text-gray-900">{item.question}</p>
                              {item.priority && (
                                <Badge variant="outline" className={priorityColors[item.priority]}>
                                  {item.priority}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{item.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}

                {/* SECTION B - JOURNEY AMENDMENTS */}
                {recommendations.journey_amendments && recommendations.journey_amendments.length > 0 && (
                  <CollapsibleSection 
                    title={`🗺️ Journey Amendments (${recommendations.journey_amendments.length})`}
                    defaultOpen={true}
                  >
                    <div className="space-y-3">
                      {recommendations.journey_amendments.map((item, idx) => (
                        <div key={idx} className="p-4 border-2 border-emerald-200 rounded-lg bg-emerald-50">
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-emerald-600 text-white">
                                {item.action_type?.replace('_', ' ')}
                              </Badge>
                              {item.priority && (
                                <Badge variant="outline" className={priorityColors[item.priority]}>
                                  {item.priority}
                                </Badge>
                              )}
                            </div>
                            
                            {item.action_type === 'ADD_STEP' && (
                              <>
                                <p className="font-semibold text-gray-900 mb-1">
                                  Add: {item.step_title}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                  Position: {item.suggested_position} • Type: {item.step_type}
                                </p>
                                <p className="text-sm text-gray-700 mb-2">{item.step_description}</p>
                              </>
                            )}
                            
                            {item.action_type === 'CHANGE_STEP' && (
                              <>
                                <p className="font-semibold text-gray-900 mb-1">
                                  Modify: {item.current_step}
                                </p>
                                <p className="text-sm text-gray-700 mb-2">
                                  <strong>Suggested change:</strong> {item.suggested_change}
                                </p>
                              </>
                            )}
                            
                            {item.action_type === 'REMOVE_STEP' && (
                              <>
                                <p className="font-semibold text-gray-900 mb-1">
                                  Remove: {item.step_to_remove}
                                </p>
                              </>
                            )}
                            
                            <p className="text-sm text-gray-600 italic">
                              <strong>Reason:</strong> {item.reason}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700 w-full"
                            onClick={() => alert('Journey amendment action - to be implemented')}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Apply to Journey
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}

                {/* SECTION C - COMMUNICATIONS */}
                {recommendations.communications && recommendations.communications.length > 0 && (
                  <CollapsibleSection 
                    title={`📧 Communications (${recommendations.communications.length})`}
                    defaultOpen={true}
                  >
                    <div className="space-y-3">
                      {recommendations.communications.map((item, idx) => (
                        <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="bg-blue-50">
                                {item.type}
                              </Badge>
                              {item.priority && (
                                <Badge variant="outline" className={priorityColors[item.priority]}>
                                  {item.priority}
                                </Badge>
                              )}
                              {item.when && (
                                <span className="text-xs text-gray-500">{item.when}</span>
                              )}
                            </div>
                            <p className="font-semibold text-gray-900 mb-2">{item.subject}</p>
                            
                            {item.suggested_content && (
                              <div className="text-sm text-gray-700">
                                {expandedContent[`comm-${idx}`] ? (
                                  <p>{item.suggested_content}</p>
                                ) : (
                                  <p>
                                    {item.suggested_content.substring(0, 100)}
                                    {item.suggested_content.length > 100 && '...'}
                                  </p>
                                )}
                                {item.suggested_content.length > 100 && (
                                  <button
                                    onClick={() => toggleContent(`comm-${idx}`)}
                                    className="text-blue-600 hover:text-blue-700 text-xs mt-1"
                                  >
                                    {expandedContent[`comm-${idx}`] ? 'Show less' : 'Read more'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full"
                            onClick={() => alert(`Draft ${item.type} - to be implemented`)}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Draft {item.type === 'email' ? 'Email' : 'Message'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}

                {/* SECTION D - OTHER ACTIONS */}
                {recommendations.other_actions && recommendations.other_actions.length > 0 && (
                  <CollapsibleSection 
                    title={`⚡ Other Actions (${recommendations.other_actions.length})`}
                    defaultOpen={false}
                  >
                    <div className="space-y-3">
                      {recommendations.other_actions.map((item, idx) => (
                        <div key={idx} className="p-3 border border-gray-200 rounded-lg">
                          <div className="mb-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                {item.action_type?.replace('_', ' ')}
                              </Badge>
                              {item.priority && (
                                <Badge variant="outline" className={priorityColors[item.priority]}>
                                  {item.priority}
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium text-gray-900 mb-1">{item.task_title || item.action_title}</p>
                            <p className="text-sm text-gray-600">{item.task_description || item.description}</p>
                            {item.due_date && (
                              <p className="text-xs text-gray-500 mt-1">Due: {item.due_date}</p>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full"
                            onClick={() => alert('Action - to be implemented')}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {item.action_type === 'create_task' && 'Create Task'}
                            {item.action_type === 'update_goal' && 'Update Goal'}
                            {item.action_type === 'flag_client' && 'Add Flag'}
                            {!item.action_type && 'Take Action'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  No recommendations yet. Complete a coaching session to get AI-powered action items.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}