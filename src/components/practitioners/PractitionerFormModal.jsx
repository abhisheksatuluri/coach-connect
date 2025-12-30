import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Loader2, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const specialties = [
  "Dietitian",
  "Nutritionist",
  "Therapist",
  "Doctor",
  "Physiotherapist",
  "Counselor"
];

export default function PractitionerFormModal({ practitioner, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    credentials: ""
  });
  const { toast } = useToast();
  const isEditing = !!practitioner;

  useEffect(() => {
    if (practitioner) {
      setFormData({
        name: practitioner.name || "",
        email: practitioner.email || "",
        phone: practitioner.phone || "",
        specialty: practitioner.specialty || "",
        credentials: practitioner.credentials || ""
      });
    }
  }, [practitioner]);

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.Practitioner.create(data),
    onSuccess: () => {
      toast({ title: "Practitioner added", duration: 2000 });
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "Failed to add practitioner", 
        description: error.message,
        variant: "destructive",
        duration: 3000 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Practitioner.update(id, data),
    onSuccess: () => {
      toast({ title: "Practitioner updated", duration: 2000 });
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "Failed to update practitioner", 
        description: error.message,
        variant: "destructive",
        duration: 3000 
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({ 
        title: "Name and email are required", 
        variant: "destructive",
        duration: 2000 
      });
      return;
    }

    if (isEditing) {
      updateMutation.mutate({ id: practitioner.id, data: formData });
    } else {
      createMutation.mutate({
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString()
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

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
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">
                  {isEditing ? "Edit Practitioner" : "Add Practitioner"}
                </h2>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. Jane Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane.smith@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Select
                value={formData.specialty}
                onValueChange={(value) => setFormData({ ...formData, specialty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentials">Credentials</Label>
              <Textarea
                id="credentials"
                value={formData.credentials}
                onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                placeholder="MD, RD, License #12345..."
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? "Update" : "Add Practitioner"}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}