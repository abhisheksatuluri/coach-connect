import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle } from "lucide-react"; // Added CheckCircle import
import { Card, CardContent } from "@/components/ui/card";

import SessionForm from "../components/sessions/SessionForm";
import SessionList from "../components/sessions/SessionList";
import GoogleConnectButton from "../components/sessions/GoogleConnectButton";

export default function Sessions() {
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [user, setUser] = useState(null); // Added user state
  
  const queryClient = useQueryClient();

  // Added useEffect for user loading
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
        // Optionally handle unauthenticated state, e.g., redirect to login
        setUser(null); 
      }
    };
    loadUser();
  }, []);

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-date_time'),
    enabled: !!user, // Only run query if user is loaded
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
    enabled: !!user, // Only run query if user is loaded
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const updatedSession = await base44.entities.Session.update(id, data);
      
      // Update client timestamp for cache invalidation
      if (updatedSession.client_id || data.client_id) {
        const clientId = updatedSession.client_id || data.client_id;
        await base44.entities.Client.update(clientId, {}).catch(() => {});
      }
      
      return updatedSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setShowForm(false);
      setEditingSession(null);
    },
    onError: (error) => { // Added error handling
      console.error("Error updating session:", error);
      alert(`Failed to update session: ${error.message || "Unknown error"}`);
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (id) => base44.entities.Session.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error) => { // Added error handling
      console.error("Error deleting session:", error);
      alert(`Failed to delete session: ${error.message || "Unknown error"}`);
    },
  });

  const handleSubmit = (sessionData) => {
    if (editingSession) {
      updateSessionMutation.mutate({ id: editingSession.id, data: sessionData });
    }
  };

  const handleCreateSuccess = (newSession) => {
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this session?')) {
      deleteSessionMutation.mutate(id);
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
            <p className="text-gray-600 mt-1">Manage your coaching sessions with automatic Google Meet links</p>
          </div>
          <div className="flex gap-3">
            <GoogleConnectButton />
            {user?.google_connected && ( // Conditional rendering for button
              <Button
                onClick={() => {
                  setShowForm(true);
                  setEditingSession(null);
                }}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start a Session
              </Button>
            )}
          </div>
        </div>

        {user?.google_connected && ( // Conditional rendering for card
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" /> {/* Changed icon to CheckCircle */}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">🎉 Google Meet Integration Active!</h3>
                  <p className="text-sm text-gray-700">
                    When you create a session, a Google Calendar event is automatically created with a Meet link, 
                    and your client receives an email invitation. Just click "Start a Session" to get started!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <div className="mb-8">
            <SessionForm
              session={editingSession}
              clients={clients}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingSession(null);
              }}
              onCreateSuccess={handleCreateSuccess}
            />
          </div>
        )}

        <SessionList
          sessions={sessions}
          clients={clients}
          onEdit={(session) => {
            setEditingSession(session);
            setShowForm(true);
          }}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}