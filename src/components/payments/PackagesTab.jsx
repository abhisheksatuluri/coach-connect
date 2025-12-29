import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Check,
  ExternalLink,
  MapPin,
  Loader2
} from "lucide-react";
import PackageDetailModal from "./PackageDetailModal";
import PackageFormModal from "./PackageFormModal";
import PaymentLinkFormModal from "./PaymentLinkFormModal";

const categoryColors = {
  coaching: "bg-blue-50 text-blue-700 border-blue-200",
  programme: "bg-purple-50 text-purple-700 border-purple-200",
  bundle: "bg-teal-50 text-teal-700 border-teal-200",
  consultation: "bg-amber-50 text-amber-700 border-amber-200",
  subscription: "bg-emerald-50 text-emerald-700 border-emerald-200"
};

const categoryAccents = {
  coaching: "#3B82F6",
  programme: "#8B5CF6",
  bundle: "#14B8A6",
  consultation: "#F59E0B",
  subscription: "#10B981"
};

const packageTypeIcons = {
  one_time: "💳",
  subscription: "🔄",
  session_bundle: "📦"
};

function PackageCard({ pkg, journeys, onViewDetails, onCreateLink }) {
  const features = pkg.features ? JSON.parse(pkg.features) : [];
  const displayFeatures = features.slice(0, 3);
  const remainingCount = Math.max(0, features.length - 3);
  
  const linkedJourney = pkg.journey_id ? journeys.find(j => j.id === pkg.journey_id) : null;

  const getPriceSuffix = () => {
    if (pkg.packageType === "subscription") {
      if (pkg.billingFrequency === "weekly") return "/week";
      if (pkg.billingFrequency === "monthly") return "/month";
      if (pkg.billingFrequency === "quarterly") return "/quarter";
      if (pkg.billingFrequency === "yearly") return "/year";
    } else if (pkg.packageType === "session_bundle") {
      return `for ${pkg.sessionCount || 0} sessions`;
    } else if (pkg.packageType === "one_time") {
      if (pkg.durationWeeks) return `• ${pkg.durationWeeks} weeks`;
      return "one-time";
    }
    return "";
  };

  return (
    <Card className="bg-white hover:shadow-lg transition-all duration-200 ease-in-out group relative rounded-xl border border-gray-100 hover:border-gray-200 hover:-translate-y-0.5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <CardContent className="p-6">
        {/* Header with badges */}
        <div className="flex items-start justify-between mb-3 relative">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={categoryColors[pkg.category] || "bg-gray-100 text-gray-700"}>
              {pkg.category}
            </Badge>
            <span className="text-lg">{packageTypeIcons[pkg.packageType]}</span>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {pkg.popularBadge && (
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-0 transform -rotate-3 shadow-md">
                ⭐ Popular
              </Badge>
            )}
            {pkg.limitedAvailability && pkg.maxClients && (
              <Badge className="bg-red-500 text-white border-0 shadow-md">
                {pkg.maxClients - (pkg.currentEnrollments || 0) > 0 
                  ? `Only ${pkg.maxClients - (pkg.currentEnrollments || 0)} left`
                  : '🔥 Limited'}
              </Badge>
            )}
          </div>
        </div>

        {/* Package name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
          {pkg.name}
        </h3>

        {/* Short description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
          {pkg.shortDescription || pkg.description}
        </p>

        {/* Price section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold" style={{ color: categoryAccents[pkg.category] || '#6B7280' }}>
              £{(pkg.displayPrice || (pkg.price / 100)).toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">{getPriceSuffix()}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />

        {/* Features preview */}
        <div className="space-y-2 mb-4">
          {displayFeatures.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700 line-clamp-1">{feature}</span>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="text-sm font-medium" style={{ color: categoryAccents[pkg.category] }}>
              + {remainingCount} more feature{remainingCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Journey indicator */}
        {linkedJourney && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-4 bg-gray-50 rounded-lg p-2">
            <MapPin className="w-3 h-3" />
            <span>Linked to {linkedJourney.title}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 hover:bg-gray-50 transition-all"
            onClick={() => onViewDetails(pkg)}
          >
            View Details
          </Button>
          <Button
            className="flex-1 text-white transition-all hover:scale-105"
            style={{ backgroundColor: categoryAccents[pkg.category] || '#10B981' }}
            onClick={() => onCreateLink(pkg)}
          >
            Create Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PackagesTab({ packages, journeys, clients, isLoading }) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showInactive, setShowInactive] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [packageToEdit, setPackageToEdit] = useState(null);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [packageForLink, setPackageForLink] = useState(null);

  // Filter packages
  let filteredPackages = [...packages];

  if (!showInactive) {
    filteredPackages = filteredPackages.filter(pkg => pkg.isActive);
  }

  if (categoryFilter !== "all") {
    filteredPackages = filteredPackages.filter(pkg => pkg.category === categoryFilter);
  }

  if (typeFilter !== "all") {
    filteredPackages = filteredPackages.filter(pkg => pkg.packageType === typeFilter);
  }

  // Separate sample and custom packages
  const samplePackages = filteredPackages.filter(pkg => !pkg.isCustom).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const customPackages = filteredPackages.filter(pkg => pkg.isCustom).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const handleViewDetails = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleCreateLink = (pkg) => {
    setPackageForLink(pkg);
    setShowPaymentLinkModal(true);
    setSelectedPackage(null); // Close detail modal if open
  };

  const handleCreatePackage = () => {
    setPackageToEdit(null);
    setShowFormModal(true);
  };

  const handleEdit = (pkg) => {
    setSelectedPackage(null);
    setPackageToEdit(pkg);
    setShowFormModal(true);
  };

  const handleDuplicate = (pkg) => {
    console.log('Duplicate package:', pkg);
    // TODO: Duplicate package logic
  };

  const handleToggleActive = (pkg) => {
    console.log('Toggle active:', pkg);
    // TODO: Toggle package active status
  };

  const selectedJourney = selectedPackage?.journey_id 
    ? journeys.find(j => j.id === selectedPackage.journey_id) 
    : null;

  return (
    <>
      <PackageDetailModal
        pkg={selectedPackage}
        journey={selectedJourney}
        isOpen={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onCreateLink={handleCreateLink}
        onToggleActive={handleToggleActive}
      />

      <PackageFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setPackageToEdit(null);
        }}
        packageToEdit={packageToEdit}
        journeys={journeys}
      />

      <PaymentLinkFormModal
        isOpen={showPaymentLinkModal}
        onClose={() => {
          setShowPaymentLinkModal(false);
          setPackageForLink(null);
        }}
        clients={clients || []}
        preselectedPackage={packageForLink}
      />

      <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <h2 className="text-2xl font-bold text-gray-900">Your Packages</h2>
          <p className="text-gray-600 text-sm">Products and services you offer</p>
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="coaching">Coaching</SelectItem>
            <SelectItem value="programme">Programme</SelectItem>
            <SelectItem value="bundle">Bundle</SelectItem>
            <SelectItem value="consultation">Consultation</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="one_time">One-time</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
            <SelectItem value="session_bundle">Session Bundle</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={setShowInactive}
          />
          <Label htmlFor="show-inactive" className="text-sm text-gray-600">
            Show inactive
          </Label>
        </div>

        <Button onClick={handleCreatePackage} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="w-4 h-4" /> Create Package
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Sample Packages Section */}
          {samplePackages.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Sample Packages</h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {samplePackages.length}
                </Badge>
                <div className="group relative">
                  <div className="w-4 h-4 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center cursor-help">
                    i
                  </div>
                  <div className="absolute left-0 top-6 hidden group-hover:block z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    Pre-made packages to get you started. Duplicate to customize.
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {samplePackages.map((pkg, idx) => (
                  <div
                    key={pkg.id}
                    className="animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'backwards' }}
                  >
                    <PackageCard
                      pkg={pkg}
                      journeys={journeys}
                      onViewDetails={handleViewDetails}
                      onCreateLink={handleCreateLink}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Packages Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Your Custom Packages</h3>
              {customPackages.length > 0 && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {customPackages.length}
                </Badge>
              )}
            </div>

            {customPackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customPackages.map((pkg, idx) => (
                  <div
                    key={pkg.id}
                    className="animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'backwards' }}
                  >
                    <PackageCard
                      pkg={pkg}
                      journeys={journeys}
                      onViewDetails={handleViewDetails}
                      onCreateLink={handleCreateLink}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300 hover:border-emerald-400 transition-all duration-200 cursor-pointer hover:shadow-md" onClick={handleCreatePackage}>
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center transform transition-transform hover:scale-110">
                    <Plus className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Own Package</h3>
                  <p className="text-gray-600 mb-4">
                    Design a custom package tailored to your unique services
                  </p>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4 mr-2" /> Create Package
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
      </div>
    </>
  );
}