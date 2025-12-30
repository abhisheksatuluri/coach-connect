import React, { useState } from "react";
import api from "@/api/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, UserCheck, Loader2, AlertCircle, CheckCircle, UserPlus 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PractitionerSelectionModal({ 
  action, 
  onClose, 
  onSuccess 
}) {
  const [selectedPractitionerId, setSelectedPractitionerId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [sentPractitionerName, setSentPractitionerName] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch practitioners filtered by specialty
  const { data: practitioners = [], isLoading } = useQuery({
    queryKey: ['practitioners', action.requiredSpecialty],
    queryFn: async () => {
      const all = await api.entities.Practitioner.filter({ 
        isActive: true 
      });
      // Filter by specialty
      return all.filter(p => p.specialty === action.requiredSpecialty);
    },
    enabled: !!action.requiredSpecialty
  });

  // Get current user for coachId
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.auth.me()
  });

  const handleSendRequest = async () => {
    if (!selectedPractitionerId) return;

    setIsSending(true);
    try {
      const selectedPractitioner = practitioners.find(p => p.id === selectedPractitionerId);
      
      const response = await api.functions.invoke('sendApprovalRequestEmail', {
        actionId: action.id,
        practitionerId: selectedPractitionerId,
        coachId: currentUser?.id
      });

      if (response.data?.success) {
        setSentPractitionerName(selectedPractitioner?.name || 'the practitioner');
        setSentSuccess(true);
        queryClient.invalidateQueries({ queryKey: ['actions'] });
        
        // Auto-close after showing success
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        toast({
          title: "Failed to send request",
          description: response.data?.error || "Unknown error",
          variant: "destructive",
          duration: 3000
        });
      }
    } catch (error) {
      toast({
        title: "Failed to send request",
        description: error.message,
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsSending(false);
    }
  };

  const noPractitioners = !isLoading && practitioners.length === 0;

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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-5 h-5" />
                  <h2 className="text-lg font-bold">
                    This action requires {action.requiredSpecialty} approval
                  </h2>
                </div>
                <p className="text-sm text-white/90">
                  Select a practitioner to review and approve this action
                </p>
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

          {/* Success State */}
          {sentSuccess ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Request Sent!
              </h3>
              <p className="text-gray-600">
                Approval request sent to {sentPractitionerName}
              </p>
            </div>
          ) : (
            <>
              {/* Action Details */}
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                {action.description && (
                  <p className="text-sm text-gray-600">{action.description}</p>
                )}
              </div>

              {/* Content */}
              <div className="p-4 max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : noPractitioners ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium mb-2">
                      No {action.requiredSpecialty} practitioners found
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Please add one in the Practitioners page
                    </p>
                    <Link to={createPageUrl('Practitioners')}>
                      <Button className="bg-amber-500 hover:bg-amber-600">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Practitioner
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {practitioners.map((practitioner) => (
                      <label
                        key={practitioner.id}
                        className={`
                          block p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${selectedPractitionerId === practitioner.id 
                            ? 'border-amber-500 bg-amber-50' 
                            : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="practitioner"
                            value={practitioner.id}
                            checked={selectedPractitionerId === practitioner.id}
                            onChange={() => setSelectedPractitionerId(practitioner.id)}
                            className="mt-1 w-4 h-4 text-amber-500 focus:ring-amber-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {practitioner.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {practitioner.specialty}
                              </Badge>
                            </div>
                            {practitioner.credentials && (
                              <p className="text-sm text-gray-500 mt-1">
                                {practitioner.credentials}
                              </p>
                            )}
                            {practitioner.email && (
                              <p className="text-xs text-gray-400 mt-1">
                                {practitioner.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 flex items-center justify-end gap-3 bg-gray-50">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                {!noPractitioners && (
                  <Button
                    onClick={handleSendRequest}
                    disabled={!selectedPractitionerId || isSending}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Approval Request'
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}