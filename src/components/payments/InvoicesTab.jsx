import React, { useState } from "react";
import api from "@/api/api";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Eye,
  Send,
  DollarSign,
  MoreVertical,
  Trash2,
  Copy,
  Loader2,
  ArrowUpDown
} from "lucide-react";
import { format } from "date-fns";
import InvoiceDetailModal from "./InvoiceDetailModal";
import { formatCurrency, statusColors } from "./invoiceUtils";

function InvoiceRow({ invoice, client, onView, onEdit, onSend, onRecordPayment, onDelete, onDuplicate }) {
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  const isOverdue = invoice.status === 'sent' && new Date(invoice.dueDate) < new Date();

  return (
    <TableRow className="hover:bg-gray-50 transition-colors">
      <TableCell>
        <button
          onClick={() => onView(invoice)}
          className="font-mono text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
        >
          {invoice.invoiceNumber}
        </button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold">
            {getInitials(client?.full_name)}
          </div>
          <span className="text-sm text-gray-900">{client?.full_name || 'Unknown'}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {format(new Date(invoice.issueDate), 'MMM d, yyyy')}
      </TableCell>
      <TableCell className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
        {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
      </TableCell>
      <TableCell className="text-sm font-semibold text-gray-900">
        {formatCurrency(invoice.total)}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={statusColors[invoice.status]}>
          {invoice.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onView(invoice)} className="h-8 w-8 p-0">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(invoice)} className="h-8 w-8 p-0">
            <Edit className="w-4 h-4" />
          </Button>
          {invoice.status === 'draft' && (
            <Button variant="ghost" size="sm" onClick={() => onSend(invoice)} className="h-8 w-8 p-0">
              <Send className="w-4 h-4" />
            </Button>
          )}
          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
            <Button variant="ghost" size="sm" onClick={() => onRecordPayment(invoice)} className="h-8 w-8 p-0">
              <DollarSign className="w-4 h-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDuplicate(invoice)}>
                <Copy className="w-4 h-4 mr-2" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete(invoice)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function InvoicesTab({ invoices, clients, isLoading }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [quickFilter, setQuickFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("issueDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));

  // Calculate status counts
  const statusCounts = {
    draft: invoices.filter(inv => inv.status === 'draft').length,
    awaiting: invoices.filter(inv => inv.status === 'sent').length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    overdue: invoices.filter(inv => 
      inv.status === 'sent' && new Date(inv.dueDate) < new Date()
    ).length
  };

  // Filter invoices
  let filteredInvoices = [...invoices];

  if (searchQuery) {
    filteredInvoices = filteredInvoices.filter(inv =>
      inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientMap[inv.client_id]?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (statusFilter !== "all") {
    filteredInvoices = filteredInvoices.filter(inv => inv.status === statusFilter);
  }

  if (clientFilter !== "all") {
    filteredInvoices = filteredInvoices.filter(inv => inv.client_id === clientFilter);
  }

  if (quickFilter !== "all") {
    if (quickFilter === "draft") {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === 'draft');
    } else if (quickFilter === "awaiting") {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === 'sent');
    } else if (quickFilter === "paid") {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === 'paid');
    } else if (quickFilter === "overdue") {
      filteredInvoices = filteredInvoices.filter(inv => 
        inv.status === 'sent' && new Date(inv.dueDate) < new Date()
      );
    }
  }

  if (dateRange !== "all") {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    filteredInvoices = filteredInvoices.filter(inv => {
      const invDate = new Date(inv.issueDate);
      
      if (dateRange === "this-month") {
        return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
      } else if (dateRange === "last-month") {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return invDate.getMonth() === lastMonth && invDate.getFullYear() === lastMonthYear;
      } else if (dateRange === "this-year") {
        return invDate.getFullYear() === currentYear;
      }
      return true;
    });
  }

  // Sort invoices
  filteredInvoices.sort((a, b) => {
    let aVal, bVal;
    
    if (sortColumn === "invoiceNumber") {
      aVal = a.invoiceNumber;
      bVal = b.invoiceNumber;
    } else if (sortColumn === "client") {
      aVal = clientMap[a.client_id]?.full_name || "";
      bVal = clientMap[b.client_id]?.full_name || "";
    } else if (sortColumn === "issueDate") {
      aVal = new Date(a.issueDate);
      bVal = new Date(b.issueDate);
    } else if (sortColumn === "dueDate") {
      aVal = new Date(a.dueDate);
      bVal = new Date(b.dueDate);
    } else if (sortColumn === "total") {
      aVal = a.total || 0;
      bVal = b.total || 0;
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleEdit = (invoice) => {
    console.log('Edit invoice:', invoice);
  };

  const handleSend = async (invoice) => {
    try {
      // Update invoice status to sent
      await api.entities.Invoice.update(invoice.id, {
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      // Check if payment link already exists for this invoice
      const existingLinks = await api.entities.PaymentLink.filter({ invoice_id: invoice.id });
      
      if (existingLinks.length === 0) {
        // Calculate expiry date (30 days after due date)
        const dueDate = new Date(invoice.dueDate);
        const expiryDate = new Date(dueDate);
        expiryDate.setDate(expiryDate.getDate() + 30);

        // Generate unique link code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let linkCode = '';
        for (let i = 0; i < 10; i++) {
          linkCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Create payment link
        const paymentLink = await api.entities.PaymentLink.create({
          linkType: "invoice",
          invoice_id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          title: `Invoice ${invoice.invoiceNumber}`,
          description: `Payment for invoice ${invoice.invoiceNumber}`,
          amount: invoice.total,
          displayAmount: invoice.total / 100,
          client_id: invoice.client_id,
          status: "active",
          linkCode: linkCode,
          expiryDate: expiryDate.toISOString().split('T')[0]
        });

        // Update invoice with payment link reference
        await api.entities.Invoice.update(invoice.id, {
          paymentLink_id: paymentLink.id
        });
      }

      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payment-links'] });
    } catch (error) {
      console.error('Error sending invoice:', error);
    }
  };

  const handleRecordPayment = (invoice) => {
    console.log('Record payment:', invoice);
  };

  const handleDelete = (invoice) => {
    console.log('Delete invoice:', invoice);
  };

  const handleDuplicate = (invoice) => {
    console.log('Duplicate invoice:', invoice);
  };

  return (
    <>
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          client={clientMap[selectedInvoice.client_id]}
          clients={clients}
          invoices={invoices}
          onClose={() => setSelectedInvoice(null)}
          onSend={handleSend}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onCancel={handleDelete}
        />
      )}
      
      <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search invoices..."
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
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

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="this-year">This Year</SelectItem>
          </SelectContent>
        </Select>

        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="w-4 h-4" /> New Invoice
        </Button>
      </div>

      {/* Quick Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={quickFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setQuickFilter("all")}
          className={quickFilter === "all" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          All
        </Button>
        <Button
          variant={quickFilter === "draft" ? "default" : "outline"}
          size="sm"
          onClick={() => setQuickFilter("draft")}
          className={quickFilter === "draft" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          Draft ({statusCounts.draft})
        </Button>
        <Button
          variant={quickFilter === "awaiting" ? "default" : "outline"}
          size="sm"
          onClick={() => setQuickFilter("awaiting")}
          className={quickFilter === "awaiting" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          Awaiting Payment ({statusCounts.awaiting})
        </Button>
        <Button
          variant={quickFilter === "paid" ? "default" : "outline"}
          size="sm"
          onClick={() => setQuickFilter("paid")}
          className={quickFilter === "paid" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          Paid ({statusCounts.paid})
        </Button>
        <Button
          variant={quickFilter === "overdue" ? "default" : "outline"}
          size="sm"
          onClick={() => setQuickFilter("overdue")}
          className={quickFilter === "overdue" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
        >
          Overdue ({statusCounts.overdue})
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <Card className="bg-white border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || statusFilter !== "all" || clientFilter !== "all" || dateRange !== "all"
                ? "No invoices found"
                : "No invoices yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter !== "all" || clientFilter !== "all" || dateRange !== "all"
                ? "Try adjusting your filters"
                : "Create your first invoice to bill your clients"}
            </p>
            {!searchQuery && statusFilter === "all" && clientFilter === "all" && dateRange === "all" && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <Plus className="w-4 h-4" /> Create Invoice
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      onClick={() => handleSort("invoiceNumber")}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Invoice #
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("client")}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Client
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("issueDate")}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Issue Date
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("dueDate")}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Due Date
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("total")}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      Amount
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map(invoice => (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                    client={clientMap[invoice.client_id]}
                    onView={handleView}
                    onEdit={handleEdit}
                    onSend={handleSend}
                    onRecordPayment={handleRecordPayment}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      </div>
    </>
  );
}