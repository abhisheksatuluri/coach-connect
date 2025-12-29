import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, Send, DollarSign, Download, Copy, Edit, Ban, Check } from "lucide-react";
import { format } from "date-fns";
import RecordPaymentModal from "./RecordPaymentModal";

export default function InvoiceDetailModal({ invoice, client, clients, invoices, onClose, onSend, onEdit, onDuplicate, onCancel }) {
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  
  if (!invoice) return null;

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-gray-200 text-gray-700"
  };

  const isOverdue = invoice.status === 'sent' && new Date(invoice.dueDate) < new Date();

  return (
    <>
      {showRecordPayment && (
        <RecordPaymentModal
          isOpen={showRecordPayment}
          onClose={() => setShowRecordPayment(false)}
          prefilledClient={client}
          prefilledInvoice={invoice}
          clients={clients}
          invoices={invoices}
        />
      )}
      
      <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex h-[90vh]">
          {/* Left Column - Invoice Preview (60%) */}
          <div className="w-[60%] overflow-y-auto bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-12">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-emerald-600 mb-2">HealthCoach</h1>
                  <p className="text-sm text-gray-600">Coaching & Wellness Services</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-gray-300 mb-2">INVOICE</div>
                  <div className="text-sm text-gray-600">{invoice.invoiceNumber}</div>
                </div>
              </div>

              {/* Bill To & Invoice Details */}
              <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b border-gray-200">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Bill To</div>
                  <div className="font-semibold text-gray-900 text-lg">{client?.full_name || 'Unknown Client'}</div>
                  <div className="text-sm text-gray-600">{client?.email}</div>
                </div>
                <div className="text-right">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Invoice Number:</span>
                      <span className="font-semibold text-gray-900">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Issue Date:</span>
                      <span className="text-gray-900">{format(new Date(invoice.issueDate), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Due Date:</span>
                      <span className={isOverdue ? "text-red-600 font-semibold" : "text-gray-900"}>
                        {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Status:</span>
                      <Badge variant="outline" className={statusColors[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Description</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase w-20">Qty</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase w-28">Unit Price</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Placeholder line items - replace with actual data when implemented */}
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 text-sm text-gray-900">Coaching Session (1hr)</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900">1</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900">£75.00</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">£75.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end mb-8">
                <div className="w-80">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">£{((invoice.subtotal || 0) / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VAT ({invoice.taxRate || 20}%)</span>
                      <span className="text-gray-900">£{((invoice.taxAmount || 0) / 100).toFixed(2)}</span>
                    </div>
                    <div className="border-t-2 border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total Due</span>
                        <span className="text-2xl font-bold text-emerald-600">£{((invoice.total || 0) / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {(invoice.notes || invoice.paymentTerms) && (
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  {invoice.notes && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Notes</div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.paymentTerms && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Payment Terms</div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.paymentTerms}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Actions Panel (40%) */}
          <div className="w-[40%] bg-white border-l overflow-y-auto">
            {/* Close Button */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900">Invoice Actions</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Section */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-3">Status</div>
                  <div className="flex items-center justify-center mb-4">
                    <Badge className={`${statusColors[invoice.status]} text-lg px-4 py-2`}>
                      {invoice.status}
                    </Badge>
                  </div>

                  {/* Status Timeline */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        invoice.created_date ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Created</div>
                        {invoice.created_date && (
                          <div className="text-xs text-gray-500">
                            {format(new Date(invoice.created_date), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        invoice.sent_at ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Sent</div>
                        {invoice.sent_at && (
                          <div className="text-xs text-gray-500">
                            {format(new Date(invoice.sent_at), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        invoice.paid_at ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Paid</div>
                        {invoice.paid_at && (
                          <div className="text-xs text-gray-500">
                            {format(new Date(invoice.paid_at), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                {invoice.status === 'draft' && (
                  <Button
                    onClick={() => onSend(invoice)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Invoice
                  </Button>
                )}

                {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                  <Button
                    onClick={() => setShowRecordPayment(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                )}

                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>

                <Button
                  variant="outline"
                  onClick={() => onDuplicate(invoice)}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Invoice
                </Button>

                {invoice.status === 'draft' && (
                  <Button
                    variant="outline"
                    onClick={() => onEdit(invoice)}
                    className="w-full"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}

                {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                  <Button
                    variant="outline"
                    onClick={() => onCancel(invoice)}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Cancel Invoice
                  </Button>
                )}
              </div>

              {/* Payment History - Placeholder */}
              {invoice.status === 'paid' && (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-3">Payment History</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.paid_at && format(new Date(invoice.paid_at), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">Bank Transfer</div>
                        </div>
                        <div className="text-sm font-semibold text-emerald-600">
                          £{((invoice.total || 0) / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}