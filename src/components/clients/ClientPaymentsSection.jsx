import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { CreditCard, FileText, Plus, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import InvoiceFormModal from "@/components/payments/InvoiceFormModal";
import PaymentLinkFormModal from "@/components/payments/PaymentLinkFormModal";
import InvoiceDetailModal from "@/components/payments/InvoiceDetailModal";
import { formatCurrency, statusColors } from "@/components/payments/invoiceUtils";

export default function ClientPaymentsSection({ client }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showPaymentLinkForm, setShowPaymentLinkForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch payment data for this client
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', client.id],
    queryFn: async () => {
      const allInvoices = await api.entities.Invoice.list();
      return allInvoices.filter(inv => inv.client_id === client.id);
    },
  });

  const { data: paymentRecords = [] } = useQuery({
    queryKey: ['payment-records', client.id],
    queryFn: async () => {
      const allRecords = await api.entities.PaymentRecord.list();
      return allRecords.filter(rec => rec.client_id === client.id);
    },
  });

  const { data: allClients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.entities.Client.list(),
  });

  const { data: allInvoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.entities.Invoice.list(),
  });

  // Calculate stats
  const totalPaid = paymentRecords.reduce((sum, rec) => sum + (rec.amount || 0), 0);
  const outstanding = invoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  // Get recent invoices (last 5)
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  return (
    <>
      {showInvoiceForm && (
        <InvoiceFormModal
          isOpen={showInvoiceForm}
          onClose={() => setShowInvoiceForm(false)}
          clients={allClients}
          existingInvoices={allInvoices}
          onSave={async (invoiceData) => {
            await api.entities.Invoice.create({
              ...invoiceData,
              client_id: client.id
            });
          }}
        />
      )}

      {showPaymentLinkForm && (
        <PaymentLinkFormModal
          isOpen={showPaymentLinkForm}
          onClose={() => setShowPaymentLinkForm(false)}
          clients={allClients}
          preselectedClientId={client.id}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          client={client}
          clients={allClients}
          invoices={allInvoices}
          onClose={() => setSelectedInvoice(null)}
          onSend={() => {}}
          onEdit={() => {}}
          onDuplicate={() => {}}
          onCancel={() => {}}
        />
      )}

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              💷 Payments
            </CardTitle>
            <div className="flex items-center gap-3">
              <Link 
                to={`${createPageUrl('Payments')}?client=${client.id}`}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                View All <ExternalLink className="w-4 h-4" />
              </Link>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-green-600 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-orange-600 mb-1">Outstanding</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(outstanding)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-blue-600 mb-1">Invoices</p>
                <p className="text-2xl font-bold text-blue-900">{invoices.length}</p>
              </div>
            </div>

            {/* Recent Invoices */}
            {recentInvoices.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Recent Invoices</p>
                <div className="space-y-2">
                  {recentInvoices.map(invoice => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(invoice.issueDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(invoice.total)}
                        </p>
                        <Badge variant="outline" className={statusColors[invoice.status]}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-4">No invoices yet for this client</p>
                <Button 
                  onClick={() => setShowInvoiceForm(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Invoice
                </Button>
              </div>
            )}

            {/* Quick Actions */}
            {recentInvoices.length > 0 && (
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInvoiceForm(true)}
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentLinkForm(true)}
                  className="flex-1"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Create Payment Link
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </>
  );
}