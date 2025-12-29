import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, RefreshCw, BookOpen, Star, ArrowLeft, Loader2, Sparkles, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function KnowledgeBaseSlider({ isOpen, onClose, currentPageName }) {
  const [objectType, setObjectType] = useState(null);
  const [objectId, setObjectId] = useState(null);
  const [contextLabel, setContextLabel] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [hasAutoAnalyzed, setHasAutoAnalyzed] = useState(false);
  const [contextVersion, setContextVersion] = useState(0);
  const [lastAnalysisCost, setLastAnalysisCost] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch the current object to check its updated_date
  const { data: currentObject } = useQuery({
    queryKey: ['kbObject', objectType, objectId],
    queryFn: async () => {
      if (!objectType || !objectId || objectType === 'system') return null;
      
      let entityName;
      if (objectType === 'client') entityName = 'Client';
      else if (objectType === 'session') entityName = 'Session';
      else if (objectType === 'journey') entityName = 'ClientJourney';
      else if (objectType === 'note') entityName = 'Note';
      else return null;
      
      const results = await base44.entities[entityName].filter({ id: objectId });
      return results[0] || null;
    },
    enabled: !!objectType && !!objectId && objectType !== 'system' && isOpen
  });

  // Fetch cached analysis (skip for system type)
  const { data: cachedAnalysis, refetch: refetchCache, isLoading: isCacheLoading } = useQuery({
    queryKey: ['kbAnalysisCache', objectType, objectId],
    queryFn: async () => {
      if (!objectType || !objectId || objectType === 'system') return null;
      const cache = await base44.entities.KBAnalysisCache.filter({ 
        objectType, 
        objectId 
      });
      // Get most recent analysis
      if (cache.length > 0) {
        return cache.sort((a, b) => new Date(b.analyzedAt) - new Date(a.analyzedAt))[0];
      }
      return null;
    },
    enabled: !!objectType && !!objectId && objectType !== 'system' && isOpen
  });

  // Check if cache is still valid based on object's updated_date
  const isCacheValid = cachedAnalysis && currentObject && 
    cachedAnalysis.objectUpdatedAt && currentObject.updated_date &&
    new Date(cachedAnalysis.objectUpdatedAt) >= new Date(currentObject.updated_date);

  // Fetch system help articles
  const { data: systemArticles = [], isLoading: isSystemLoading } = useQuery({
    queryKey: ['systemHelpArticles', currentPageName],
    queryFn: async () => {
      const articles = await base44.entities.KnowledgeBase.filter({ category: 'System', is_active: true });
      
      // Filter for Files page to show only Files-related help
      if (currentPageName === 'Files') {
        return articles.filter(a => 
          a.title.toLowerCase().includes('files') || 
          a.title.toLowerCase().includes('resources') ||
          a.tags?.toLowerCase().includes('files')
        );
      }
      
      return articles;
    },
    enabled: objectType === 'system' && isOpen
  });

  // Fetch all KB articles for detail view
  const { data: allKBArticles = [] } = useQuery({
    queryKey: ['kbArticles-slider'],
    queryFn: () => base44.entities.KnowledgeBase.filter({ is_active: true }),
    enabled: isOpen
  });

  // Listen for KB context changes
  useEffect(() => {
    const handleContextChange = () => {
      setContextVersion(v => v + 1);
      setHasAutoAnalyzed(false);
      setSelectedArticle(null);
    };
    
    window.addEventListener('kbContextChanged', handleContextChange);
    return () => window.removeEventListener('kbContextChanged', handleContextChange);
  }, []);

  // Listen for note selection changes in Notebook
  useEffect(() => {
    const handleNoteSelectionChanged = () => {
      setContextVersion(v => v + 1);
      setHasAutoAnalyzed(false);
      setSelectedArticle(null);
    };
    
    window.addEventListener('noteSelectionChanged', handleNoteSelectionChanged);
    return () => window.removeEventListener('noteSelectionChanged', handleNoteSelectionChanged);
  }, []);

  // Listen for KB slider open request
  useEffect(() => {
    const handleOpenKBSlider = () => {
      // Only respond if we're not already open
      if (!isOpen) {
        // The slider will be opened by the FloatingKBButton click handler
        // We just need to ensure context is refreshed
        setContextVersion(v => v + 1);
        setHasAutoAnalyzed(false);
      }
    };
    
    window.addEventListener('openKBSlider', handleOpenKBSlider);
    return () => window.removeEventListener('openKBSlider', handleOpenKBSlider);
  }, [isOpen]);

  // Detect context from URL or page
  useEffect(() => {
    if (!isOpen) {
      setHasAutoAnalyzed(false);
      return;
    }

    const detectContext = async () => {
      // First check if there's a global context set (for components like ClientDetails)
      const globalContext = window.__kbContext || {};
      
      const urlParams = new URLSearchParams(window.location.search);
      const url = window.location.pathname;
      
      // URL pattern detection
      const clientMatch = url.match(/\/clients\/([^\/]+)/);
      const sessionMatch = url.match(/\/sessions\/([^\/]+)/);
      const journeyMatch = url.match(/\/journeys\/([^\/]+)/);
      
      const clientId = globalContext.clientId || urlParams.get('clientId') || clientMatch?.[1];
      const sessionId = globalContext.sessionId || urlParams.get('sessionId') || sessionMatch?.[1];
      const journeyId = globalContext.journeyId || urlParams.get('journeyId') || journeyMatch?.[1];
      const clientJourneyId = globalContext.clientJourneyId || urlParams.get('clientJourneyId');
      const noteId = globalContext.noteId || urlParams.get('noteId');

      // Knowledge Base page - show system help
      if (currentPageName === 'KnowledgeBase') {
        setObjectType('system');
        setObjectId('system');
        setContextLabel('System Help');
        return;
      }

      // Files page - show system help filtered
      if (currentPageName === 'Files') {
        setObjectType('system');
        setObjectId('system');
        setContextLabel('Files & Resources Help');
        return;
      }

      // PRIORITY 1: Note context (most specific for notebook)
      // Check localStorage for selected note when on Notebook page
      if (currentPageName === 'Notebook') {
        const selectedNoteId = localStorage.getItem('selectedNoteId');
        if (selectedNoteId && selectedNoteId !== '') {
          const note = await base44.entities.Note.filter({ id: selectedNoteId }).then(r => r[0]);
          if (note) {
            setObjectType('note');
            setObjectId(selectedNoteId);
            const preview = note.content.substring(0, 30);
            setContextLabel(`For note: ${preview}${note.content.length > 30 ? '...' : ''}`);
            return;
          }
        }
      }
      
      if (noteId) {
        const note = await base44.entities.Note.filter({ id: noteId }).then(r => r[0]);
        if (note) {
          setObjectType('note');
          setObjectId(noteId);
          const preview = note.content.substring(0, 30);
          setContextLabel(`For note: ${preview}${note.content.length > 30 ? '...' : ''}`);
          return;
        }
      }

      // PRIORITY 2: Session detail page
      if (sessionId) {
        const session = await base44.entities.Session.filter({ id: sessionId }).then(r => r[0]);
        if (session) {
          setObjectType('session');
          setObjectId(sessionId);
          setContextLabel(`For ${session.title}`);
          return;
        }
      }

      // PRIORITY 3: Client journey detail page
      if (clientJourneyId) {
        const clientJourney = await base44.entities.ClientJourney.filter({ id: clientJourneyId }).then(r => r[0]);
        const journey = clientJourney ? await base44.entities.Journey.filter({ id: clientJourney.journey_id }).then(r => r[0]) : null;
        if (journey) {
          setObjectType('journey');
          setObjectId(clientJourneyId);
          setContextLabel(`For ${journey.title}`);
          return;
        }
      }

      // PRIORITY 4: Journey template detail page
      if (journeyId) {
        const journey = await base44.entities.Journey.filter({ id: journeyId }).then(r => r[0]);
        if (journey) {
          setObjectType('journey');
          setObjectId(journeyId);
          setContextLabel(`For ${journey.title}`);
          return;
        }
      }

      // PRIORITY 5: Client detail page
      if (clientId) {
        const client = await base44.entities.Client.filter({ id: clientId }).then(r => r[0]);
        if (client) {
          setObjectType('client');
          setObjectId(clientId);
          setContextLabel(`For ${client.full_name}`);
          return;
        }
      }

      // No object selected
      setObjectType(null);
      setObjectId(null);
      setContextLabel('');
    };

    detectContext();
  }, [isOpen, currentPageName, contextVersion]);

  // Auto-analyze when slider opens with valid context
  useEffect(() => {
    if (!isOpen || !objectType || !objectId || objectType === 'system' || hasAutoAnalyzed) return;
    if (isAnalyzing || isCacheLoading || !currentObject) return;

    // Only analyze if cache is invalid or doesn't exist
    const shouldAnalyze = !isCacheValid;

    if (shouldAnalyze) {
      setHasAutoAnalyzed(true);
      handleAnalyze();
    }
  }, [isOpen, objectType, objectId, isCacheValid, isCacheLoading, hasAutoAnalyzed, currentObject]);

  const handleAnalyze = async (forceRefresh = false) => {
    if (!objectType || !objectId || objectType === 'system') return;

    setIsAnalyzing(true);
    setLastAnalysisCost(null);
    try {
      let response;
      if (objectType === 'client') {
        response = await base44.functions.invoke('analyzeClientKnowledgeBase', { clientId: objectId });
      } else if (objectType === 'session') {
        response = await base44.functions.invoke('analyzeSessionKnowledgeBase', { sessionId: objectId });
      } else if (objectType === 'journey') {
        const globalContext = window.__kbContext || {};
        if (globalContext.clientJourneyId) {
          response = await base44.functions.invoke('analyzeJourneyKnowledgeBase', { 
            clientJourneyId: objectId 
          });
        } else if (globalContext.journeyId) {
          response = await base44.functions.invoke('analyzeJourneyKnowledgeBase', { 
            journeyId: objectId 
          });
        }
      } else if (objectType === 'note') {
        response = await base44.functions.invoke('analyzeNoteKnowledgeBase', { noteId: objectId });
      }

      if (response?.data?.usage) {
        setLastAnalysisCost({
          tokens: response.data.usage.totalTokens,
          cost: response.data.usage.estimatedCost
        });
      }

      await refetchCache();
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };



  const matchedArticles = cachedAnalysis 
    ? (typeof cachedAnalysis.matchedArticles === 'string' 
        ? JSON.parse(cachedAnalysis.matchedArticles) 
        : cachedAnalysis.matchedArticles)
    : [];

  const getRelevanceStars = (score) => {
    const stars = Math.round(score * 5);
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const getArticleDetail = (articleId) => {
    return allKBArticles.find(kb => kb.id === articleId);
  };

  const sliderWidth = selectedArticle ? '750px' : '400px';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 border-l border-gray-200 flex"
        style={{ width: sliderWidth }}
      >
        {/* Main KB List Panel */}
        <div className={`flex flex-col ${selectedArticle ? 'w-[350px]' : 'w-full'} border-r border-gray-200`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Knowledge</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigate(createPageUrl('APIUsage'));
                    onClose();
                  }}
                  className="hover:bg-blue-100 p-1.5 rounded-lg transition-colors"
                  title="View usage stats"
                >
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </button>
                {objectType && objectId && objectType !== 'system' && !isAnalyzing && (
                  <button
                    onClick={() => handleAnalyze(true)}
                    className="hover:bg-blue-100 p-1.5 rounded-lg transition-colors"
                    title="Force refresh analysis"
                  >
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                  </button>
                )}
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
              {!objectType || !objectId ? (
                <div className="text-center py-12 px-6">
                  <div className="mb-6">
                    <div className="text-5xl mb-4">📚</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to the Knowledge Base</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Contains articles, guides, and resources to support your coaching practice.
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm font-semibold text-gray-900 mb-3">How it works:</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Select a client, session, journey, or note to see AI-recommended articles relevant to that context</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Recommendations are automatically generated based on the content and data of the selected item</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Results are cached and only refresh when the underlying data changes</span>
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => {
                      navigate(createPageUrl('KnowledgeBase'));
                      onClose();
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse All Articles
                  </Button>
                </div>
              ) : objectType === 'system' ? (
                <>
                  {isSystemLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                      <p className="text-sm text-gray-600">Loading help knowledge...</p>
                    </div>
                  ) : systemArticles.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">No system help knowledge found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 mb-4">System help knowledge to get you started</p>
                      {systemArticles.map(article => (
                        <Card 
                          key={article.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedArticle({ ...article, matchReason: article.summary, recommendedAction: 'Read to learn more about this feature' })}
                        >
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-sm mb-2">{article.title}</h3>
                            <Badge variant="outline" className="mb-2">{article.category}</Badge>
                            <p className="text-xs text-gray-600 line-clamp-2">{article.summary}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {isCacheLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                      <p className="text-sm text-gray-600">Checking for analysis...</p>
                    </div>
                  ) : isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="relative mb-6">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                        <Sparkles className="w-6 h-6 text-yellow-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Analyzing...</p>
                      <p className="text-xs text-gray-500">Finding relevant knowledge</p>
                    </div>
                  ) : !isCacheValid ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="relative mb-6">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                        <Sparkles className="w-6 h-6 text-yellow-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Analyzing...</p>
                      <p className="text-xs text-gray-500">Finding relevant knowledge for this {objectType}</p>
                    </div>
                  ) : (
                    <>
                      {matchedArticles.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm font-medium text-gray-700 mb-1">No relevant knowledge found</p>
                          <p className="text-xs text-gray-500">No knowledge base articles match this {objectType}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {matchedArticles.map((match, idx) => {
                            const article = getArticleDetail(match.knowledgeBaseId);
                            if (!article) return null;

                            return (
                              <Card 
                                key={idx}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => setSelectedArticle({ ...article, ...match })}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-sm flex-1">{article.title}</h3>
                                    <div className="flex gap-0.5 ml-2">
                                      {getRelevanceStars(match.relevanceScore || 0)}
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="mb-2">{article.category}</Badge>
                                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                    <strong>Why relevant:</strong> {match.matchReason}
                                  </p>
                                  <p className="text-xs text-blue-600 line-clamp-1">
                                    <strong>Action:</strong> {match.recommendedAction}
                                  </p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}

                      {cachedAnalysis && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 text-center">
                            Last updated {formatDistanceToNow(new Date(cachedAnalysis.analyzedAt), { addSuffix: true })}
                          </p>
                          {lastAnalysisCost && (
                            <p className="text-xs text-gray-400 text-center mt-1">
                              Analysis used {lastAnalysisCost.tokens.toLocaleString()} tokens (~${lastAnalysisCost.cost.toFixed(4)})
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Article Detail Panel (stacked) */}
        <AnimatePresence>
          {selectedArticle && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="flex-1 flex flex-col border-l border-gray-200"
            >
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{selectedArticle.title}</h3>
                    <Badge className="mb-2">{selectedArticle.category}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedArticle(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedArticle.relevanceScore && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Relevance Score</p>
                      <div className="flex gap-1">
                        {getRelevanceStars(selectedArticle.relevanceScore)}
                        <span className="text-xs text-blue-700 ml-2">
                          {Math.round(selectedArticle.relevanceScore * 100)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedArticle.matchReason && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-yellow-900 mb-1">Why This Matches</p>
                      <p className="text-sm text-gray-700">{selectedArticle.matchReason}</p>
                    </div>
                  )}

                  {selectedArticle.recommendedAction && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-green-900 mb-1">Recommended Action</p>
                      <p className="text-sm text-gray-700">{selectedArticle.recommendedAction}</p>
                    </div>
                  )}

                  {selectedArticle.matchedTopics && selectedArticle.matchedTopics.length > 0 && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-purple-900 mb-2">Matched Topics</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedArticle.matchedTopics.map((topic, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Full Content</p>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedArticle.content}</p>
                    </div>
                  </div>

                  {selectedArticle.summary && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Summary</p>
                      <p className="text-sm text-gray-600">{selectedArticle.summary}</p>
                    </div>
                  )}

                  {selectedArticle.tags && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedArticle.tags.split(',').map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}