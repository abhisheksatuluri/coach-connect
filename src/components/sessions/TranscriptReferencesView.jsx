import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, X, ExternalLink, Edit, Save, XCircle, Sparkles, Loader2, Video, FileText, Plus, Trash2, CheckCircle, UserCheck, RefreshCw } from "lucide-react";
import PractitionerSelectionModal from "@/components/tasks/PractitionerSelectionModal";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const actionTypeColors = {
  follow_up: { badge: "bg-blue-500", text: "text-blue-800", label: "Follow Up" },
  resource_sharing: { badge: "bg-green-500", text: "text-green-800", label: "Resource Sharing" },
  scheduling: { badge: "bg-purple-500", text: "text-purple-800", label: "Scheduling" },
  documentation: { badge: "bg-gray-500", text: "text-gray-800", label: "Documentation" },
  planning: { badge: "bg-teal-500", text: "text-teal-800", label: "Planning" },
  research: { badge: "bg-orange-500", text: "text-orange-800", label: "Research" },
  coordination: { badge: "bg-pink-500", text: "text-pink-800", label: "Coordination" },
  review: { badge: "bg-yellow-500", text: "text-yellow-800", label: "Review" },
  intervention_setup: { badge: "bg-red-500", text: "text-red-800", label: "Intervention Setup" },
  check_in: { badge: "bg-lime-500", text: "text-lime-800", label: "Check In" }
};

const priorityColors = {
  High: { dot: "bg-red-500", text: "text-red-700" },
  Medium: { dot: "bg-yellow-500", text: "text-yellow-700" },
  Low: { dot: "bg-green-500", text: "text-green-700" }
};

const matchTypeColors = {
  topic_match: { 
    bg: "rgba(59, 130, 246, 0.15)", 
    bgHover: "rgba(59, 130, 246, 0.25)",
    border: "rgb(59, 130, 246)", 
    text: "text-blue-800", 
    badge: "bg-blue-500",
    label: "Topic Match",
    icon: "📚"
  },
  symptom_match: { 
    bg: "rgba(239, 68, 68, 0.15)", 
    bgHover: "rgba(239, 68, 68, 0.25)",
    border: "rgb(239, 68, 68)", 
    text: "text-red-800", 
    badge: "bg-red-500",
    label: "Symptom Match",
    icon: "🔴"
  },
  condition_match: { 
    bg: "rgba(249, 115, 22, 0.15)", 
    bgHover: "rgba(249, 115, 22, 0.25)",
    border: "rgb(249, 115, 22)", 
    text: "text-orange-800", 
    badge: "bg-orange-500",
    label: "Condition Match",
    icon: "🏥"
  },
  behaviour_match: { 
    bg: "rgba(168, 85, 247, 0.15)", 
    bgHover: "rgba(168, 85, 247, 0.25)",
    border: "rgb(168, 85, 247)", 
    text: "text-purple-800", 
    badge: "bg-purple-500",
    label: "Behaviour Match",
    icon: "🎯"
  },
  goal_match: { 
    bg: "rgba(34, 197, 94, 0.15)", 
    bgHover: "rgba(34, 197, 94, 0.25)",
    border: "rgb(34, 197, 94)", 
    text: "text-green-800", 
    badge: "bg-green-500",
    label: "Goal Match",
    icon: "⭐"
  },
  values_match: { 
    bg: "rgba(20, 184, 166, 0.15)", 
    bgHover: "rgba(20, 184, 166, 0.25)",
    border: "rgb(20, 184, 166)", 
    text: "text-teal-800", 
    badge: "bg-teal-500",
    label: "Values Match",
    icon: "💎"
  },
  intervention_match: { 
    bg: "rgba(234, 179, 8, 0.15)", 
    bgHover: "rgba(234, 179, 8, 0.25)",
    border: "rgb(234, 179, 8)", 
    text: "text-yellow-800", 
    badge: "bg-yellow-600",
    label: "Intervention Match",
    icon: "🛠️"
  },
  system_match: { 
    bg: "rgba(236, 72, 153, 0.15)", 
    bgHover: "rgba(236, 72, 153, 0.25)",
    border: "rgb(236, 72, 153)", 
    text: "text-pink-800", 
    badge: "bg-pink-500",
    label: "System Match",
    icon: "🧬"
  },
  emotion_match: { 
    bg: "rgba(6, 182, 212, 0.15)", 
    bgHover: "rgba(6, 182, 212, 0.25)",
    border: "rgb(6, 182, 212)", 
    text: "text-cyan-800", 
    badge: "bg-cyan-500",
    label: "Emotion Match",
    icon: "😊"
  },
  belief_match: { 
    bg: "rgba(107, 114, 128, 0.15)", 
    bgHover: "rgba(107, 114, 128, 0.25)",
    border: "rgb(107, 114, 128)", 
    text: "text-gray-800", 
    badge: "bg-gray-500",
    label: "Belief Match",
    icon: "💭"
  },
  barrier_match: { 
    bg: "rgba(139, 69, 19, 0.15)", 
    bgHover: "rgba(139, 69, 19, 0.25)",
    border: "rgb(139, 69, 19)", 
    text: "text-amber-900", 
    badge: "bg-amber-700",
    label: "Barrier Match",
    icon: "🚧"
  },
  resource_match: { 
    bg: "rgba(132, 204, 22, 0.15)", 
    bgHover: "rgba(132, 204, 22, 0.25)",
    border: "rgb(132, 204, 22)", 
    text: "text-lime-800", 
    badge: "bg-lime-600",
    label: "Resource Match",
    icon: "📎"
  }
};

export default function TranscriptReferencesView({ sessionId }) {
  const [transcript, setTranscript] = useState("");
  const [artifactData, setArtifactData] = useState(null);
  const [selectedKbId, setSelectedKbId] = useState(null);
  const [selectedKbArticle, setSelectedKbArticle] = useState(null);
  const [selectedReference, setSelectedReference] = useState(null);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [hoveredTile, setHoveredTile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingNotes, setIsRegeneratingNotes] = useState(false);
  const [actionTypeFilter, setActionTypeFilter] = useState("all");
  const [editingAction, setEditingAction] = useState(null);
  const [showActionForm, setShowActionForm] = useState(false);
  const [speakerFilter, setSpeakerFilter] = useState("all");
  const [matchTypeFilter, setMatchTypeFilter] = useState("all");
  const [hoveredRef, setHoveredRef] = useState(null);
  const [highlightedExcerpt, setHighlightedExcerpt] = useState(null);
  const [practitionerModalAction, setPractitionerModalAction] = useState(null);
  
  const transcriptRef = useRef(null);
  const referencesRef = useRef(null);
  const highlightRefs = useRef({});
  const refCardRefs = useRef({});

  const queryClient = useQueryClient();

  // Fetch session
  const { data: session } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => base44.entities.Session.get(sessionId)
  });

  // Fetch transcript and artifacts
  useEffect(() => {
    const fetchArtifacts = async () => {
      try {
        // Use edited transcript if available
        if (session?.edited_transcript) {
          setTranscript(session.edited_transcript);
        }
        
        const response = await base44.functions.invoke('getSessionArtifactContent', {
          sessionId: sessionId
        });
        
        setArtifactData(response.data);
        
        if (response.data?.transcript && !session?.edited_transcript) {
          setTranscript(response.data.transcript);
        }
      } catch (error) {
        console.error("Error fetching artifacts:", error);
      }
    };
    fetchArtifacts();
  }, [sessionId, session]);

  // Fetch applied references
  const { data: appliedReferences = [] } = useQuery({
    queryKey: ['applied-references', sessionId],
    queryFn: () => base44.entities.AppliedReference.filter({ session_id: sessionId })
  });

  // Fetch KB articles
  const { data: kbArticles = [] } = useQuery({
    queryKey: ['kb-articles'],
    queryFn: () => base44.entities.KnowledgeBase.list()
  });

  // Fetch actions
  const { data: actions = [] } = useQuery({
    queryKey: ['actions', sessionId],
    queryFn: () => base44.entities.Action.filter({ session_id: sessionId })
  });

  // Save transcript mutation
  const saveTranscriptMutation = useMutation({
    mutationFn: async (newTranscript) => {
      return await base44.entities.Session.update(sessionId, {
        edited_transcript: newTranscript
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      setIsEditing(false);
      setTranscript(editedTranscript);
    }
  });

  // Generate references mutation
  const generateReferencesMutation = useMutation({
    mutationFn: async () => {
      // First, delete existing references
      const existingRefs = await base44.entities.AppliedReference.filter({ 
        session_id: sessionId 
      });
      
      await Promise.all(
        existingRefs.map(ref => base44.entities.AppliedReference.delete(ref.id))
      );
      
      // Then generate new references
      const response = await base44.functions.invoke('generateSessionAnalysis', {
        session_id: sessionId
      });
      
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to generate references');
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['applied-references', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['actions', sessionId] });
      const refCount = data.summary?.relevant_references_saved || 0;
      const actionCount = data.summary?.actions_generated || 0;
      alert(`Generated ${refCount} references and ${actionCount} actions`);
    },
    onError: (error) => {
      alert(`Failed to generate references: ${error.message}`);
    }
  });

  // Action mutations
  const updateActionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Action.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions', sessionId] });
      setEditingAction(null);
    }
  });

  const deleteActionMutation = useMutation({
    mutationFn: (id) => base44.entities.Action.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions', sessionId] });
    }
  });

  const createActionMutation = useMutation({
    mutationFn: (data) => base44.entities.Action.create({
      ...data,
      session_id: sessionId,
      isApplied: false,
      createdAt: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions', sessionId] });
      setShowActionForm(false);
    }
  });

  // Handle edit button
  const handleEdit = () => {
    setEditedTranscript(transcript);
    setIsEditing(true);
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveTranscriptMutation.mutateAsync(editedTranscript);
    } catch (error) {
      alert(`Failed to save transcript: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
    setEditedTranscript("");
  };

  // Handle generate references
  const handleGenerateReferences = async () => {
    if (!confirm('This will clear existing references and generate new ones. Continue?')) {
      return;
    }
    
    setIsGenerating(true);
    try {
      await generateReferencesMutation.mutateAsync();
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle regenerate session notes
  const handleRegenerateNotes = async () => {
    if (!confirm('This will regenerate AI session notes, references, and actions. Continue?')) {
      return;
    }
    
    setIsRegeneratingNotes(true);
    try {
      const response = await base44.functions.invoke('generateSessionAnalysis', {
        session_id: sessionId
      });
      
      if (response.data?.success) {
        queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
        queryClient.invalidateQueries({ queryKey: ['applied-references', sessionId] });
        queryClient.invalidateQueries({ queryKey: ['actions', sessionId] });
        alert(`Session notes regenerated successfully!\n\nGenerated ${response.data.summary?.relevant_references_saved || 0} references and ${response.data.summary?.actions_generated || 0} actions.`);
      } else {
        alert(`Failed to regenerate notes: ${response.data?.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Failed to regenerate notes: ${error.message}`);
    } finally {
      setIsRegeneratingNotes(false);
    }
  };

  // Sort and filter references
  const sortedAndFilteredReferences = [...appliedReferences]
    .filter(ref => {
      // Match Type Filter
      if (matchTypeFilter !== "all" && ref.matchType !== matchTypeFilter) {
        return false;
      }
      
      // Speaker Filter
      if (speakerFilter !== "all") {
        const matches = parseMatchedSections(ref.matchedSections);
        const hasSpeaker = matches.some(match => {
          if (speakerFilter === "client") return match.speaker === "client";
          if (speakerFilter === "coach") return match.speaker === "coach";
          return true;
        });
        if (!hasSpeaker) return false;
      }
      
      return true;
    })
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  // Parse matched sections
  const parseMatchedSections = (matchedSectionsStr) => {
    try {
      return JSON.parse(matchedSectionsStr || '[]');
    } catch {
      return [];
    }
  };

  // Handle highlighting transcript excerpts
  const highlightTranscript = () => {
    if (!transcript) return transcript;

    let highlightedText = transcript;
    const excerpts = [];

    sortedAndFilteredReferences.forEach((ref, refIdx) => {
      const matches = parseMatchedSections(ref.matchedSections);
      matches.forEach((match, matchIdx) => {
        if (match.transcriptExcerpt) {
          excerpts.push({
            excerpt: match.transcriptExcerpt,
            matchType: match.matchType || ref.matchType,
            refId: ref.id,
            matchId: `${ref.id}-${matchIdx}`
          });
        }
      });
    });

    // Sort by length (longest first) to avoid nested replacements
    excerpts.sort((a, b) => b.excerpt.length - a.excerpt.length);

    excerpts.forEach(({ excerpt, matchType, refId, matchId }) => {
      if (!excerpt) return; // Skip if excerpt is undefined/null
      
      const colors = matchTypeColors[matchType] || matchTypeColors.topic_match;
      const escapedExcerpt = excerpt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedExcerpt})`, 'gi');
      
      const matchTypeLabel = matchType ? matchType.replace('_', ' ') : 'match';
      
      highlightedText = highlightedText.replace(regex, (match) => {
        return `<mark 
          class="cursor-pointer transition-all inline"
          style="background-color: ${colors.bg}; border: 2px solid ${colors.border}; padding: 2px 4px; border-radius: 4px; text-decoration: none;"
          onmouseover="this.style.backgroundColor='${colors.bgHover}'"
          onmouseout="this.style.backgroundColor='${colors.bg}'"
          data-ref-id="${refId}"
          data-match-id="${matchId}"
          data-match-type="${matchType || 'topic_match'}"
          title="Match Type: ${matchTypeLabel}"
        >${match}</mark>`;
      });
    });

    return highlightedText;
  };

  // Handle click on highlighted text
  useEffect(() => {
    if (!transcriptRef.current) return;

    const handleHighlightClick = (e) => {
      const mark = e.target.closest('mark');
      if (mark) {
        const refId = mark.getAttribute('data-ref-id');
        const matchId = mark.getAttribute('data-match-id');
        
        setActiveHighlight(matchId);
        
        // Scroll to reference card
        if (refCardRefs.current[refId]) {
          refCardRefs.current[refId].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }
    };

    const transcriptEl = transcriptRef.current;
    transcriptEl.addEventListener('click', handleHighlightClick);

    return () => {
      transcriptEl.removeEventListener('click', handleHighlightClick);
      };
      }, [transcript, sortedAndFilteredReferences]);

  // Handle click on reference card
  const handleReferenceClick = (refId) => {
    // Find first highlight for this reference
    const mark = document.querySelector(`mark[data-ref-id="${refId}"]`);
    if (mark && transcriptRef.current) {
      mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Flash highlight
      mark.classList.add('ring-4', 'ring-yellow-400');
      setTimeout(() => {
        mark.classList.remove('ring-4', 'ring-yellow-400');
      }, 1500);
    }
  };

  // Scroll to specific excerpt in transcript
  const scrollToExcerpt = (excerpt, refId, matchIdx) => {
    if (!transcript || !transcriptRef.current) return;
    
    // Clear previous highlights
    const allMarks = document.querySelectorAll('mark.ring-4');
    allMarks.forEach(mark => {
      mark.classList.remove('ring-4', 'ring-blue-400', 'bg-blue-200');
    });
    
    // Find all marks for this reference and match
    const matchId = `${refId}-${matchIdx}`;
    const mark = document.querySelector(`mark[data-match-id="${matchId}"]`);
    
    if (mark) {
      setHighlightedExcerpt(matchId);
      mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add highlight effect (persistent while hovering)
      mark.classList.add('ring-4', 'ring-blue-400', 'bg-blue-200');
    }
  };

  // Handle reference tile hover
  const handleRefHover = (ref) => {
    setHoveredRef(ref);
    // Don't auto-scroll - let section badges handle scrolling
  };

  // Handle reference tile unhover
  const handleRefUnhover = () => {
    setHoveredRef(null);
    setHighlightedExcerpt(null);
    // Clear any highlights
    const allMarks = document.querySelectorAll('mark.ring-4');
    allMarks.forEach(mark => {
      mark.classList.remove('ring-4', 'ring-blue-400', 'bg-blue-200');
    });
  };

  // Open KB article modal
  const handleViewKbArticle = (kbId) => {
    const article = kbArticles.find(kb => kb.id === kbId);
    if (article) {
      setSelectedKbArticle(article);
    }
  };

  // Open reference detail modal
  const handleOpenReferenceModal = (ref) => {
    setSelectedReference(ref);
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600 bg-green-50";
    if (score >= 5) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  // Filter actions by type
  const filteredActions = actions.filter(action => 
    actionTypeFilter === "all" || action.actionType === actionTypeFilter
  );

  // Handle action checkbox
  const handleActionCheckbox = async (action) => {
    // If action is already applied, just toggle it off
    if (action.isApplied) {
      await updateActionMutation.mutateAsync({
        id: action.id,
        data: {
          isApplied: false,
          appliedAt: null
        }
      });
      return;
    }

    // If action requires approval, open practitioner selection modal
    if (action.requiresApproval) {
      setPractitionerModalAction(action);
      return;
    }

    // Otherwise, proceed with normal acceptance
    await updateActionMutation.mutateAsync({
      id: action.id,
      data: {
        isApplied: true,
        appliedAt: new Date().toISOString()
      }
    });
  };

  // Calculate days overdue
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

  // Handle action delete
  const handleActionDelete = async (actionId) => {
    if (confirm('Delete this action?')) {
      await deleteActionMutation.mutateAsync(actionId);
    }
  };

  if (!transcript) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <p>Loading transcript...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* TOP ACTION BAR */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {session?.notesGeneratedAt && (
            <span>Notes last generated: {format(new Date(session.notesGeneratedAt), 'MMM d, yyyy h:mm a')}</span>
          )}
        </div>
        <Button
          onClick={handleRegenerateNotes}
          disabled={isGenerating || isRegeneratingNotes}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          {isRegeneratingNotes ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Session Notes
            </>
          )}
        </Button>
      </div>

      {/* TOP SECTION - RECORDING & ARTIFACTS */}
      {(artifactData?.hasRecording || artifactData?.hasNotes) && (
        <Card className="mb-6 border-purple-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Recording Player */}
              {artifactData?.hasRecording && (
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-900">Session Recording</span>
                  </div>
                  <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ paddingBottom: '42%' }}>
                    <iframe
                      src={artifactData.recordingEmbedUrl}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Session Recording"
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Artifacts Links */}
              <div className="flex flex-col gap-2">
                {artifactData?.hasNotes && session?.gemini_notes_doc_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://docs.google.com/document/d/${session.gemini_notes_doc_id}/preview`, '_blank')}
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Gemini Notes
                  </Button>
                )}
                {session?.transcript_doc_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://docs.google.com/document/d/${session.transcript_doc_id}/preview`, '_blank')}
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Original Transcript
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* THREE-COLUMN LAYOUT */}
      <div className="flex flex-col lg:flex-row h-auto lg:h-[700px] gap-0">
        {/* LEFT COLUMN - TRANSCRIPT */}
        <Card className="flex flex-col h-[700px] lg:h-full w-full lg:w-[35%]" style={{ marginRight: '0', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Session Transcript</CardTitle>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Transcript
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent 
            ref={transcriptRef}
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
            style={{ paddingRight: '20px', maxHeight: 'calc(700px - 80px)' }}
          >
            {isEditing ? (
              <>
                <Textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  className="flex-1 min-h-[400px] font-mono text-sm"
                  placeholder="Edit transcript content..."
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div 
                  className="prose prose-sm max-w-none whitespace-pre-wrap flex-1"
                  dangerouslySetInnerHTML={{ __html: highlightTranscript() }}
                />
                <div className="border-t pt-3 mt-3 space-y-2">
                  <Button
                    onClick={handleGenerateReferences}
                    disabled={isGenerating || isRegeneratingNotes}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing transcript...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate References & Actions
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleRegenerateNotes}
                    disabled={isGenerating || isRegeneratingNotes}
                    variant="outline"
                    className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    {isRegeneratingNotes ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Regenerating notes...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate Session Notes
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* VERTICAL DIVIDER */}
        <div className="hidden lg:block w-px bg-gray-200 self-stretch"></div>

        {/* MIDDLE COLUMN - REFERENCES */}
        <Card className="flex flex-col h-[700px] lg:h-full w-full lg:w-[40%] mt-4 lg:mt-0" style={{ marginLeft: '0', marginRight: '0', borderRadius: '0', borderLeft: 'none', borderRight: 'none' }}>
          <CardHeader className="border-b space-y-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Knowledge Base References ({sortedAndFilteredReferences.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={speakerFilter} onValueChange={setSpeakerFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by speaker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="client">Client Speech Only</SelectItem>
                  <SelectItem value="coach">Coach Speech Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={matchTypeFilter} onValueChange={setMatchTypeFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Filter by match type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Match Types</SelectItem>
                  <SelectItem value="topic_match">Topic Match</SelectItem>
                  <SelectItem value="symptom_match">Symptom Match</SelectItem>
                  <SelectItem value="condition_match">Condition Match</SelectItem>
                  <SelectItem value="behaviour_match">Behaviour Match</SelectItem>
                  <SelectItem value="goal_match">Goal Match</SelectItem>
                  <SelectItem value="values_match">Values Match</SelectItem>
                  <SelectItem value="intervention_match">Intervention Match</SelectItem>
                  <SelectItem value="system_match">System Match</SelectItem>
                  <SelectItem value="emotion_match">Emotion Match</SelectItem>
                  <SelectItem value="belief_match">Belief Match</SelectItem>
                  <SelectItem value="barrier_match">Barrier Match</SelectItem>
                  <SelectItem value="resource_match">Resource Match</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent 
            ref={referencesRef}
            className="flex-1 overflow-y-auto p-4"
            style={{ paddingLeft: '20px', paddingRight: '20px', maxHeight: 'calc(700px - 140px)' }}
          >
            {sortedAndFilteredReferences.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No knowledge base references found for this session.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {sortedAndFilteredReferences.map((ref) => {
                  const kb = kbArticles.find(article => article.id === ref.knowledge_base_id);
                  const matches = parseMatchedSections(ref.matchedSections);
                  const colors = matchTypeColors[ref.matchType] || matchTypeColors.topic_match;
                  const firstMatch = matches[0];

                  return (
                    <motion.div
                      key={ref.id}
                      ref={(el) => refCardRefs.current[ref.id] = el}
                      className="relative border rounded-lg p-4 hover:shadow-xl transition-shadow cursor-pointer bg-white overflow-hidden"
                      style={{ borderLeft: `4px solid ${colors.border}` }}
                      onClick={(e) => {
                        // Only open modal if not clicking section numbers
                        if (!e.target.closest('.section-link')) {
                          handleOpenReferenceModal(ref);
                        }
                      }}
                      onMouseEnter={() => handleRefHover(ref)}
                      onMouseLeave={handleRefUnhover}
                      initial={false}
                      animate={{
                        height: hoveredRef?.id === ref.id ? 'auto' : 'auto',
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      {/* Compact Tile Content */}
                      <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">
                        {kb?.title || 'Unknown Article'}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${colors.badge} text-white border-0 text-xs flex items-center gap-1`}>
                          <span>{colors.icon}</span>
                          <span>{colors.label}</span>
                        </Badge>
                        <span className={`text-sm font-bold px-2 py-0.5 rounded ${getScoreColor(ref.relevanceScore || 0)}`}>
                          {ref.relevanceScore || 0}/10
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2">
                        {matches.length} matched section{matches.length !== 1 ? 's' : ''} found
                      </p>

                      {/* Expanded Content on Hover */}
                      <AnimatePresence>
                        {hoveredRef?.id === ref.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="border-t border-gray-200 pt-3 mt-2 space-y-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {matches.map((match, idx) => {
                              const matchColors = matchTypeColors[match.matchType] || colors;
                              return (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <button
                                      className="section-link px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        scrollToExcerpt(match.transcriptExcerpt, ref.id, idx);
                                      }}
                                      onMouseEnter={() => scrollToExcerpt(match.transcriptExcerpt, ref.id, idx)}
                                    >
                                      Section {idx + 1}
                                    </button>
                                    <Badge className={`${matchColors.badge} text-white border-0 text-xs flex items-center gap-1`}>
                                      <span>{matchColors.icon}</span>
                                      <span className="text-xs">{matchColors.label}</span>
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-xs text-gray-700 italic line-clamp-3 bg-white p-2 rounded border-l-2 border-blue-400">
                                    "{match.transcriptExcerpt}"
                                  </p>
                                  
                                  {match.speaker && (
                                    <div className="flex items-center gap-1 mt-2">
                                      <Badge variant="outline" className="text-xs bg-white">
                                        {match.speaker === 'coach' ? '🎓 Coach' : '👤 Client'}
                                      </Badge>
                                    </div>
                                  )}
                                </motion.div>
                              );
                            })}
                            
                            <p className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
                              Click tile to view full KB article
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* VERTICAL DIVIDER */}
        <div className="hidden lg:block w-px bg-gray-200 self-stretch"></div>

        {/* RIGHT COLUMN - ACTIONS */}
        <Card className="flex flex-col h-[700px] lg:h-full w-full lg:w-[25%] mt-4 lg:mt-0" style={{ marginLeft: '0', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: 'none' }}>
          <CardHeader className="border-b space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Actions ({filteredActions.length})
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setShowActionForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Action Types</SelectItem>
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
          </CardHeader>
          <CardContent 
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ paddingLeft: '20px', maxHeight: 'calc(700px - 140px)' }}
          >
            {showActionForm && (
              <div className="bg-white border-2 border-emerald-500 rounded-lg p-4 space-y-3 mb-3">
                <h4 className="font-semibold text-gray-900">Create New Action</h4>
                <Input
                  placeholder="Action title"
                  onBlur={(e) => {
                    if (e.target.value) {
                      createActionMutation.mutate({
                        title: e.target.value,
                        status: 'To Do',
                        actionType: 'follow_up'
                      });
                    } else {
                      setShowActionForm(false);
                    }
                  }}
                  autoFocus
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowActionForm(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}

            {filteredActions.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">
                No actions yet
              </p>
            ) : (
              filteredActions.map((action) => {
                const colors = actionTypeColors[action.actionType] || actionTypeColors.follow_up;
                const isEditing = editingAction?.id === action.id;
                const daysOverdue = getDaysOverdue(action.dueDate);

                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      action.isApplied ? 'opacity-70' : ''
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          value={editingAction.title}
                          onChange={(e) => setEditingAction({ ...editingAction, title: e.target.value })}
                          placeholder="Action title"
                          className="font-semibold"
                        />
                        <Textarea
                          value={editingAction.description || ''}
                          onChange={(e) => setEditingAction({ ...editingAction, description: e.target.value })}
                          placeholder="Description"
                          className="text-sm min-h-[80px]"
                        />
                        <Select
                          value={editingAction.actionType}
                          onValueChange={(val) => setEditingAction({ ...editingAction, actionType: val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Action type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(actionTypeColors).map(type => (
                              <SelectItem key={type} value={type}>
                                {actionTypeColors[type].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={editingAction.priority || 'none'}
                          onValueChange={(val) => setEditingAction({ ...editingAction, priority: val === 'none' ? null : val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Priority</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Due Date</label>
                          <Input
                            type="date"
                            value={editingAction.dueDate || ''}
                            onChange={(e) => setEditingAction({ ...editingAction, dueDate: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              updateActionMutation.mutate({
                                id: editingAction.id,
                                data: editingAction
                              });
                            }}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingAction(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActionDelete(action.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <h4 className={`font-semibold text-base ${
                              action.isApplied ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {action.title}
                            </h4>
                            {action.requiresApproval && !action.isApplied && (
                              <div className="flex items-center gap-1 mt-1">
                                <UserCheck className="w-3 h-3 text-amber-600" />
                                <span className="text-xs text-amber-600 font-medium">
                                  Requires {action.requiredSpecialty} approval
                                </span>
                                {action.approvalStatus === 'Pending' && (
                                  <Badge className="ml-1 bg-amber-100 text-amber-700 text-xs px-1.5 py-0">
                                    Pending
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleActionCheckbox(action)}
                            className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110"
                            style={{
                              borderColor: action.isApplied ? '#10b981' : action.requiresApproval ? '#f59e0b' : '#d1d5db',
                              backgroundColor: action.isApplied ? '#10b981' : 'transparent'
                            }}
                            title={action.requiresApproval && !action.isApplied ? `Request ${action.requiredSpecialty} approval` : undefined}
                          >
                            {action.isApplied ? (
                              <CheckCircle className="w-4 h-4 text-white" fill="white" />
                            ) : action.requiresApproval ? (
                              <Plus className="w-4 h-4 text-amber-600" />
                            ) : null}
                          </button>
                        </div>

                        <div className={`text-xs mb-2 ${
                          action.isApplied ? 'line-through text-gray-400' : 'text-gray-600'
                        }`}>
                          {colors.label}
                          {action.priority && ` • ${action.priority} Priority`}
                          {action.dueDate && (
                            <>
                              {' • Due '}
                              {format(new Date(action.dueDate), 'MMM d, yyyy')}
                              {!action.isApplied && daysOverdue > 0 && (
                                <span className="text-red-600 font-semibold ml-1">
                                  ({daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue)
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {!action.isApplied && action.description && (
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-gray-700 line-clamp-3 flex-1">
                              {action.description}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingAction(action)}
                              className="flex-shrink-0 h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}

                        {action.isApplied && action.appliedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Completed on {format(new Date(action.appliedAt), 'MMM d, yyyy')}
                          </p>
                        )}
                      </>
                    )}
                  </motion.div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Practitioner Selection Modal */}
      {practitionerModalAction && (
        <PractitionerSelectionModal
          action={practitionerModalAction}
          onClose={() => setPractitionerModalAction(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['actions', sessionId] });
          }}
        />
      )}

      {/* Reference Detail Modal */}
      <AnimatePresence>
        {selectedReference && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedReference(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const kb = kbArticles.find(article => article.id === selectedReference.knowledge_base_id);
                const matches = parseMatchedSections(selectedReference.matchedSections);
                const colors = matchTypeColors[selectedReference.matchType] || matchTypeColors.topic_match;

                return (
                  <>
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold mb-2">{kb?.title || 'Knowledge Base Article'}</h2>
                          <div className="flex items-center gap-2">
                            <Badge className={`${colors.badge} text-white border-0 flex items-center gap-1`}>
                              <span>{colors.icon}</span>
                              <span>{colors.label}</span>
                            </Badge>
                            <Badge className="bg-white/20 text-white border-0">
                              {kb?.category}
                            </Badge>
                            <span className="text-white/90 text-sm">
                              Relevance: {selectedReference.relevanceScore || 0}/10
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedReference(null)}
                          className="text-white hover:bg-white/20"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Modal Body - Two Column Layout */}
                    <div className="flex-1 overflow-hidden flex">
                      {/* Left: KB Article Content */}
                      <div className="flex-1 overflow-y-auto p-6 border-r">
                        {kb?.summary && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                            <p className="text-sm font-semibold text-blue-900 mb-2">Summary</p>
                            <p className="text-gray-700">{kb.summary}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-semibold text-gray-900 mb-3">Full Content</p>
                          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
                            {kb?.content}
                          </div>
                        </div>
                      </div>

                      {/* Right: Matched Sections */}
                      <div className="w-2/5 overflow-y-auto p-6 bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Matched Sections ({matches.length})
                        </h3>
                        
                        <div className="space-y-4">
                          {matches.map((match, idx) => {
                            const matchColors = matchTypeColors[match.matchType] || colors;
                            return (
                              <div 
                                key={idx}
                                className="bg-white rounded-lg p-4 border-2 shadow-sm"
                                style={{ borderColor: matchColors.border }}
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge className={`${matchColors.badge} text-white border-0 text-xs flex items-center gap-1`}>
                                    <span>{matchColors.icon}</span>
                                    <span>Section {idx + 1}</span>
                                  </Badge>
                                  {match.transcriptTimestamp && (
                                    <span className="text-xs text-gray-500">
                                      {match.transcriptTimestamp}
                                    </span>
                                  )}
                                </div>

                                {/* KB Section */}
                                <div className="mb-3">
                                  <p className="text-xs font-semibold text-gray-600 mb-1">KB Section:</p>
                                  <p 
                                    className="text-sm font-medium p-2 rounded"
                                    style={{ 
                                      backgroundColor: matchColors.bg,
                                      borderLeft: `3px solid ${matchColors.border}`
                                    }}
                                  >
                                    {match.kbSection}
                                  </p>
                                </div>

                                {/* Transcript Excerpt */}
                                <div className="mb-3">
                                  <p className="text-xs font-semibold text-gray-600 mb-1">Transcript Excerpt:</p>
                                  <p className="text-sm text-gray-700 italic bg-gray-50 p-2 rounded border-l-3">
                                    "{match.transcriptExcerpt}"
                                  </p>
                                </div>

                                {/* Match Reason */}
                                {match.matchReason && (
                                  <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                                    <p className="text-xs font-semibold text-yellow-900 mb-1">Why they match:</p>
                                    <p className="text-xs text-yellow-800">{match.matchReason}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}