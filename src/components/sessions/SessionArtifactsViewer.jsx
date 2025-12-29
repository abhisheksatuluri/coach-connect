import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Sparkles, Video, Loader2, AlertCircle, Info, BookOpen, ArrowDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SessionArtifactsViewer({ sessionId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [artifactData, setArtifactData] = useState({
    transcript: '',
    notes: '',
    recordingEmbedUrl: null,
    hasTranscript: false,
    hasNotes: false,
    hasRecording: false,
    message: null
  });

  const { data: appliedReferences = [] } = useQuery({
    queryKey: ['appliedReferences', sessionId],
    queryFn: () => base44.entities.AppliedReference.filter({ session_id: sessionId }),
  });

  const { data: knowledgeBase = [] } = useQuery({
    queryKey: ['knowledgeBase'],
    queryFn: () => base44.entities.KnowledgeBase.list(),
  });

  useEffect(() => {
    const fetchArtifacts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data } = await base44.functions.invoke('getSessionArtifactContent', {
          sessionId
        });
        
        setArtifactData(data);
      } catch (err) {
        console.error('Error fetching artifacts:', err);
        setError(err.message || 'Failed to load artifacts');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchArtifacts();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading session artifacts...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="w-4 h-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  const formatTranscript = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    const elements = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Check if line is a timestamp
      const timestampMatch = line.match(/^(\d{2}:\d{2}:\d{2})$/);
      
      if (timestampMatch) {
        const timestamp = timestampMatch[1];
        
        // Next line should contain speaker and text
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          const speakerMatch = nextLine.match(/^([^:]+):\s*(.+)$/);
          
          if (speakerMatch) {
            const speaker = speakerMatch[1];
            const text = speakerMatch[2];
            
            elements.push(
              <div key={i} className="mb-4">
                <div className="text-blue-600 text-xs font-bold mb-1 font-mono">
                  {timestamp}
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-base">{speaker}:</span>
                  <span className="text-gray-700 ml-2">{text}</span>
                </div>
              </div>
            );
            i += 2; // Skip both lines
            continue;
          }
        }
      }
      
      // Handle lines with embedded timestamp and speaker
      const embeddedMatch = line.match(/^(\d{2}:\d{2}:\d{2})\s+([^:]+):\s*(.+)$/);
      if (embeddedMatch) {
        const timestamp = embeddedMatch[1];
        const speaker = embeddedMatch[2];
        const text = embeddedMatch[3];
        
        elements.push(
          <div key={i} className="mb-4">
            <div className="text-blue-600 text-xs font-bold mb-1 font-mono">
              {timestamp}
            </div>
            <div>
              <span className="font-bold text-gray-900 text-base">{speaker}:</span>
              <span className="text-gray-700 ml-2">{text}</span>
            </div>
          </div>
        );
        i++;
        continue;
      }
      
      // Regular line without timestamp
      if (line) {
        elements.push(
          <div key={i} className="mb-2 text-gray-700">
            {line}
          </div>
        );
      }
      
      i++;
    }
    
    return elements;
  };

  const formatNotes = (text) => {
    if (!text) return null;
    
    return text.split('\n').map((line, i) => {
      const trimmedLine = line.trim();
      
      // Headings (Summary, Details, Suggested next steps, etc.)
      if (trimmedLine && 
          (trimmedLine.toLowerCase() === 'summary' || 
           trimmedLine.toLowerCase() === 'details' ||
           trimmedLine.toLowerCase().startsWith('suggested next steps') ||
           trimmedLine.toLowerCase().includes('action items') ||
           (trimmedLine.endsWith(':') && !trimmedLine.startsWith('•') && !trimmedLine.startsWith('-')))) {
        return (
          <h3 key={i} className="font-bold text-gray-900 text-lg mt-6 mb-3 first:mt-0">
            {trimmedLine}
          </h3>
        );
      }
      
      // Bullet points
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        const content = trimmedLine.substring(1).trim();
        return (
          <div key={i} className="flex items-start gap-3 mb-3 ml-2">
            <span className="text-purple-600 font-bold mt-1">•</span>
            <span className="text-gray-700 flex-1">{content}</span>
          </div>
        );
      }
      
      // Regular paragraph
      if (trimmedLine) {
        return (
          <p key={i} className="text-gray-700 mb-3 leading-relaxed">
            {trimmedLine}
          </p>
        );
      }
      
      // Empty line for spacing
      return <div key={i} className="h-2"></div>;
    });
  };

  return (
    <Card className="border-purple-200 shadow-lg">
      <CardContent className="p-6">
        {/* Show informational message if provided */}
        {artifactData.message && (
          <Alert className="bg-blue-50 border-blue-200 mb-6">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {artifactData.message}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="transcript" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100">
            <TabsTrigger 
              value="transcript" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Transcript</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="recording" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Recording</span>
            </TabsTrigger>
            <TabsTrigger 
              value="references" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">References</span>
            </TabsTrigger>
          </TabsList>

          {/* TRANSCRIPT TAB */}
          <TabsContent value="transcript">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200 p-5 sm:p-6">
              {artifactData.hasTranscript ? (
                <div 
                  className="max-h-[500px] overflow-y-auto pr-2 sm:pr-4 scroll-smooth"
                  style={{ 
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 #f1f5f9'
                  }}
                >
                  <style>{`
                    .max-h-\\[500px\\]::-webkit-scrollbar {
                      width: 8px;
                    }
                    .max-h-\\[500px\\]::-webkit-scrollbar-track {
                      background: #f1f5f9;
                      border-radius: 4px;
                    }
                    .max-h-\\[500px\\]::-webkit-scrollbar-thumb {
                      background: #cbd5e1;
                      border-radius: 4px;
                    }
                    .max-h-\\[500px\\]::-webkit-scrollbar-thumb:hover {
                      background: #94a3b8;
                    }
                  `}</style>
                  <div className="space-y-4">
                    {formatTranscript(artifactData.transcript)}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">
                    {artifactData.message || 'Transcript not available yet'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {artifactData.message 
                      ? 'Google Meet may not generate transcripts for very short sessions'
                      : 'This content will appear after the meeting is processed'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* NOTES TAB */}
          <TabsContent value="notes">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-5 sm:p-6">
              {artifactData.hasNotes ? (
                <div 
                  className="max-h-[500px] overflow-y-auto pr-2 sm:pr-4 scroll-smooth"
                  style={{ 
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d8b4fe #fae8ff'
                  }}
                >
                  <style>{`
                    .max-h-\\[500px\\]::-webkit-scrollbar {
                      width: 8px;
                    }
                    .max-h-\\[500px\\]::-webkit-scrollbar-track {
                      background: #fae8ff;
                      border-radius: 4px;
                    }
                    .max-h-\\[500px\\]::-webkit-scrollbar-thumb {
                      background: #d8b4fe;
                      border-radius: 4px;
                    }
                    .max-h-\\[500px\\]::-webkit-scrollbar-thumb:hover {
                      background: #c084fc;
                    }
                  `}</style>
                  <div style={{ lineHeight: '1.6' }}>
                    {formatNotes(artifactData.notes)}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Sparkles className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                  <p className="text-purple-900 font-medium mb-2">
                    {artifactData.message || 'Notes not available yet'}
                  </p>
                  <p className="text-sm text-purple-700">
                    {artifactData.message 
                      ? 'Google Meet may not generate notes for very short sessions'
                      : 'This content will appear after the meeting is processed'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* RECORDING TAB */}
          <TabsContent value="recording">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              {artifactData.hasRecording ? (
                <div className="w-full">
                  <div className="relative w-full rounded-lg overflow-hidden shadow-lg bg-black" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={artifactData.recordingEmbedUrl}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Session Recording"
                    ></iframe>
                  </div>
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    💡 Use fullscreen mode for the best viewing experience
                  </p>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">
                    {artifactData.message || 'Recording not available yet'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {artifactData.message 
                      ? 'Google Meet may not generate recordings for very short sessions'
                      : 'This content will appear after the meeting is processed'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* REFERENCES TAB */}
          <TabsContent value="references">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-5 sm:p-6">
              {appliedReferences.length > 0 ? (
                <div className="space-y-6">
                  {appliedReferences
                    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
                    .map((ref, index) => {
                      const kbArticle = knowledgeBase.find(kb => kb.id === ref.knowledge_base_id);
                      const matchedSections = ref.matchedSections ? JSON.parse(ref.matchedSections) : [];
                      
                      const scoreColor = ref.relevanceScore >= 8 
                        ? "bg-green-100 text-green-800 border-green-300" 
                        : ref.relevanceScore >= 5 
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300" 
                        : "bg-red-100 text-red-800 border-red-300";

                      return (
                        <Card key={ref.id} className="bg-white shadow-md border-2 border-blue-200">
                          <CardContent className="p-5">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <Link
                                  to={createPageUrl('KnowledgeBase')}
                                  className="text-xl font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-2 mb-2"
                                >
                                  <BookOpen className="w-5 h-5" />
                                  {kbArticle ? kbArticle.title : 'Knowledge Base Article'}
                                </Link>
                                <p className="text-gray-700 text-sm mb-3">{ref.match_reason}</p>
                              </div>
                              <Badge className={`${scoreColor} border-2 text-base font-bold px-3 py-1`}>
                                {ref.relevanceScore || 'N/A'}/10
                              </Badge>
                            </div>

                            {/* Matched Sections */}
                            {matchedSections.length > 0 && (
                              <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                                  Matched Sections
                                </h4>
                                {matchedSections.map((match, idx) => (
                                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-300">
                                    <div className="flex items-center gap-2 mb-3">
                                      <span className="text-blue-600 font-bold">📍 Match #{idx + 1}</span>
                                      {match.transcriptTimestamp && (
                                        <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                                          {match.transcriptTimestamp}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {/* Transcript Excerpt */}
                                    <div className="mb-3">
                                      <p className="text-xs font-semibold text-gray-600 mb-1">Transcript:</p>
                                      <p className="text-gray-700 italic bg-white p-3 rounded border-l-4 border-blue-400">
                                        "{match.transcriptExcerpt}"
                                      </p>
                                    </div>

                                    {/* Arrow */}
                                    <div className="flex justify-center my-2">
                                      <ArrowDown className="w-5 h-5 text-gray-400" />
                                    </div>

                                    {/* KB Section */}
                                    <div className="mb-3">
                                      <p className="text-xs font-semibold text-gray-600 mb-1">Knowledge Base Section:</p>
                                      <p className="text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                                        {match.kbSection}
                                      </p>
                                    </div>

                                    {/* Match Reason */}
                                    {match.matchReason && (
                                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                        <p className="text-xs font-semibold text-yellow-900 mb-1">Why they match:</p>
                                        <p className="text-sm text-yellow-800">{match.matchReason}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                  <p className="text-blue-900 font-medium mb-2">
                    No knowledge base references yet
                  </p>
                  <p className="text-sm text-blue-700">
                    Generate AI insights to find relevant knowledge base articles
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}