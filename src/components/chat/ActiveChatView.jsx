import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ExternalLink } from "lucide-react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ActiveChatView({ 
  conversationId, 
  participantInfo,
  currentUserEmail,
  currentUserRole
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [messageText, setMessageText] = useState("");

  // Fetch messages for this conversation with aggressive real-time polling
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: async () => {
      const allMessages = await base44.entities.Message.list();
      return allMessages
        .filter(m => m.conversation_id === conversationId)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!conversationId,
    refetchInterval: 2000, // Poll every 2 seconds for faster real-time updates
  });

  // Send message mutation with optimistic update
  const sendMessageMutation = useMutation({
    mutationFn: async (text) => {
      const now = new Date().toISOString();
      
      console.log('Sending message:', {
        conversationId,
        sender: currentUserEmail,
        senderRole: currentUserRole,
        contentLength: text.length
      });
      
      await base44.entities.Message.create({
        conversation_id: conversationId,
        sender: currentUserEmail,
        senderRole: currentUserRole,
        content: text,
        isRead: false,
      });
      
      // Update conversation lastMessage to move it to top
      await base44.entities.Conversation.update(conversationId, {
        lastMessageAt: now,
        lastMessagePreview: text.slice(0, 50),
      });
    },
    onSuccess: () => {
      console.log('Message sent successfully');
      // Immediately refresh all message-related queries
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageText("");
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      alert('Failed to send message: ' + (error.message || 'Unknown error'));
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark messages as read when viewing (optimistic update)
  useEffect(() => {
    if (!conversationId || !currentUserEmail) return;
    
    const markAsRead = async () => {
      const unreadMessages = messages.filter(
        m => !m.isRead && m.sender !== currentUserEmail
      );
      
      if (unreadMessages.length === 0) return;
      
      // Optimistic update - immediately invalidate queries
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Then update in background
      for (const msg of unreadMessages) {
        await base44.entities.Message.update(msg.id, { isRead: true }).catch(() => {});
      }
    };
    
    markAsRead();
  }, [conversationId, currentUserEmail, messages.length]);

  const handleSend = () => {
    const text = messageText.trim();
    if (!text) return;
    
    // Validation before sending
    if (!currentUserEmail) {
      console.error('Cannot send message: currentUserEmail is missing', {
        conversationId,
        currentUserRole,
        text: text.slice(0, 20)
      });
      alert('Unable to send message. Please refresh the page and try again.');
      return;
    }
    
    if (!conversationId) {
      console.error('Cannot send message: conversationId is missing');
      alert('Unable to send message. Please select a conversation.');
      return;
    }
    
    sendMessageMutation.mutate(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleViewProfile = () => {
    if (participantInfo.role === 'client') {
      // Find client ID by email
      base44.entities.Client.list().then(clients => {
        const client = clients.find(c => c.email === participantInfo.email);
        if (client) {
          navigate(createPageUrl('Clients') + '?clientId=' + client.id);
        }
      });
    } else if (participantInfo.role === 'practitioner') {
      navigate(createPageUrl('Practitioners'));
    }
  };

  // Get avatar gradient colors based on role
  const getAvatarGradient = (role) => {
    switch (role) {
      case 'client':
        return 'from-blue-400 to-cyan-500';
      case 'practitioner':
        return 'from-purple-400 to-pink-500';
      case 'coach':
        return 'from-emerald-400 to-teal-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'client':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'practitioner':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'coach':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatMessageTime = (dateString) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const getDateSeparator = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Group messages by date and consecutive sender
  const groupedMessages = messages.reduce((acc, msg, index) => {
    const prevMsg = messages[index - 1];
    const showDateSeparator = !prevMsg || !isSameDay(new Date(msg.created_date), new Date(prevMsg.created_date));
    const isConsecutive = prevMsg && prevMsg.sender === msg.sender && !showDateSeparator;

    acc.push({
      ...msg,
      showDateSeparator,
      isConsecutive,
    });
    return acc;
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient(participantInfo.role)} flex items-center justify-center text-white font-semibold shadow-md`}>
            {participantInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{participantInfo.name}</h2>
              <Badge 
                variant="outline" 
                className={`text-xs capitalize ${getRoleBadgeStyle(participantInfo.role)}`}
              >
                {participantInfo.role}
              </Badge>
            </div>
            {(participantInfo.role === 'client' || participantInfo.role === 'practitioner') && (
              <button
                onClick={handleViewProfile}
                className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
              >
                View Profile
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-gray-50/30 to-white" ref={scrollAreaRef}>
        <div className="space-y-1">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">Loading messages...</div>
          ) : groupedMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            groupedMessages.map((msg, index) => {
              const isOutgoing = msg.sender === currentUserEmail;
              
              return (
                <div key={msg.id} className="animate-in fade-in duration-300">
                  {/* Date Separator */}
                  {msg.showDateSeparator && (
                    <div className="flex items-center justify-center my-6">
                      <div className="bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                        {getDateSeparator(msg.created_date)}
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} ${msg.isConsecutive ? 'mt-1' : 'mt-4'}`}>
                    <div className={`max-w-[70%] ${isOutgoing ? 'items-end' : 'items-start'} flex flex-col`}>
                      {/* Message Content */}
                      <div
                        className={`px-4 py-3 shadow-sm ${
                          isOutgoing
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-[18px] rounded-br-sm'
                            : 'bg-white text-gray-900 rounded-[18px] rounded-bl-sm border border-gray-100'
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      
                      {/* Timestamp */}
                      <span className="text-xs mt-1 text-gray-500 px-1">
                        {formatMessageTime(msg.created_date)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-3 items-end">
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 min-h-[52px] max-h-[120px] resize-none border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-2xl"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 h-[52px] px-5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
}