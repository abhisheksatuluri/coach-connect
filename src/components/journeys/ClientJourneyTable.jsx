import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Eye, MapPin } from "lucide-react";
import { format } from "date-fns";

import JourneyProgressView from "./JourneyProgressView";

const statusColors = {
  "Active": "bg-green-100 text-green-800 border-green-200",
  "Paused": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Completed": "bg-blue-100 text-blue-800 border-blue-200",
  "Cancelled": "bg-gray-100 text-gray-800 border-gray-200"
};

export default function ClientJourneyTable({ clientJourneys, clients, journeyTemplates, journeySteps }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClientJourney, setSelectedClientJourney] = useState(null);

  const getClientName = (clientId) => {
    return clients.find(c => c.id === clientId)?.full_name || 'Unknown';
  };

  const getJourneyTitle = (journeyId) => {
    return journeyTemplates.find(j => j.id === journeyId)?.title || 'Unknown Journey';
  };

  const getTotalSteps = (journeyId) => {
    return journeySteps.filter(s => s.journey_id === journeyId).length;
  };

  const filteredJourneys = clientJourneys.filter(cj => {
    const matchesStatus = statusFilter === "all" || cj.status === statusFilter;
    const clientName = getClientName(cj.client_id).toLowerCase();
    const journeyTitle = getJourneyTitle(cj.journey_id).toLowerCase();
    const matchesSearch = !searchQuery || 
      clientName.includes(searchQuery.toLowerCase()) ||
      journeyTitle.includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (clientJourneys.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No client journeys yet</h3>
          <p className="text-gray-600">Assign journey templates to clients to get started.</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedClientJourney) {
    return (
      <JourneyProgressView
        clientJourney={selectedClientJourney}
        client={clients.find(c => c.id === selectedClientJourney.client_id)}
        journey={journeyTemplates.find(j => j.id === selectedClientJourney.journey_id)}
        onClose={() => setSelectedClientJourney(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by client or journey name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredJourneys.length} of {clientJourneys.length} client journeys
      </div>

      {/* Journey Cards */}
      <div className="space-y-4">
        {filteredJourneys.map((clientJourney) => {
          const totalSteps = getTotalSteps(clientJourney.journey_id);
          
          return (
            <Card key={clientJourney.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {getClientName(clientJourney.client_id)}
                        </h3>
                        <p className="text-gray-600">{getJourneyTitle(clientJourney.journey_id)}</p>
                      </div>
                      <Badge variant="outline" className={statusColors[clientJourney.status]}>
                        {clientJourney.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Progress: {clientJourney.current_step_number || 0} of {totalSteps} steps</span>
                        <span className="font-medium">{clientJourney.progress_percentage || 0}%</span>
                      </div>
                      <Progress value={clientJourney.progress_percentage || 0} className="h-2" />
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {clientJourney.started_at && (
                        <span>Started: {format(new Date(clientJourney.started_at), 'MMM d, yyyy')}</span>
                      )}
                      {clientJourney.completed_at && (
                        <span>Completed: {format(new Date(clientJourney.completed_at), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => setSelectedClientJourney(clientJourney)}
                    className="bg-purple-600 hover:bg-purple-700 md:w-auto w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredJourneys.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No client journeys match your filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}