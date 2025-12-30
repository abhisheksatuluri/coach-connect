import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, UserPlus, Edit, Trash2, Clock, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotesSection from "@/components/notes/NotesSection";
import FilesSection from "@/components/files/FilesSection";
import { setNoteContextJourney, clearNoteContext } from "@/components/notes/useNoteContext";
import LinkPackageModal from "./LinkPackageModal";

const stepTypeColors = {
  "Task": "bg-blue-100 text-blue-800",
  "Exercise": "bg-orange-100 text-orange-800",
  "Video": "bg-purple-100 text-purple-800",
  "Audio": "bg-pink-100 text-pink-800",
  "Text Lesson": "bg-green-100 text-green-800",
  "Reflection": "bg-indigo-100 text-indigo-800",
  "Milestone": "bg-yellow-100 text-yellow-800",
  "Assessment": "bg-red-100 text-red-800",
  "Check-in": "bg-teal-100 text-teal-800"
};

export default function JourneyDetailModal({ journey, journeySteps, clients, isAdmin, onClose }) {
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [showLinkPackageModal, setShowLinkPackageModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch packages to get linked package info
  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => api.entities.Package.list(),
  });

  const linkedPackage = journey?.linkedPackage_id 
    ? packages.find(p => p.id === journey.linkedPackage_id)
    : null;

  // Set note context and KB context when this journey detail modal is open
  useEffect(() => {
    if (journey?.id) {
      console.log('[JourneyDetailModal] Setting journey context:', journey.id, journey.title);
      setNoteContextJourney(journey.id, null, journey.title);
      // Set global KB context
      window.__kbContext = { journeyId: journey.id };
      window.dispatchEvent(new CustomEvent('kbContextChanged'));
    }
    return () => {
      clearNoteContext();
      // Clear global KB context
      window.__kbContext = {};
      window.dispatchEvent(new CustomEvent('kbContextChanged'));
    };
  }, [journey?.id, journey?.title]);

  const sortedSteps = [...journeySteps].sort((a, b) => a.order_number - b.order_number);

  const assignToClientMutation = useMutation({
    mutationFn: async (clientId) => {
      // Create ClientJourney
      const clientJourney = await api.entities.ClientJourney.create({
        client_id: clientId,
        journey_id: journey.id,
        status: 'Active',
        started_at: new Date().toISOString(),
        progress_percentage: 0,
        current_step_number: 1,
        assigned_by: (await api.auth.me()).email
      });

      // Create all ClientJourneyStep records
      const stepPromises = sortedSteps.map(step =>
        api.entities.ClientJourneyStep.create({
          client_journey_id: clientJourney.id,
          journey_step_id: step.id,
          status: 'Not Started'
        })
      );

      await Promise.all(stepPromises);
      
      return { clientJourney, clientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clientJourneys'] });
      const client = clients.find(c => c.id === data.clientId);
      alert(`Journey successfully assigned to ${client?.full_name}!`);
      setShowAssignForm(false);
      setSelectedClientId("");
      onClose();
    },
  });

  const handleAssign = async () => {
    if (!selectedClientId) {
      alert('Please select a client');
      return;
    }
    
    setIsAssigning(true);
    try {
      await assignToClientMutation.mutateAsync(selectedClientId);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-t-2xl z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{journey.title}</h2>
                <div className="flex items-center gap-3 text-sm text-white/90">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {journey.duration_weeks} weeks
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {sortedSteps.length} steps
                  </span>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {journey.category}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{journey.description || 'No description provided'}</p>
            </div>

            {/* Linked Package Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Linked Package</h3>
              {linkedPackage ? (
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{linkedPackage.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{linkedPackage.shortDescription || linkedPackage.description}</p>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-600 text-white">
                          £{(linkedPackage.displayPrice || (linkedPackage.price / 100)).toFixed(2)}
                        </Badge>
                        <Badge variant="outline">
                          {linkedPackage.packageType === 'one_time' ? 'One-time' : 
                           linkedPackage.packageType === 'subscription' ? 'Subscription' : 'Bundle'}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        alert('View package details - to be implemented');
                      }}
                    >
                      View Package
                    </Button>
                  </div>
                  <div className="pt-3 border-t border-emerald-200">
                    <p className="text-xs text-gray-600 mb-2">Quick enroll client with payment:</p>
                    <Button
                      size="sm"
                      onClick={() => setShowAssignForm(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                    >
                      Enroll Client with Payment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-gray-500 mb-3">No package linked to this journey</p>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLinkPackageModal(true)}
                    >
                      Link Package
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Journey Steps */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Journey Steps</h3>
              <div className="space-y-3">
                {sortedSteps.map((step) => (
                  <div key={step.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-semibold">
                            {step.order_number}
                          </span>
                          <h4 className="font-semibold text-gray-900">{step.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={stepTypeColors[step.step_type] || "bg-gray-100 text-gray-800"}>
                            {step.step_type}
                          </Badge>
                          {step.duration_days && (
                            <span className="text-xs text-gray-500">
                              {step.duration_days} day{step.duration_days > 1 ? 's' : ''}
                            </span>
                          )}
                          {step.is_required && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assign to Client Form */}
            {showAssignForm && (
              <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Assign to Client</h3>
                <div className="flex gap-3">
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleAssign}
                    disabled={!selectedClientId || isAssigning}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isAssigning ? 'Assigning...' : 'Assign'}
                  </Button>
                  <Button 
                    onClick={() => setShowAssignForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className="mb-6">
              <NotesSection 
                linkedJourney={journey.id} 
                journeyTitle={journey.title}
              />
            </div>

            {/* Files Section */}
            <div className="mb-6">
              <FilesSection 
                linkedJourney={journey.id}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-2xl flex justify-between">
            <div className="flex gap-2">
              {isAdmin && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => alert('Edit journey - to be implemented')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this journey template?')) {
                        alert('Delete journey - to be implemented');
                      }
                    }}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAssignForm(!showAssignForm)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Assign to Client
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}