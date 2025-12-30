import React, { useState } from "react";
import api from '../api/api';
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, MapIcon } from "lucide-react";

import JourneyTemplateGrid from "../components/journeys/JourneyTemplateGrid";
import ClientJourneyTable from "../components/journeys/ClientJourneyTable";

export default function JourneysPage() {
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  const { data: journeyTemplates = [] } = useQuery({
    queryKey: ['journeyTemplates'],
    queryFn: () => api.entities.Journey.filter({ is_template: true }),
  });

  const { data: clientJourneys = [] } = useQuery({
    queryKey: ['clientJourneys'],
    queryFn: () => api.entities.ClientJourney.list('-started_at'),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list(),
  });

  const { data: journeySteps = [] } = useQuery({
    queryKey: ['journeySteps'],
    queryFn: () => api.entities.JourneyStep.list('order_number'),
  });

  const isAdmin = user?.role === 'admin';

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <MapIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Coaching Journeys</h1>
              <p className="text-gray-600 mt-1">Manage programs and client progress</p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={() => alert('Create journey template - to be implemented')}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Journey Template
            </Button>
          )}
        </div>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="templates">
              Journey Templates ({journeyTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="clients">
              Client Journeys ({clientJourneys.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <JourneyTemplateGrid
              templates={journeyTemplates}
              journeySteps={journeySteps}
              clients={clients}
              isAdmin={isAdmin}
            />
          </TabsContent>

          <TabsContent value="clients">
            <ClientJourneyTable
              clientJourneys={clientJourneys}
              clients={clients}
              journeyTemplates={journeyTemplates}
              journeySteps={journeySteps}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}