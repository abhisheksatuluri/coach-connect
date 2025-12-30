import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, List, Eye, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

import JourneyDetailModal from "./JourneyDetailModal";

const categoryColors = {
  "Weight Loss": "bg-orange-100 text-orange-800 border-orange-200",
  "Performance": "bg-blue-100 text-blue-800 border-blue-200",
  "Wellness": "bg-green-100 text-green-800 border-green-200",
  "Behavior Change": "bg-purple-100 text-purple-800 border-purple-200",
  "Nutrition": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Sleep": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Custom": "bg-gray-100 text-gray-800 border-gray-200"
};

export default function JourneyTemplateGrid({ templates, journeySteps, clients, isAdmin }) {
  const [selectedJourney, setSelectedJourney] = useState(null);

  // Fetch packages to show linked package info
  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => api.entities.Package.list(),
  });

  const getStepCount = (journeyId) => {
    return journeySteps.filter(step => step.journey_id === journeyId).length;
  };

  const getLinkedPackage = (journeyId) => {
    const journey = templates.find(j => j.id === journeyId);
    return journey?.linkedPackage_id 
      ? packages.find(p => p.id === journey.linkedPackage_id)
      : null;
  };

  if (templates.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No journey templates yet</h3>
          <p className="text-gray-600">Create your first journey template to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((journey, index) => (
          <motion.div
            key={journey.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-2">
                    <Badge variant="outline" className={categoryColors[journey.category] || categoryColors["Custom"]}>
                      {journey.category}
                    </Badge>
                    {!journey.is_active && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  {getLinkedPackage(journey.id) && (
                    <Badge className="bg-emerald-600 text-white">
                      From £{((getLinkedPackage(journey.id).price || 0) / 100).toFixed(2)}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {journey.title}
                  {getLinkedPackage(journey.id) && (
                    <Package className="w-4 h-4 text-emerald-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {journey.description || 'No description provided'}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {journey.duration_weeks} weeks
                  </span>
                  <span className="flex items-center gap-1">
                    <List className="w-4 h-4" />
                    {getStepCount(journey.id)} steps
                  </span>
                </div>

                <Button
                  onClick={() => setSelectedJourney(journey)}
                  variant="outline"
                  className="w-full mt-auto"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedJourney && (
        <JourneyDetailModal
          journey={selectedJourney}
          journeySteps={journeySteps.filter(s => s.journey_id === selectedJourney.id)}
          clients={clients}
          isAdmin={isAdmin}
          onClose={() => setSelectedJourney(null)}
        />
      )}
    </>
  );
}