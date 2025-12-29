import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LinkIcon,
  Copy,
  MoreVertical,
  Plus,
  Search,
  ExternalLink,
  Edit,
  XCircle,
  Loader2,
  Calendar,
  Package as PackageIcon,
  FileText as InvoiceIcon,
  Zap
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import PaymentLinkFormModal from "./PaymentLinkFormModal";

function PaymentLinkCard({ link, client, packages, invoices, onEdit, onCancel, onCopy }) {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    paid: "bg-blue-100 text-blue-800",
    expired: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800"
  };

  const typeConfig = {
    package: {
      icon: PackageIcon,
      label: "Package",
      color: "bg-purple-100 text-purple-700 border-purple-300"
    },
    invoice: {
      icon: InvoiceIcon,
      label: "Invoice",
      color: "bg-blue-100 text-blue-700 border-blue-300"
    },
    manual: {
      icon: Zap,
      label: "Custom",
      color: "bg-gray-100 text-gray-700 border-gray-300"
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  const handleCopyLink = () => {
    const linkUrl = `${window.location.origin}/pay/${link.linkCode}`;
    navigator.clipboard.writeText(linkUrl);
    onCopy?.();
  };

  const linkType = link.linkType || "manual";
  const typeInfo = typeConfig[linkType];
  const TypeIcon = typeInfo.icon;

  // Get related data
  const relatedPackage = linkType === "package" && link.package_id 
    ? packages?.find(p => p.id === link.package_id)
    : null;
  const relatedInvoice = linkType === "invoice" && link.invoice_id
    ? invoices?.find(i => i.id === link.invoice_id)
    : null;

  return (
    <Card className="bg-white hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-6">
        {/* Type Badge */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className={typeInfo.color}>
            <TypeIcon className="w-3 h-3 mr-1" />
            {typeInfo.label}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {linkType === "manual" && (
                <DropdownMenuItem onClick={() => onEdit(link)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="w-4 h-4 mr-2" /> Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => onCancel(link)}>
                <XCircle className="w-4 h-4 mr-2" /> Cancel Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-2">{link.title}</h3>

        {/* Context Line */}
        <div className="mb-3">
          {linkType === "package" && relatedPackage && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <PackageIcon className="w-4 h-4" />
              <span>{relatedPackage.name}</span>
              {relatedPackage.packageType && (
                <Badge variant="outline" className="text-xs">
                  {relatedPackage.packageType === "one_time" ? "One-time" :
                   relatedPackage.packageType === "subscription" ? "Subscription" : "Bundle"}
                </Badge>
              )}
            </div>
          )}
          {linkType === "invoice" && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <InvoiceIcon className="w-4 h-4" />
              <span>Invoice #{link.invoiceNumber || "Unknown"}</span>
            </div>
          )}
          {linkType === "manual" && link.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{link.description}</p>
          )}
        </div>

        {/* Amount */}
        <p className="text-3xl font-bold text-emerald-600 mb-3">
          £{((link.amount || 0) / 100).toFixed(2)}
        </p>

        {/* Client */}
        {client && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold">
              {getInitials(client.full_name)}
            </div>
            <span className="text-sm text-gray-600">{client.full_name}</span>
          </div>
        )}

        {/* Status */}
        <div className="mb-3">
          <Badge className={statusColors[link.status]}>{link.status}</Badge>
        </div>

        {/* Dates */}
        <div className="space-y-1 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Created: {format(new Date(link.created_date), 'MMM d, yyyy')}</span>
          </div>
          {link.expiryDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Expires: {format(new Date(link.expiryDate), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Copy Button */}
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="w-full gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Copy className="w-4 h-4" /> Copy Payment Link
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PaymentLinksTab({ paymentLinks, clients, packages, invoices, isLoading }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));

  // Filter and sort
  let filteredLinks = [...paymentLinks];

  if (searchQuery) {
    filteredLinks = filteredLinks.filter(link =>
      link.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.packageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (statusFilter !== "all") {
    filteredLinks = filteredLinks.filter(link => link.status === statusFilter);
  }

  if (clientFilter !== "all") {
    filteredLinks = filteredLinks.filter(link => link.client_id === clientFilter);
  }

  if (typeFilter !== "all") {
    filteredLinks = filteredLinks.filter(link => (link.linkType || "manual") === typeFilter);
  }

  // Sort
  filteredLinks.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_date) - new Date(a.created_date);
      case "amount-high":
        return (b.amount || 0) - (a.amount || 0);
      case "amount-low":
        return (a.amount || 0) - (b.amount || 0);
      case "client":
        const clientA = clientMap[a.client_id]?.full_name || "";
        const clientB = clientMap[b.client_id]?.full_name || "";
        return clientA.localeCompare(clientB);
      default:
        return 0;
    }
  });

  const handleEdit = (link) => {
    // TODO: Open edit modal
    console.log('Edit link:', link);
  };

  const handleCancel = (link) => {
    // TODO: Cancel link confirmation
    console.log('Cancel link:', link);
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search payment links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.id}>
                {client.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="manual">Manual Links</SelectItem>
            <SelectItem value="package">Package Links</SelectItem>
            <SelectItem value="invoice">Invoice Links</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
            <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
            <SelectItem value="client">Client Name</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="w-4 h-4" /> Payment Link
        </Button>
      </div>

      {/* Payment Link Form Modal */}
      <PaymentLinkFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clients={clients}
      />

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredLinks.length === 0 ? (
        <Card className="bg-white border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
              <LinkIcon className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || statusFilter !== "all" || clientFilter !== "all"
                ? "No payment links found"
                : "No payment links yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter !== "all" || clientFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first payment link to start accepting payments"}
            </p>
            {!searchQuery && statusFilter === "all" && clientFilter === "all" && (
              <Button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <Plus className="w-4 h-4" /> Create Payment Link
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.map(link => (
            <PaymentLinkCard
              key={link.id}
              link={link}
              client={clientMap[link.client_id]}
              packages={packages}
              invoices={invoices}
              onEdit={handleEdit}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}