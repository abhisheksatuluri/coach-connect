import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Package, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function LinkPackageModal({ journey, packages, isOpen, onClose }) {
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const queryClient = useQueryClient();

  const selectedPackage = packages.find(p => p.id === selectedPackageId);

  const linkPackageMutation = useMutation({
    mutationFn: async () => {
      // Update journey with linked package
      await base44.entities.Journey.update(journey.id, {
        linkedPackage_id: selectedPackageId
      });

      // Also update the package to reference this journey
      await base44.entities.Package.update(selectedPackageId, {
        journey_id: journey.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      onClose();
    }
  });

  const handleLink = async () => {
    if (!selectedPackageId) return;
    await linkPackageMutation.mutateAsync();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              Link Package
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Link a package to <strong>{journey.title}</strong>. When clients purchase this package, 
              they can be automatically enrolled in the journey.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select Package
            </label>
            <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a package..." />
              </SelectTrigger>
              <SelectContent>
                {packages.map(pkg => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name} - £{((pkg.price || 0) / 100).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPackage && (
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Package Preview</h4>
              <p className="text-sm text-gray-600 mb-2">
                {selectedPackage.shortDescription || selectedPackage.description}
              </p>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-600 text-white">
                  £{((selectedPackage.price || 0) / 100).toFixed(2)}
                </Badge>
                <Badge variant="outline">
                  {selectedPackage.packageType === 'one_time' ? 'One-time' : 
                   selectedPackage.packageType === 'subscription' ? 'Subscription' : 'Bundle'}
                </Badge>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={linkPackageMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLink}
              disabled={!selectedPackageId || linkPackageMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {linkPackageMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Linking...
                </>
              ) : (
                'Link Package'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}