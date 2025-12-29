import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Search, Circle, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import ActiveChatView from "@/components/chat/ActiveChatView";
import NewChatModal from "@/components/chat/NewChatModal";

export default function ChatsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Get current view from localStorage
  const currentView = localStorage.getItem('currentView') || 'coach';
  
  // Get the viewing identity based on current view
  const viewingAsPractitionerId = localStorage.getItem('viewingAsPractitionerId');
  const viewingAsClientId = localStorage.getItem('viewingAsClientId');

  // Fetch conversations with real-time polling (every 5 seconds on Chats page)
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list('-lastMessageAt'),
    enabled: !!currentUser,
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  // Fetch messages with real-time polling
  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date'),
    enabled: !!currentUser,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Fetch clients for names
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
    enabled: !!currentUser,
  });

  // Fetch practitioners for names
  const { data: practitioners = [] } = useQuery({
    queryKey: ['practitioners'],
    queryFn: () => base44.entities.Practitioner.list(),
    enabled: !!currentUser,
  });

  // Get current user's email based on view
  const currentUserEmail = useMemo(() => {
    if (currentView === 'coach') {
      return currentUser?.email;
    } else if (currentView === 'practitioner' && viewingAsPractitionerId) {
      const practitioner = practitioners.find(p => p.id === viewingAsPractitionerId);
      return practitioner?.email;
    } else if (currentView === 'client' && viewingAsClientId) {
      const client = clients.find(c => c.id === viewingAsClientId);
      return client?.email;
    }
    return currentUser?.email;
  }, [currentView, currentUser, viewingAsPractitionerId, viewingAsClientId, practitioners, clients]);

  // Filter conversations for current user
  const myConversations = useMemo(() => {
    if (!currentUserEmail) return [];
    
    return conversations
      .filter(c => c.participant1 === currentUserEmail || c.participant2 === currentUserEmail)
      .sort((a, b) => {
        // Sort by lastMessageAt descending (most recent first)
        const dateA = a.lastMessageAt ? new Date(a.lastMessageAt) : new Date(0);
        const dateB = b.lastMessageAt ? new Date(b.lastMessageAt) : new Date(0);
        return dateB - dateA;
      });
  }, [conversations, currentUserEmail]);

  // Get participant details
  const getParticipantInfo = (conversation) => {
    if (!currentUserEmail) return null;
    
    const otherParticipantEmail = conversation.participant1 === currentUserEmail 
      ? conversation.participant2 
      : conversation.participant1;
    
    const otherParticipantRole = conversation.participant1 === currentUserEmail
      ? conversation.participant2Role
      : conversation.participant1Role;

    let name = otherParticipantEmail;
    
    // Try to find full name based on role
    if (otherParticipantRole === 'client') {
      const client = clients.find(c => c.email === otherParticipantEmail);
      if (client) name = client.full_name;
    } else if (otherParticipantRole === 'practitioner') {
      const practitioner = practitioners.find(p => p.email === otherParticipantEmail);
      if (practitioner) name = practitioner.name;
    } else if (otherParticipantRole === 'coach') {
      // For coaches, use the email or try to find in user list
      // For now, just use the email or a default coach name
      name = otherParticipantEmail.split('@')[0]; // Use part before @ as name
    }

    return {
      email: otherParticipantEmail,
      name,
      role: otherParticipantRole,
    };
  };

  // Get unread count for a conversation
  const getUnreadCount = (conversationId) => {
    if (!currentUserEmail) return 0;
    return messages.filter(
      msg => msg.conversation_id === conversationId && 
      !msg.isRead && 
      msg.sender !== currentUserEmail
    ).length;
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

  // Get role badge styling
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

  // Format timestamp
  const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    if (isToday(date)) {
      const minutesAgo = Math.floor((new Date() - date) / 1000 / 60);
      if (minutesAgo < 1) return 'Just now';
      if (minutesAgo < 60) return `${minutesAgo}m ago`;
      return format(date, 'h:mm a');
    }
    
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    
    return format(date, 'MMM d');
  };

  // Filter conversations by tab
  const tabFilteredConversations = useMemo(() => {
    if (activeTab === 'all') return myConversations;
    
    return myConversations.filter(conv => {
      const participantInfo = getParticipantInfo(conv);
      if (!participantInfo) return false;
      
      if (currentView === 'coach') {
        if (activeTab === 'clients') return participantInfo.role === 'client';
        if (activeTab === 'practitioners') return participantInfo.role === 'practitioner';
      } else if (currentView === 'practitioner') {
        if (activeTab === 'coaches') return participantInfo.role === 'coach';
        if (activeTab === 'practitioners') return participantInfo.role === 'practitioner';
      } else if (currentView === 'client') {
        if (activeTab === 'coaches') return participantInfo.role === 'coach';
      }
      
      return true;
    });
  }, [myConversations, activeTab, currentView]);

  // Search filtered conversations (real-time, case-insensitive)
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return tabFilteredConversations;
    
    const query = searchQuery.toLowerCase();
    return tabFilteredConversations.filter(conv => {
      const participantInfo = getParticipantInfo(conv);
      if (!participantInfo) return false;
      return participantInfo.name.toLowerCase().includes(query) ||
             participantInfo.email.toLowerCase().includes(query);
    });
  }, [tabFilteredConversations, searchQuery]);

  // Calculate unread counts per tab
  const tabUnreadCounts = useMemo(() => {
    const counts = { all: 0, clients: 0, practitioners: 0, coaches: 0 };
    
    myConversations.forEach(conv => {
      const unread = getUnreadCount(conv.id);
      if (unread > 0) {
        counts.all += unread;
        const participantInfo = getParticipantInfo(conv);
        if (participantInfo?.role === 'client') counts.clients += unread;
        if (participantInfo?.role === 'practitioner') counts.practitioners += unread;
        if (participantInfo?.role === 'coach') counts.coaches += unread;
      }
    });
    
    return counts;
  }, [myConversations, messages]);

  // Define tabs based on current view
  const tabs = useMemo(() => {
    if (currentView === 'coach') {
      return [
        { value: 'all', label: 'All', count: tabUnreadCounts.all },
        { value: 'clients', label: 'Clients', count: tabUnreadCounts.clients },
        { value: 'practitioners', label: 'Practitioners', count: tabUnreadCounts.practitioners },
      ];
    } else if (currentView === 'practitioner') {
      return [
        { value: 'all', label: 'All', count: tabUnreadCounts.all },
        { value: 'coaches', label: 'Coaches', count: tabUnreadCounts.coaches },
        { value: 'practitioners', label: 'Practitioners', count: tabUnreadCounts.practitioners },
      ];
    } else {
      return [
        { value: 'coaches', label: 'Coaches', count: tabUnreadCounts.coaches },
      ];
    }
  }, [currentView, tabUnreadCounts]);

  return (
    <div className="h-screen flex flex-col">
      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN - Conversation List */}
        <div className="w-[350px] flex flex-col border-r border-gray-200 bg-white">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-emerald-600" />
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              </div>
              <Button
                onClick={() => setIsNewChatModalOpen(true)}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          {/* Tabs */}
          {tabs.length > 1 && (
            <div className="px-4 pt-3 border-b border-gray-200">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full bg-transparent h-auto p-0 space-x-4">
                  {tabs.map(tab => (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value}
                      className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:bg-transparent rounded-none px-0 pb-2 transition-all duration-200"
                    >
                      <span className={activeTab === tab.value ? 'font-bold text-gray-900' : 'text-gray-600'}>
                        {tab.label}
                        {tab.count > 0 && ` (${tab.count})`}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Conversation List */}
          <ScrollArea className="flex-1">
            <div className="divide-y divide-gray-100">
              {filteredConversations.length > 0 ? (
                filteredConversations.map(conversation => {
                  const participantInfo = getParticipantInfo(conversation);
                  const unreadCount = getUnreadCount(conversation.id);
                  const isSelected = selectedConversationId === conversation.id;
                  
                  if (!participantInfo) return null;
                  
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full p-4 flex gap-3 hover:bg-purple-50/50 transition-all duration-200 border-l-4 ${
                        isSelected 
                          ? 'bg-purple-50 border-purple-500 shadow-sm' 
                          : 'border-transparent'
                      } ${unreadCount > 0 ? 'bg-blue-50/40' : ''}`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient(participantInfo.role)} flex items-center justify-center text-white font-semibold shadow-md`}>
                          {participantInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold text-gray-900 truncate ${unreadCount > 0 ? 'font-bold' : ''}`}>
                            {participantInfo.name}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs capitalize flex-shrink-0 ${getRoleBadgeStyle(participantInfo.role)}`}
                          >
                            {participantInfo.role}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-gray-600 truncate flex-1">
                            {conversation.lastMessagePreview || 'No messages yet'}
                          </p>
                          {conversation.lastMessageAt && (
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTimestamp(conversation.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        
                        {/* Unread indicator */}
                        {unreadCount > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1">
                              <Circle className="w-2 h-2 fill-blue-500 text-blue-500 animate-pulse" />
                              <span className="text-xs font-bold text-blue-600">
                                {unreadCount} new
                              </span>
                            </div>
                            <div className="ml-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] px-2 flex items-center justify-center shadow-md">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* RIGHT COLUMN - Chat View */}
        {!selectedConversationId ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Select a conversation to start messaging
              </h3>
              <p className="text-gray-500">
                Choose from your conversations on the left
              </p>
            </div>
          </div>
        ) : (
          <ActiveChatView
            conversationId={selectedConversationId}
            participantInfo={getParticipantInfo(myConversations.find(c => c.id === selectedConversationId))}
            currentUserEmail={currentUserEmail}
            currentUserRole={currentView}
          />
        )}

        {/* New Chat Modal */}
        <NewChatModal
          isOpen={isNewChatModalOpen}
          onClose={() => setIsNewChatModalOpen(false)}
          currentView={currentView}
          currentUserEmail={currentUserEmail}
          clients={clients}
          practitioners={practitioners}
          conversations={conversations}
          onConversationCreated={(conversationId) => {
            setSelectedConversationId(conversationId);
            setIsNewChatModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}