import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  MapPin,
  Users,
  Calendar,
  Video,
  Home,
  Copy,
  Edit,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

const categoryColors = {
  coaching: "bg-blue-100 text-blue-700 border-blue-300",
  programme: "bg-purple-100 text-purple-700 border-purple-300",
  bundle: "bg-teal-100 text-teal-700 border-teal-300",
  consultation: "bg-orange-100 text-orange-700 border-orange-300",
  subscription: "bg-green-100 text-green-700 border-green-300"
};

const deliveryIcons = {
  online: Video,
  in_person: Home,
  hybrid: Users
};

export default function PackageDetailModal({ pkg, journey, isOpen, onClose, onEdit, onDuplicate, onCreateLink, onToggleActive }) {
  if (!pkg) return null;

  const features = pkg.features ? JSON.parse(pkg.features) : [];
  const DeliveryIcon = deliveryIcons[pkg.deliveryMethod] || Video;
  const spotsRemaining = pkg.maxClients ? pkg.maxClients - (pkg.currentEnrollments || 0) : null;

  const getPriceContext = () => {
    if (pkg.packageType === "subscription") {
      if (pkg.billingFrequency === "weekly") return "/week";
      if (pkg.billingFrequency === "monthly") return "/month";
      if (pkg.billingFrequency === "quarterly") return "/quarter";
      if (pkg.billingFrequency === "yearly") return "/year";
    } else if (pkg.packageType === "session_bundle") {
      return `for ${pkg.sessionCount || 0} sessions`;
    } else if (pkg.packageType === "one_time") {
      return "one-time";
    }
    return "";
  };

  const getBillingText = () => {
    if (pkg.packageType === "subscription") {
      return `Billed ${pkg.billingFrequency || 'monthly'}`;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] p-0 gap-0">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="max-h-[85vh] overflow-y-auto">
          {/* Hero Section */}
          <div className="p-8 pb-6">
            <Badge variant="outline" className={`mb-3 ${categoryColors[pkg.category] || "bg-gray-100 text-gray-700"}`}>
              {pkg.category}
            </Badge>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {pkg.name}
            </h2>
            
            <p className="text-gray-600 mb-4">
              {pkg.shortDescription || pkg.description}
            </p>

            {/* Badges Row */}
            <div className="flex flex-wrap gap-2 mb-6">
              {pkg.popularBadge && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0">
                  ⭐ Popular
                </Badge>
              )}
              {pkg.limitedAvailability && (
                <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0">
                  🔥 Limited
                </Badge>
              )}
              <Badge variant="outline" className="gap-1">
                <DeliveryIcon className="w-3 h-3" />
                {pkg.deliveryMethod === "in_person" ? "In-person" : pkg.deliveryMethod === "online" ? "Online" : "Hybrid"}
              </Badge>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-gray-900">
                  £{(pkg.displayPrice || (pkg.price / 100)).toFixed(2)}
                </span>
                <span className="text-lg text-gray-600">{getPriceContext()}</span>
              </div>
              {getBillingText() && (
                <p className="text-sm text-gray-600">{getBillingText()}</p>
              )}
              {pkg.limitedAvailability && spotsRemaining !== null && (
                <p className="text-sm font-medium text-red-600 mt-2">
                  Only {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} remaining
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* What's Included Section */}
          <div className="p-8 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
            <div className="space-y-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Details Section */}
          {(pkg.durationWeeks || pkg.sessionCount || pkg.targetAudience) && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <div className="p-8 py-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                <div className="space-y-2 text-sm">
                  {pkg.durationWeeks && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span><strong>Duration:</strong> {pkg.durationWeeks} weeks</span>
                    </div>
                  )}
                  {pkg.sessionCount && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Video className="w-4 h-4 text-gray-400" />
                      <span><strong>Sessions included:</strong> {pkg.sessionCount}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-700">
                    <DeliveryIcon className="w-4 h-4 text-gray-400" />
                    <span><strong>Delivery:</strong> {pkg.deliveryMethod === "in_person" ? "In-person" : pkg.deliveryMethod === "online" ? "Online" : "Hybrid"}</span>
                  </div>
                  {pkg.targetAudience && (
                    <div className="flex items-start gap-2 text-gray-700">
                      <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span><strong>Best for:</strong> {pkg.targetAudience}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Expected Outcomes Section */}
          {pkg.outcomes && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <div className="p-8 py-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Expected Outcomes</h3>
                <p className="text-gray-700">{pkg.outcomes}</p>
              </div>
            </>
          )}

          {/* Full Description */}
          {pkg.description && pkg.description !== pkg.shortDescription && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <div className="p-8 py-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Package</h3>
                <p className="text-gray-700 whitespace-pre-line">{pkg.description}</p>
              </div>
            </>
          )}

          {/* Linked Journey */}
          {journey && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              <div className="p-8 py-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Linked Programme</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{journey.title}</h4>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                      {journey.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{journey.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {pkg.isCustom && (
                <Button variant="outline" onClick={() => onEdit(pkg)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="outline" onClick={() => onDuplicate(pkg)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              {pkg.isCustom && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onToggleActive(pkg)}>
                      {pkg.isActive ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white"
              onClick={() => onCreateLink(pkg)}
            >
              Create Payment Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}