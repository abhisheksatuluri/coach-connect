import React, { useState } from "react";
import api from "@/api/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Loader2, Check, Copy, Package as PackageIcon } from "lucide-react";

function generateLinkCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function PaymentLinkFormModal({ isOpen, onClose, clients, preselectedPackage = null }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(preselectedPackage ? "package" : "quick");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    client_id: "",
    expiryDate: null,
    notes: ""
  });
  
  // Package-specific state
  const [selectedPackage, setSelectedPackage] = useState(preselectedPackage);
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  
  const [errors, setErrors] = useState({});
  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch packages
  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => api.entities.Package.list(),
    enabled: isOpen
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const linkCode = generateLinkCode();
      const amountInPence = Math.round(parseFloat(data.amount) * 100);
      
      const linkData = {
        linkType: data.linkType || "manual",
        title: data.title,
        description: data.description || null,
        amount: amountInPence,
        displayAmount: parseFloat(data.amount),
        client_id: data.client_id,
        status: "active",
        linkCode: linkCode,
        expiryDate: data.expiryDate || null,
        notes: data.notes || null
      };

      // Add package-specific fields
      if (data.linkType === "package" && data.package_id) {
        linkData.package_id = data.package_id;
        linkData.packageName = data.packageName;
      }
      
      return api.entities.PaymentLink.create(linkData);
    },
    onSuccess: (newLink) => {
      queryClient.invalidateQueries({ queryKey: ['payment-links'] });
      setCreatedLink(newLink);
    }
  });

  const validate = () => {
    const newErrors = {};
    
    if (activeTab === "package") {
      if (!selectedPackage) {
        newErrors.package = "Please select a package";
      }
      
      if (useCustomAmount && (!customAmount || parseFloat(customAmount) <= 0)) {
        newErrors.amount = "Valid custom amount is required";
      }
    } else {
      if (!formData.title.trim()) {
        newErrors.title = "Title is required";
      }
      
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = "Valid amount is required";
      }
    }
    
    if (!formData.client_id) {
      newErrors.client_id = "Client is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      if (activeTab === "package") {
        // Package payment link
        const finalAmount = useCustomAmount 
          ? customAmount 
          : (selectedPackage.displayPrice || (selectedPackage.price / 100)).toString();
        
        createMutation.mutate({
          linkType: "package",
          package_id: selectedPackage.id,
          packageName: selectedPackage.name,
          title: selectedPackage.name,
          description: selectedPackage.shortDescription || selectedPackage.description,
          amount: finalAmount,
          client_id: formData.client_id,
          expiryDate: formData.expiryDate,
          notes: formData.notes
        });
      } else {
        // Manual/quick payment link
        createMutation.mutate({
          ...formData,
          linkType: "manual"
        });
      }
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      amount: "",
      client_id: "",
      expiryDate: null,
      notes: ""
    });
    setSelectedPackage(preselectedPackage);
    setUseCustomAmount(false);
    setCustomAmount("");
    setActiveTab(preselectedPackage ? "package" : "quick");
    setErrors({});
    setCreatedLink(null);
    onClose();
  };

  const handleCopyLink = () => {
    if (createdLink) {
      const linkUrl = `https://pay.coachconnect.com/${createdLink.linkCode}`;
      navigator.clipboard.writeText(linkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateAnother = () => {
    setCreatedLink(null);
    setCopied(false);
    setFormData({
      title: "",
      description: "",
      amount: "",
      client_id: "",
      expiryDate: null,
      notes: ""
    });
    setSelectedPackage(null);
    setUseCustomAmount(false);
    setCustomAmount("");
    setActiveTab("quick");
    setErrors({});
  };

  const handleSendEmail = () => {
    // TODO: Implement email sending
    console.log('Send email with payment link');
  };

  if (createdLink) {
    const linkUrl = `https://pay.coachconnect.com/${createdLink.linkCode}`;
    const client = clients.find(c => c.id === createdLink.client_id);
    
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[450px]">
          <div className="py-6 text-center">
            {/* Large Animated Checkmark */}
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Link Created!</h2>
            <p className="text-gray-600 mb-6">Your payment link is ready to share</p>

            {/* Link Display Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-gray-500 mb-2 text-left">Payment Link</p>
              <div className="bg-white px-3 py-2.5 rounded border mb-3">
                <code className="text-sm font-mono text-gray-700 break-all block">
                  {linkUrl}
                </code>
              </div>
              <Button
                onClick={handleCopyLink}
                className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                size="lg"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>

            {/* Payment Details Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Title:</span>
                  <span className="text-sm font-medium text-gray-900">{createdLink.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-sm font-medium text-emerald-600">
                    £{(createdLink.amount / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Client:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {client?.full_name || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expires:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {createdLink.expiryDate ? format(new Date(createdLink.expiryDate), 'MMM d, yyyy') : 'No expiry'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleSendEmail}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Send via Email
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateAnother}
                  variant="outline"
                  className="flex-1"
                >
                  Create Another
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-gray-900 hover:bg-gray-800"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const activePackages = packages.filter(p => p.isActive);
  const groupedPackages = activePackages.reduce((acc, pkg) => {
    if (!acc[pkg.category]) acc[pkg.category] = [];
    acc[pkg.category].push(pkg);
    return acc;
  }, {});

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 absolute top-0 left-0 right-0" />
        <DialogHeader>
          <DialogTitle>Create Payment Link</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick">Quick Amount</TabsTrigger>
              <TabsTrigger value="package">From Package</TabsTrigger>
            </TabsList>

            {/* Quick Amount Tab */}
            <TabsContent value="quick" className="space-y-4 mt-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Payment Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Health Coaching Session, Program Fee"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about this payment..."
                  rows={3}
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    £
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className={`pl-8 ${errors.amount ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
              </div>

              {/* Client */}
              <div className="space-y-2">
                <Label htmlFor="client">
                  Client <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                >
                  <SelectTrigger className={errors.client_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        <div>
                          <div className="font-medium">{client.full_name}</div>
                          <div className="text-xs text-gray-500">{client.email}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.client_id && <p className="text-xs text-red-500">{errors.client_id}</p>}
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Link Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate ? format(formData.expiryDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value ? new Date(e.target.value) : null })}
                />
                <p className="text-xs text-gray-500">Leave empty for no expiry</p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes for your reference (not visible to client)..."
                  rows={2}
                />
              </div>
            </TabsContent>

            {/* From Package Tab */}
            <TabsContent value="package" className="space-y-4 mt-4">
              {/* Package Selection */}
              <div className="space-y-2">
                <Label>
                  Select Package <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedPackage?.id || ""}
                  onValueChange={(value) => {
                    const pkg = packages.find(p => p.id === value);
                    setSelectedPackage(pkg);
                    setUseCustomAmount(false);
                    setCustomAmount("");
                  }}
                >
                  <SelectTrigger className={errors.package ? "border-red-500" : ""}>
                    <SelectValue placeholder="Choose a package..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(groupedPackages).map(([category, pkgs]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                          {category}
                        </div>
                        {pkgs.map(pkg => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            <div className="flex items-center gap-2">
                              <PackageIcon className="w-4 h-4" />
                              <div>
                                <div className="font-medium">{pkg.name}</div>
                                <div className="text-xs text-gray-500">
                                  £{(pkg.displayPrice || (pkg.price / 100)).toFixed(2)} • {pkg.packageType}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                {errors.package && <p className="text-xs text-red-500">{errors.package}</p>}
              </div>

              {/* Selected Package Summary */}
              {selectedPackage && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedPackage.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedPackage.shortDescription || selectedPackage.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="bg-white">
                      {selectedPackage.category}
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      {selectedPackage.packageType === "one_time" ? "One-time" : 
                       selectedPackage.packageType === "subscription" ? "Subscription" : "Bundle"}
                    </Badge>
                    <span className="text-lg font-bold text-emerald-600 ml-auto">
                      £{(selectedPackage.displayPrice || (selectedPackage.price / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Client */}
              <div className="space-y-2">
                <Label htmlFor="pkg-client">
                  Client <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                >
                  <SelectTrigger id="pkg-client" className={errors.client_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        <div>
                          <div className="font-medium">{client.full_name}</div>
                          <div className="text-xs text-gray-500">{client.email}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.client_id && <p className="text-xs text-red-500">{errors.client_id}</p>}
              </div>

              {/* Customize Amount */}
              {selectedPackage && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="customize-amount">Customize Amount</Label>
                      <p className="text-xs text-gray-500">Override package price (e.g., for discounts)</p>
                    </div>
                    <Switch
                      id="customize-amount"
                      checked={useCustomAmount}
                      onCheckedChange={setUseCustomAmount}
                    />
                  </div>

                  {useCustomAmount && (
                    <div className="space-y-2 ml-4">
                      <Label htmlFor="custom-amount">Custom Amount <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          £
                        </span>
                        <Input
                          id="custom-amount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="0.00"
                          className={`pl-8 ${errors.amount ? "border-red-500" : ""}`}
                        />
                      </div>
                      {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="pkg-expiryDate">Link Expiry Date</Label>
                <Input
                  id="pkg-expiryDate"
                  type="date"
                  value={formData.expiryDate ? format(formData.expiryDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value ? new Date(e.target.value) : null })}
                />
                <p className="text-xs text-gray-500">Leave empty for no expiry</p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="pkg-notes">Internal Notes</Label>
                <Textarea
                  id="pkg-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g., 10% early bird discount applied"
                  rows={2}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Payment Link"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}