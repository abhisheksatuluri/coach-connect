import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Loader2 } from "lucide-react";
import api from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function PackageFormModal({ isOpen, onClose, packageToEdit, journeys }) {
  const queryClient = useQueryClient();
  const isEditMode = !!packageToEdit;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    packageType: "one_time",
    price: "",
    billingFrequency: "monthly",
    sessionCount: "",
    durationWeeks: "",
    category: "coaching",
    deliveryMethod: "online",
    targetAudience: "",
    outcomes: "",
    journey_id: "",
    popularBadge: false,
    limitedAvailability: false,
    maxClients: "",
    isActive: true
  });

  const [features, setFeatures] = useState(["", "", ""]);
  const [errors, setErrors] = useState({});

  // Load package data when editing
  useEffect(() => {
    if (packageToEdit) {
      const existingFeatures = packageToEdit.features ? JSON.parse(packageToEdit.features) : ["", "", ""];
      setFeatures(existingFeatures.length > 0 ? existingFeatures : ["", "", ""]);
      
      setFormData({
        name: packageToEdit.name || "",
        shortDescription: packageToEdit.shortDescription || "",
        description: packageToEdit.description || "",
        packageType: packageToEdit.packageType || "one_time",
        price: packageToEdit.displayPrice ? packageToEdit.displayPrice.toString() : ((packageToEdit.price || 0) / 100).toString(),
        billingFrequency: packageToEdit.billingFrequency || "monthly",
        sessionCount: packageToEdit.sessionCount?.toString() || "",
        durationWeeks: packageToEdit.durationWeeks?.toString() || "",
        category: packageToEdit.category || "coaching",
        deliveryMethod: packageToEdit.deliveryMethod || "online",
        targetAudience: packageToEdit.targetAudience || "",
        outcomes: packageToEdit.outcomes || "",
        journey_id: packageToEdit.journey_id || "",
        popularBadge: packageToEdit.popularBadge || false,
        limitedAvailability: packageToEdit.limitedAvailability || false,
        maxClients: packageToEdit.maxClients?.toString() || "",
        isActive: packageToEdit.isActive !== false
      });
    } else {
      // Reset form when creating new
      setFormData({
        name: "",
        shortDescription: "",
        description: "",
        packageType: "one_time",
        price: "",
        billingFrequency: "monthly",
        sessionCount: "",
        durationWeeks: "",
        category: "coaching",
        deliveryMethod: "online",
        targetAudience: "",
        outcomes: "",
        journey_id: "",
        popularBadge: false,
        limitedAvailability: false,
        maxClients: "",
        isActive: true
      });
      setFeatures(["", "", ""]);
      setErrors({});
    }
  }, [packageToEdit, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const removeFeature = (index) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Package name is required";
    if (!formData.shortDescription.trim()) newErrors.shortDescription = "Short description is required";
    if (formData.shortDescription.length > 100) newErrors.shortDescription = "Must be 100 characters or less";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = "Valid price is required";
    
    if (formData.packageType === "subscription" && !formData.billingFrequency) {
      newErrors.billingFrequency = "Billing frequency is required for subscriptions";
    }
    
    if (formData.packageType === "session_bundle" && (!formData.sessionCount || parseInt(formData.sessionCount) <= 0)) {
      newErrors.sessionCount = "Number of sessions is required for bundles";
    }

    if (formData.limitedAvailability && (!formData.maxClients || parseInt(formData.maxClients) <= 0)) {
      newErrors.maxClients = "Maximum clients is required when limited availability is on";
    }

    const validFeatures = features.filter(f => f.trim());
    if (validFeatures.length === 0) {
      newErrors.features = "At least one feature is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.Package.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Package.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      onClose();
    },
  });

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const priceInPounds = parseFloat(formData.price);
    const priceInPence = Math.round(priceInPounds * 100);

    const validFeatures = features.filter(f => f.trim());

    const packageData = {
      name: formData.name.trim(),
      shortDescription: formData.shortDescription.trim(),
      description: formData.description.trim(),
      packageType: formData.packageType,
      price: priceInPence,
      displayPrice: priceInPounds,
      currency: "GBP",
      category: formData.category,
      deliveryMethod: formData.deliveryMethod,
      features: JSON.stringify(validFeatures),
      isCustom: true,
      isActive: formData.isActive,
      popularBadge: formData.popularBadge,
      limitedAvailability: formData.limitedAvailability,
      ...(formData.targetAudience && { targetAudience: formData.targetAudience.trim() }),
      ...(formData.outcomes && { outcomes: formData.outcomes.trim() }),
      ...(formData.journey_id && { journey_id: formData.journey_id }),
      ...(formData.packageType === "subscription" && { billingFrequency: formData.billingFrequency }),
      ...(formData.packageType === "session_bundle" && formData.sessionCount && { sessionCount: parseInt(formData.sessionCount) }),
      ...(formData.packageType === "one_time" && formData.durationWeeks && { durationWeeks: parseInt(formData.durationWeeks) }),
      ...(formData.limitedAvailability && formData.maxClients && { maxClients: parseInt(formData.maxClients) }),
      ...(formData.limitedAvailability && !isEditMode && { currentEnrollments: 0 })
    };

    if (isEditMode) {
      updateMutation.mutate({ id: packageToEdit.id, data: packageData });
    } else {
      createMutation.mutate(packageData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Package" : "Create Package"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-semibold text-gray-900">Basic Information</h3>
            </div>

            <div>
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., 12-Week Wellness Programme"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                placeholder="Brief one-liner for listings"
                maxLength={100}
                className={errors.shortDescription ? "border-red-500" : ""}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.shortDescription ? (
                  <p className="text-xs text-red-600">{errors.shortDescription}</p>
                ) : (
                  <span className="text-xs text-gray-500">{formData.shortDescription.length}/100</span>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Detailed description of what this package offers..."
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Section 2: Pricing & Type */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-semibold text-gray-900">Pricing & Type</h3>
            </div>

            <div>
              <Label htmlFor="packageType">Package Type *</Label>
              <Select value={formData.packageType} onValueChange={(value) => handleInputChange("packageType", value)}>
                <SelectTrigger id="packageType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One-time Payment</SelectItem>
                  <SelectItem value="subscription">Subscription (recurring)</SelectItem>
                  <SelectItem value="session_bundle">Session Bundle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="0.00"
                  className={`pl-8 ${errors.price ? "border-red-500" : ""}`}
                />
              </div>
              {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
            </div>

            {formData.packageType === "subscription" && (
              <div>
                <Label htmlFor="billingFrequency">Billing Frequency *</Label>
                <Select value={formData.billingFrequency} onValueChange={(value) => handleInputChange("billingFrequency", value)}>
                  <SelectTrigger id="billingFrequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                {errors.billingFrequency && <p className="text-xs text-red-600 mt-1">{errors.billingFrequency}</p>}
              </div>
            )}

            {formData.packageType === "session_bundle" && (
              <div>
                <Label htmlFor="sessionCount">Number of Sessions *</Label>
                <Input
                  id="sessionCount"
                  type="number"
                  min="1"
                  value={formData.sessionCount}
                  onChange={(e) => handleInputChange("sessionCount", e.target.value)}
                  placeholder="e.g., 10"
                  className={errors.sessionCount ? "border-red-500" : ""}
                />
                {errors.sessionCount && <p className="text-xs text-red-600 mt-1">{errors.sessionCount}</p>}
              </div>
            )}

            {formData.packageType === "one_time" && (
              <div>
                <Label htmlFor="durationWeeks">Programme Duration (weeks)</Label>
                <Input
                  id="durationWeeks"
                  type="number"
                  min="1"
                  value={formData.durationWeeks}
                  onChange={(e) => handleInputChange("durationWeeks", e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
            )}
          </div>

          {/* Section 3: Category & Delivery */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-semibold text-gray-900">Category & Delivery</h3>
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coaching">Coaching</SelectItem>
                  <SelectItem value="programme">Programme</SelectItem>
                  <SelectItem value="bundle">Bundle</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deliveryMethod">Delivery Method *</Label>
              <Select value={formData.deliveryMethod} onValueChange={(value) => handleInputChange("deliveryMethod", value)}>
                <SelectTrigger id="deliveryMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in_person">In-person</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                placeholder="Who is this package best suited for?"
              />
            </div>
          </div>

          {/* Section 4: Features */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-semibold text-gray-900">Features (What's Included)</h3>
            </div>

            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="e.g., Weekly 60-minute coaching session"
                  />
                  {features.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {errors.features && <p className="text-xs text-red-600">{errors.features}</p>}

            <Button type="button" variant="outline" onClick={addFeature} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Add Feature
            </Button>
          </div>

          {/* Section 5: Outcomes */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-semibold text-gray-900">Outcomes</h3>
            </div>

            <div>
              <Label htmlFor="outcomes">Expected Outcomes</Label>
              <Textarea
                id="outcomes"
                value={formData.outcomes}
                onChange={(e) => handleInputChange("outcomes", e.target.value)}
                placeholder="What results can clients expect from this package?"
                rows={3}
              />
            </div>
          </div>

          {/* Section 6: Additional Settings */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-semibold text-gray-900">Additional Settings</h3>
            </div>

            <div>
              <Label htmlFor="journey_id">Link to Journey</Label>
              <Select value={formData.journey_id} onValueChange={(value) => handleInputChange("journey_id", value)}>
                <SelectTrigger id="journey_id">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {journeys.filter(j => j.is_template).map(journey => (
                    <SelectItem key={journey.id} value={journey.id}>
                      {journey.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Clients who purchase this will be enrolled in the selected journey
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="popularBadge">Mark as Popular</Label>
                  <p className="text-xs text-gray-500">Shows a "Popular" badge on the package</p>
                </div>
                <Switch
                  id="popularBadge"
                  checked={formData.popularBadge}
                  onCheckedChange={(checked) => handleInputChange("popularBadge", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="limitedAvailability">Limited Availability</Label>
                  <p className="text-xs text-gray-500">Shows scarcity to encourage action</p>
                </div>
                <Switch
                  id="limitedAvailability"
                  checked={formData.limitedAvailability}
                  onCheckedChange={(checked) => handleInputChange("limitedAvailability", checked)}
                />
              </div>

              {formData.limitedAvailability && (
                <div className="ml-4">
                  <Label htmlFor="maxClients">Maximum Clients *</Label>
                  <Input
                    id="maxClients"
                    type="number"
                    min="1"
                    value={formData.maxClients}
                    onChange={(e) => handleInputChange("maxClients", e.target.value)}
                    placeholder="e.g., 10"
                    className={errors.maxClients ? "border-red-500" : ""}
                  />
                  {errors.maxClients && <p className="text-xs text-red-600 mt-1">{errors.maxClients}</p>}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-xs text-gray-500">Whether this package is available for clients</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              `${isEditMode ? "Update" : "Save"} Package`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}