import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function RecordPaymentModal({ 
  isOpen, 
  onClose, 
  prefilledClient, 
  prefilledInvoice, 
  prefilledPaymentLink,
  clients,
  invoices 
}) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_id: "",
    invoice_id: "",
    paymentLink_id: "",
    amount: "",
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: "bank_transfer",
    reference: "",
    notes: ""
  });

  // Prefill form when modal opens with context
  useEffect(() => {
    if (isOpen) {
      const newFormData = {
        client_id: prefilledClient?.id || "",
        invoice_id: prefilledInvoice?.id || "",
        paymentLink_id: prefilledPaymentLink?.id || "",
        amount: "",
        paymentDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: "bank_transfer",
        reference: "",
        notes: ""
      };

      // Pre-fill amount from invoice or payment link
      if (prefilledInvoice?.total) {
        newFormData.amount = (prefilledInvoice.total / 100).toFixed(2);
      } else if (prefilledPaymentLink?.amount) {
        newFormData.amount = (prefilledPaymentLink.amount / 100).toFixed(2);
      }

      setFormData(newFormData);
    }
  }, [isOpen, prefilledClient, prefilledInvoice, prefilledPaymentLink]);

  // Filter invoices for selected client (unpaid only)
  const selectedClient = clients?.find(c => c.id === formData.client_id);
  const clientInvoices = invoices?.filter(inv => 
    inv.client_id === formData.client_id && 
    inv.status !== 'paid' && 
    inv.status !== 'cancelled'
  ) || [];

  const recordPaymentMutation = useMutation({
    mutationFn: async (paymentData) => {
      // Create payment record
      const paymentRecord = await base44.entities.PaymentRecord.create({
        client_id: paymentData.client_id,
        invoice_id: paymentData.invoice_id || null,
        paymentLink_id: paymentData.paymentLink_id || null,
        amount: Math.round(parseFloat(paymentData.amount) * 100), // Convert to pence
        paymentDate: paymentData.paymentDate,
        paymentMethod: paymentData.paymentMethod,
        reference: paymentData.reference || null,
        notes: paymentData.notes || null
      });

      // Update invoice if linked
      if (paymentData.invoice_id) {
        const invoice = invoices.find(inv => inv.id === paymentData.invoice_id);
        const paidAmount = Math.round(parseFloat(paymentData.amount) * 100);
        const invoiceTotal = invoice.total || 0;
        
        const updates = {
          paid_at: new Date().toISOString()
        };

        // Mark as paid if full amount, otherwise keep as sent
        if (paidAmount >= invoiceTotal) {
          updates.status = 'paid';
        }

        await base44.entities.Invoice.update(paymentData.invoice_id, updates);

        // Also update the linked payment link if it exists
        if (invoice?.paymentLink_id) {
          await base44.entities.PaymentLink.update(invoice.paymentLink_id, {
            status: 'paid',
            paid_at: new Date().toISOString()
          });
        }
      }

      // Update payment link if linked
      if (paymentData.paymentLink_id) {
        await base44.entities.PaymentLink.update(paymentData.paymentLink_id, {
          status: 'paid',
          paid_at: new Date().toISOString()
        });

        // Also update the linked invoice if it exists
        const paymentLink = prefilledPaymentLink || await base44.entities.PaymentLink.filter({ id: paymentData.paymentLink_id }).then(links => links[0]);
        if (paymentLink?.invoice_id) {
          await base44.entities.Invoice.update(paymentLink.invoice_id, {
            status: 'paid',
            paid_at: new Date().toISOString()
          });
        }
      }

      return paymentRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-records'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payment-links'] });
      onClose();
      // Reset form
      setFormData({
        client_id: "",
        invoice_id: "",
        paymentLink_id: "",
        amount: "",
        paymentDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: "bank_transfer",
        reference: "",
        notes: ""
      });
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await recordPaymentMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Error recording payment:", error);
      alert("Failed to record payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = formData.client_id && formData.amount && formData.paymentDate && formData.paymentMethod;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Record Payment
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">
              Client <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                client_id: value,
                invoice_id: "" // Reset invoice when client changes
              })}
              disabled={!!prefilledClient}
            >
              <SelectTrigger id="client">
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                {clients?.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedClient && (
              <p className="text-xs text-gray-500">{selectedClient.email}</p>
            )}
          </div>

          {/* Invoice Selection (optional) */}
          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice (optional)</Label>
            <Select
              value={formData.invoice_id}
              onValueChange={(value) => {
                const invoice = invoices?.find(inv => inv.id === value);
                setFormData({ 
                  ...formData, 
                  invoice_id: value,
                  amount: invoice ? (invoice.total / 100).toFixed(2) : formData.amount
                });
              }}
              disabled={!!prefilledInvoice || !formData.client_id}
            >
              <SelectTrigger id="invoice">
                <SelectValue placeholder="No invoice - standalone payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>No invoice - standalone payment</SelectItem>
                {clientInvoices.map(invoice => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} - £{((invoice.total || 0) / 100).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!formData.client_id && (
              <p className="text-xs text-gray-500">Select a client first to see invoices</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">£</span>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="pl-7"
              />
            </div>
            <p className="text-xs text-gray-500">Partial payments are allowed</p>
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="paymentDate">
              Payment Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">
              Payment Method <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label htmlFor="reference">Reference (optional)</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="Transaction ID or reference..."
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Payment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}