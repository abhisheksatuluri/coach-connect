import React, { useState, useMemo, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, ExternalLink } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ClientChatSection({ clientId, clientEmail }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [messageText, setMessageText] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list(),
    enabled: !!currentUser,
  });

  const { data: allMessages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date'),
    enabled: !!currentUser,
  });

  // Find conversation with this client
  const conversation = useMemo(() => {
    if (!currentUser || !clientEmail) return null;
    return conversations.find(c => 
      (c.participant1 === currentUser.email && c.participant2 === clientEmail) ||
      (c.participant2 === currentUser.email && c.participant1 === clientEmail)
    );
  }, [conversations, currentUser, clientEmail]);

  // Get recent messages (last 15)
  const recentMessages = useMemo(() => {
    if (!conversation) return [];
    return allMessages
      .filter(m => m.conversation_id === conversation.id)
      .slice(0, 15)
      .reverse(); // Oldest first for display
  }, [allMessages, conversation]);

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Conversation.create({
        participant1: currentUser.email,
        participant1Role: 'coach',
        participant2: clientEmail,
        participant2Role: 'client',
        lastMessageAt: new Date().toISOString(),
        lastMessagePreview: "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text) => {
      if (!conversation) return;
      
      await base44.entities.Message.create({
        conversation_id: conversation.id,
        sender: currentUser.email,
        senderRole: 'coach',
        content: text,
        isRead: false,
      });
      
      await base44.entities.Conversation.update(conversation.id, {
        lastMessageAt: new Date().toISOString(),
        lastMessagePreview: text.slice(0, 50),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageText("");
    },
  });

  const handleStartConversation = () => {
    createConversationMutation.mutate();
  };

  const handleSend = () => {
    const text = messageText.trim();
    if (!text) return;
    sendMessageMutation.mutate(text);
  };

  const handleViewFullConversation = () => {
    navigate(createPageUrl('Chats'));
    // Store conversation ID to select it on the Chats page
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('selectConversation', { detail: conversation.id }));
    }, 100);
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday ' + format(date, 'h:mm a');
    return format(date, 'MMM d, h:mm a');
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && !isCollapsed) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [recentMessages, isCollapsed]);

  // Check if current view is coach
  const currentView = localStorage.getItem('currentView') || 'coach';
  if (currentView !== 'coach') return null;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader 
        className="cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            💬 Messages
            {conversation && recentMessages.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {recentMessages.length}
              </Badge>
            )}
          </CardTitle>
          <span className="text-sm text-gray-500">
            {isCollapsed ? 'Click to expand' : 'Click to collapse'}
          </span>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="p-6">
          {!conversation ? (
            // No conversation exists
            <div className="text-center py-8">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No messages yet with this client</p>
              <Button
                onClick={handleStartConversation}
                disabled={createConversationMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Conversation
              </Button>
            </div>
          ) : (
            // Conversation exists
            <div className="space-y-4">
              {/* Recent Messages */}
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                {recentMessages.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No messages yet. Start the conversation below!
                  </div>
                ) : (
                  recentMessages.map((msg) => {
                    const isOutgoing = msg.sender === currentUser?.email;
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${isOutgoing ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div
                            className={`px-3 py-2 rounded-lg text-sm ${
                              isOutgoing
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            {formatMessageTime(msg.created_date)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* View Full Conversation Link */}
              <div className="flex justify-center pt-2 border-t border-gray-100">
                <button
                  onClick={handleViewFullConversation}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 font-medium"
                >
                  View Full Conversation
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Quick Reply Input */}
              <div className="flex gap-2 pt-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a quick message..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}