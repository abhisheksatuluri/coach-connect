import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Package, Send, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PaymentLinkSuccessModal from "./PaymentLinkSuccessModal";

export default function QuickPackageLinksSection({ client }) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.Package.list(),
  });

  // Show top 4 active packages, prioritize popular and non-custom
  const quickPackages = packages
    .filter(pkg => pkg.isActive)
    .sort((a, b) => {
      if (a.popularBadge && !b.popularBadge) return -1;
      if (!a.popularBadge && b.popularBadge) return 1;
      if (!a.isCustom && b.isCustom) return -1;
      if (a.isCustom && !b.isCustom) return 1;
      return 0;
    })
    .slice(0, 4);

  const handleSendLink = async (pkg) => {
    try {
      // Calculate expiry date (30 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      // Generate unique link code
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let linkCode = '';
      for (let i = 0; i < 10; i++) {
        linkCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Create payment link
      const paymentLink = await base44.entities.PaymentLink.create({
        linkType: "package",
        package_id: pkg.id,
        packageName: pkg.name,
        title: pkg.name,
        description: pkg.shortDescription || pkg.description,
        amount: pkg.price,
        displayAmount: pkg.price / 100,
        client_id: client.id,
        status: "active",
        linkCode: linkCode,
        expiryDate: expiryDate.toISOString().split('T')[0]
      });

      setCreatedLink(paymentLink);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating payment link:', error);
      alert('Failed to create payment link. Please try again.');
    }
  };

  if (quickPackages.length === 0) return null;

  return (
    <>
      {showSuccessModal && createdLink && (
        <PaymentLinkSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setCreatedLink(null);
          }}
          paymentLink={createdLink}
          client={client}
        />
      )}

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              Quick Package Links
            </CardTitle>
            <Link
              to={createPageUrl('Payments') + '?tab=packages'}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
            >
              View All <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickPackages.map(pkg => (
              <div
                key={pkg.id}
                className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{pkg.name}</h4>
                    <p className="text-xs text-gray-600 line-clamp-1">{pkg.shortDescription}</p>
                  </div>
                  {pkg.popularBadge && (
                    <Badge className="bg-yellow-400 text-yellow-900 text-xs ml-2">⭐ Popular</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-600">
                    £{((pkg.price || 0) / 100).toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleSendLink(pkg)}
                    className="bg-emerald-600 hover:bg-emerald-700 h-8"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Send Link
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}