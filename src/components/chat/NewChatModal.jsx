import React, { useState, useMemo } from "react";
import api from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Users, UserCheck, User } from "lucide-react";

export default function NewChatModal({ 
  isOpen, 
  onClose, 
  currentView,
  currentUserEmail,
  clients,
  practitioners,
  conversations,
  onConversationCreated
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const createConversationMutation = useMutation({
    mutationFn: async ({ participant2Email, participant2Role }) => {
      return await api.entities.Conversation.create({
        participant1: currentUserEmail,
        participant1Role: currentView,
        participant2: participant2Email,
        participant2Role: participant2Role,
        lastMessageAt: new Date().toISOString(),
        lastMessagePreview: "",
      });
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      onConversationCreated(newConversation.id);
      onClose();
    },
  });

  const handleSelectPerson = (email, role) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(c => 
      (c.participant1 === currentUserEmail && c.participant2 === email) ||
      (c.participant2 === currentUserEmail && c.participant1 === email)
    );

    if (existingConversation) {
      // Select existing conversation
      onConversationCreated(existingConversation.id);
      onClose();
    } else {
      // Create new conversation
      createConversationMutation.mutate({
        participant2Email: email,
        participant2Role: role,
      });
    }
  };

  // Filter people based on search
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(c => 
      c.full_name?.toLowerCase().includes(query) || 
      c.email?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  const filteredPractitioners = useMemo(() => {
    if (!searchQuery.trim()) return practitioners;
    const query = searchQuery.toLowerCase();
    return practitioners.filter(p => 
      p.name?.toLowerCase().includes(query) || 
      p.email?.toLowerCase().includes(query)
    );
  }, [practitioners, searchQuery]);

  // Mock coaches data (in real app, you'd fetch from User entity)
  const coaches = useMemo(() => {
    // For now, return empty array - in production you'd fetch actual coaches
    return [];
  }, []);

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

  const PersonRow = ({ name, email, role, onClick }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
        {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
      </div>
      <div className="flex-1 text-left">
        <p className="font-semibold text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{email}</p>
      </div>
      <Badge 
        variant="outline" 
        className={`text-xs capitalize ${getRoleBadgeStyle(role)}`}
      >
        {role}
      </Badge>
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* People List */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {/* For Coach View */}
            {currentView === 'coach' && (
              <>
                {/* Clients Section */}
                {filteredClients.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-blue-600" />
                      <h3 className="font-semibold text-sm text-gray-700">Clients</h3>
                      <Badge variant="outline" className="text-xs">{filteredClients.length}</Badge>
                    </div>
                    <div className="space-y-1">
                      {filteredClients.map(client => (
                        <PersonRow
                          key={client.id}
                          name={client.full_name}
                          email={client.email}
                          role="client"
                          onClick={() => handleSelectPerson(client.email, 'client')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Practitioners Section */}
                {filteredPractitioners.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      <h3 className="font-semibold text-sm text-gray-700">Practitioners</h3>
                      <Badge variant="outline" className="text-xs">{filteredPractitioners.length}</Badge>
                    </div>
                    <div className="space-y-1">
                      {filteredPractitioners.map(practitioner => (
                        <PersonRow
                          key={practitioner.id}
                          name={practitioner.name}
                          email={practitioner.email}
                          role="practitioner"
                          onClick={() => handleSelectPerson(practitioner.email, 'practitioner')}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* For Practitioner View */}
            {currentView === 'practitioner' && (
              <>
                {/* Coaches Section */}
                {coaches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-semibold text-sm text-gray-700">Coaches</h3>
                      <Badge variant="outline" className="text-xs">{coaches.length}</Badge>
                    </div>
                    <div className="space-y-1">
                      {coaches.map(coach => (
                        <PersonRow
                          key={coach.id}
                          name={coach.name}
                          email={coach.email}
                          role="coach"
                          onClick={() => handleSelectPerson(coach.email, 'coach')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Practitioners Section */}
                {filteredPractitioners.filter(p => p.email !== currentUserEmail).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      <h3 className="font-semibold text-sm text-gray-700">Practitioners</h3>
                      <Badge variant="outline" className="text-xs">
                        {filteredPractitioners.filter(p => p.email !== currentUserEmail).length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {filteredPractitioners
                        .filter(p => p.email !== currentUserEmail)
                        .map(practitioner => (
                          <PersonRow
                            key={practitioner.id}
                            name={practitioner.name}
                            email={practitioner.email}
                            role="practitioner"
                            onClick={() => handleSelectPerson(practitioner.email, 'practitioner')}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* For Client View */}
            {currentView === 'client' && (
              <>
                {/* Coaches Section */}
                {coaches.length > 0 ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-semibold text-sm text-gray-700">Coaches</h3>
                      <Badge variant="outline" className="text-xs">{coaches.length}</Badge>
                    </div>
                    <div className="space-y-1">
                      {coaches.map(coach => (
                        <PersonRow
                          key={coach.id}
                          name={coach.name}
                          email={coach.email}
                          role="coach"
                          onClick={() => handleSelectPerson(coach.email, 'coach')}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No coaches available to message</p>
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {currentView === 'coach' && filteredClients.length === 0 && filteredPractitioners.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No people found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}