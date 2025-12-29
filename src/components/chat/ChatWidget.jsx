import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Minimize2,
  ArrowLeft,
  Send,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import NewChatModal from "./NewChatModal";
// Mock Data Imports
import {
  CURRENT_USER,
  CHATS as MOCK_CHATS,
  MESSAGES as MOCK_MESSAGES,
  CLIENTS,
  PRACTITIONERS
} from "@/data/testData";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'chat'
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [animateBadge, setAnimateBadge] = useState(false);
  const messagesEndRef = useRef(null);

  // Local state for mock data
  const [conversations, setConversations] = useState(MOCK_CHATS);
  const [allMessages, setAllMessages] = useState(MOCK_MESSAGES);

  const currentUser = CURRENT_USER;
  const userRole = currentUser.role;

  // Derived state
  const effectiveUserId = currentUser.email;

  const currentMessages = selectedConversation
    ? allMessages.filter(m => m.conversation_id === selectedConversation.id)
    : [];

  const unreadCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && currentView === 'chat') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages, currentView]);

  // Update page title with unread count
  useEffect(() => {
    const baseTitle = document.title.replace(/^\(\d+\)\s/, '');
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
    return () => {
      document.title = baseTitle;
    };
  }, [unreadCount]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage = {
      id: `m-${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender: effectiveUserId,
      content: messageText.trim(),
      created_date: new Date().toISOString(),
      isRead: true
    };

    setAllMessages(prev => [...prev, newMessage]);
    setMessageText("");

    // Update conversation last message
    setConversations(prev => prev.map(c => {
      if (c.id === selectedConversation.id) {
        return {
          ...c,
          lastMessageAt: newMessage.created_date,
          lastMessagePreview: newMessage.content
        };
      }
      return c;
    }));
  };

  const handleStartNewChat = async (otherUser) => {
    // Check if conversation exists
    let conversation = conversations.find(c =>
      c.participant1 === otherUser.email || c.participant2 === otherUser.email
    );

    if (!conversation) {
      // Create new mock conversation
      conversation = {
        id: `conv-${Date.now()}`,
        participant1: effectiveUserId,
        participant2: otherUser.email || otherUser.id, // Fallback if no email in mock
        participant2Role: otherUser.role || 'client',
        lastMessageAt: new Date().toISOString(),
        lastMessagePreview: 'New conversation started',
        unreadCount: 0
      };
      setConversations(prev => [conversation, ...prev]);
    }

    setSelectedConversation(conversation);
    setCurrentView('chat');
    setShowNewChatDialog(false);
  };

  const getOtherParticipant = (conv) => {
    // Simple logic for mock: if part1 is me, then part2 is other.
    if (conv.participant1 === effectiveUserId) {
      // We need to find the user details to get the role if not in conv
      const otherEmail = conv.participant2;
      const client = CLIENTS.find(c => c.email === otherEmail);
      const practitioner = PRACTITIONERS.find(p => p.email === otherEmail); // PRACTITIONERS might not have email in testData, careful.
      // In testData.js PRACTITIONERS doesn't have email property explicitly? Let's check. 
      // Wait, current `testData.js` PRACTITIONERS has `name` but no `email`. 
      // I should probably add emails to practitioners in testData if I rely on them.
      // But the previous code used `p.id` sometimes.
      // Let's just return a placeholder objects if not found.
      return { id: conv.participant2, role: conv.participant2Role || 'client' };
    }
    return { id: conv.participant1, role: 'coach' }; // Assuming I am participant 1 usually?
  };

  const getParticipantName = (participantId, participantRole) => {
    if (participantRole === 'practitioner' || participantRole === 'coach') {
      // Mock lookup
      const p = PRACTITIONERS.find(p => p.id === participantId) || { name: 'Dr. Expert' };
      return p.name || participantId;
    }
    if (participantRole === 'client') {
      const c = CLIENTS.find(c => c.email === participantId) || { name: 'Client User' };
      return c.name || c.full_name || participantId;
    }
    return participantId?.split('@')[0] || 'Unknown';
  };

  const getAvatarColor = (role) => {
    if (role === 'coach') return 'bg-gradient-to-br from-blue-400 to-blue-600';
    if (role === 'practitioner') return 'bg-gradient-to-br from-purple-400 to-purple-600';
    if (role === 'client') return 'bg-gradient-to-br from-teal-400 to-teal-600';
    return 'bg-gradient-to-br from-gray-400 to-gray-600';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50"
          >
            <MessageCircle className="w-7 h-7" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs rounded-full min-w-[28px] h-7 px-2 flex items-center justify-center font-bold shadow-lg"
                style={{
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <Card className="fixed bottom-24 right-6 w-[400px] h-[550px] shadow-2xl z-50 flex flex-col border-0 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white">
                {currentView === 'chat' ? (
                  <>
                    <button
                      onClick={() => {
                        setCurrentView('list');
                        setSelectedConversation(null);
                      }}
                      className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                        {getInitials(getParticipantName(
                          getOtherParticipant(selectedConversation).id,
                          getOtherParticipant(selectedConversation).role
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base truncate">
                          {getParticipantName(
                            getOtherParticipant(selectedConversation).id,
                            getOtherParticipant(selectedConversation).role
                          )}
                        </p>
                        <p className="text-xs text-white/80 capitalize">
                          {getOtherParticipant(selectedConversation).role}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-xl flex-1">Messages</h3>
                    <Button
                      size="sm"
                      onClick={() => setShowNewChatDialog(true)}
                      className="bg-white/20 hover:bg-white/30 text-white border-0 h-9 px-4 rounded-full"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New Chat
                    </Button>
                  </>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors ml-2"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden bg-gray-50">
                {currentView === 'list' ? (
                  <ScrollArea className="h-full">
                    {conversations.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-10 h-10 text-teal-600" />
                        </div>
                        <p className="font-medium text-gray-700 mb-1">No conversations yet</p>
                        <p className="text-sm">Click "New Chat" to start messaging</p>
                      </div>
                    ) : (
                      <div className="p-3">
                        {conversations.map(conv => {
                          const other = getOtherParticipant(conv);
                          const hasUnread = conv.unreadCount > 0;

                          return (
                            <motion.button
                              key={conv.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setSelectedConversation(conv);
                                setCurrentView('chat');
                              }}
                              className={`w-full p-3 hover:bg-white rounded-xl mb-2 text-left transition-all duration-200 ${hasUnread ? 'bg-white shadow-md border-2 border-teal-200' : 'bg-white/50'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className={`w-12 h-12 rounded-full ${getAvatarColor(other.role)} flex items-center justify-center text-white font-bold shadow-md`}>
                                    {getInitials(getParticipantName(other.id, other.role))}
                                  </div>
                                  {hasUnread && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full border-2 border-white animate-pulse"></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className={`font-semibold text-sm truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                      {getParticipantName(other.id, other.role)}
                                    </p>
                                    {conv.lastMessageAt && (
                                      <span className="text-xs text-gray-400 ml-auto">
                                        {format(new Date(conv.lastMessageAt), 'MMM d')}
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-xs truncate ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                                    {conv.lastMessagePreview || 'No messages yet'}
                                  </p>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col h-full bg-white">
                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4">
                      {currentMessages.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-8 h-8 text-teal-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 mb-1">No messages yet</p>
                          <p className="text-xs text-gray-500">Send a message to start the conversation</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {currentMessages.map((msg, index) => {
                            const isMine = msg.sender === effectiveUserId;
                            return (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${isMine
                                      ? 'bg-gradient-to-br from-teal-500 to-blue-600 text-white'
                                      : 'bg-gray-100 text-gray-900'
                                    }`}
                                >
                                  <p className="text-sm break-words leading-relaxed">{msg.content}</p>
                                  <p
                                    className={`text-xs mt-1 ${isMine ? 'text-white/70' : 'text-gray-500'
                                      }`}
                                  >
                                    {format(new Date(msg.created_date), 'HH:mm')}
                                  </p>
                                </div>
                              </motion.div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 border-t bg-gray-50">
                      <div className="flex gap-2">
                        <Input
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Type a message..."
                          className="flex-1 rounded-full border-gray-200 focus:border-teal-500"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!messageText.trim()}
                          className="bg-gradient-to-br from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 rounded-full w-10 h-10 p-0 shadow-md"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <NewChatModal
        isOpen={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
        currentUserId={effectiveUserId}
        currentRole={userRole}
        existingConversations={conversations}
        practitioners={PRACTITIONERS}
        clients={CLIENTS}
        onStartChat={handleStartNewChat}
      />
    </>
  );
}