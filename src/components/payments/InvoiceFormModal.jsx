import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2, Plus, Trash2, Package } from "lucide-react";
import { format, addDays } from "date-fns";
import { generateInvoiceNumber } from "./invoiceUtils";
import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export default function InvoiceFormModal({ isOpen, onClose, clients, existingInvoices, onSave }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPackageSelect, setShowPackageSelect] = useState(false);
  const [formData, setFormData] = useState({
    client_id: "",
    invoiceNumber: "",
    issueDate: new Date(),
    dueDate: addDays(new Date(), 14),
    isRecurring: false,
    recurringFrequency: "monthly",
    lineItems: [
      { description: "", quantity: 1, unitPrice: "", total: 0 }
    ],
    vatRate: 20,
    customVatRate: "",
    notes: "",
    paymentTerms: ""
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => api.entities.Package.list(),
  });

  // Generate next invoice number
  useEffect(() => {
    if (isOpen && !formData.invoiceNumber) {
      const invoiceNumber = generateInvoiceNumber(existingInvoices);
      setFormData(prev => ({ ...prev, invoiceNumber }));
    }
  }, [isOpen, existingInvoices, formData.invoiceNumber]);

  const selectedClient = clients.find(c => c.id === formData.client_id);

  // Line Items Management
  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...formData.lineItems];
    newLineItems[index][field] = value;
    
    // Auto-calculate total
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = parseFloat(newLineItems[index].quantity) || 0;
      const unitPrice = parseFloat(newLineItems[index].unitPrice) || 0;
      newLineItems[index].total = quantity * unitPrice;
    }
    
    setFormData({ ...formData, lineItems: newLineItems });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { description: "", quantity: 1, unitPrice: "", total: 0 }]
    });
  };

  const removeLineItem = (index) => {
    if (formData.lineItems.length > 1) {
      const newLineItems = formData.lineItems.filter((_, i) => i !== index);
      setFormData({ ...formData, lineItems: newLineItems });
    }
  };

  const addPackageLineItem = (packageId) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;

    const newLineItem = {
      description: pkg.name + (pkg.shortDescription ? ` - ${pkg.shortDescription}` : ''),
      quantity: 1,
      unitPrice: (pkg.price / 100).toFixed(2),
      total: pkg.price / 100
    };

    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, newLineItem]
    });
    setShowPackageSelect(false);
  };

  // Calculate totals
  const subtotal = formData.lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const vatRate = formData.vatRate === 'custom' ? parseFloat(formData.customVatRate) || 0 : parseFloat(formData.vatRate) || 0;
  const vatAmount = (subtotal * vatRate) / 100;
  const total = subtotal + vatAmount;

  const handleDueDateQuickSelect = (option) => {
    const issueDate = formData.issueDate;
    let dueDate;

    switch (option) {
      case "receipt":
        dueDate = issueDate;
        break;
      case "net7":
        dueDate = addDays(issueDate, 7);
        break;
      case "net14":
        dueDate = addDays(issueDate, 14);
        break;
      case "net30":
        dueDate = addDays(issueDate, 30);
        break;
      default:
        return;
    }

    setFormData({ ...formData, dueDate });
  };

  const handleSubmit = async (e, status = 'draft') => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave({ ...formData, status, subtotal, vatAmount, total });
      onClose();
      // Reset form
      setFormData({
        client_id: "",
        invoiceNumber: "",
        issueDate: new Date(),
        dueDate: addDays(new Date(), 14),
        isRecurring: false,
        recurringFrequency: "monthly",
        lineItems: [
          { description: "", quantity: 1, unitPrice: "", total: 0 }
        ],
        vatRate: 20,
        customVatRate: "",
        notes: "",
        paymentTerms: ""
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
        {/* Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
        
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
            Create Invoice
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <div className="border-b pb-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>

            {/* Bill To - Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="client">Bill To <span className="text-red-500">*</span></Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClient && (
                <p className="text-sm text-gray-500">{selectedClient.email}</p>
              )}
            </div>

            {/* Invoice Number */}
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="INV-2025-001"
              />
              <p className="text-xs text-gray-500">Auto-generated, edit if needed</p>
            </div>

            {/* Issue Date & Due Date Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Issue Date */}
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date <span className="text-red-500">*</span></Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={format(formData.issueDate, 'yyyy-MM-dd')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    issueDate: new Date(e.target.value) 
                  })}
                />
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date <span className="text-red-500">*</span></Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={format(formData.dueDate, 'yyyy-MM-dd')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    dueDate: new Date(e.target.value) 
                  })}
                />
              </div>
            </div>

            {/* Due Date Quick Options */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Quick select:</span>
              <button
                type="button"
                onClick={() => handleDueDateQuickSelect("receipt")}
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Due on receipt
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => handleDueDateQuickSelect("net7")}
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Net 7
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => handleDueDateQuickSelect("net14")}
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Net 14
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => handleDueDateQuickSelect("net30")}
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Net 30
              </button>
            </div>

            {/* Recurring Invoice Toggle */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="recurring" className="text-base">Recurring Invoice</Label>
                  <p className="text-sm text-gray-500">Automatically generate this invoice on schedule</p>
                </div>
                <Switch
                  id="recurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                />
              </div>

              {formData.isRecurring && (
                <div className="space-y-2 mt-3">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.recurringFrequency}
                    onValueChange={(value) => setFormData({ ...formData, recurringFrequency: value })}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Line Items */}
          <div className="space-y-4">
            <div className="border-b pb-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-3 px-3 pb-2 border-b text-sm font-medium text-gray-600">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-right">Quantity</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1"></div>
            </div>

            {/* Line Item Rows */}
            <div className="space-y-2">
              {formData.lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  {/* Description */}
                  <div className="col-span-5">
                    <Input
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      placeholder="Service or item description"
                      className="bg-white"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                      className="bg-white text-right"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="col-span-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                        placeholder="0.00"
                        className="bg-white text-right pl-7"
                      />
                    </div>
                  </div>

                  {/* Total (calculated) */}
                  <div className="col-span-2">
                    <div className="text-right font-semibold text-gray-900 px-3 py-2 bg-white border rounded-md">
                      £{item.total.toFixed(2)}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="col-span-1 flex justify-end">
                    {formData.lineItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Line Item Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={addLineItem}
                className="flex-1 border-dashed hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Line Item
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPackageSelect(!showPackageSelect)}
                className="border-dashed hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
              >
                <Package className="w-4 h-4 mr-2" />
                Add from Package
              </Button>
            </div>

            {/* Package Selection */}
            {showPackageSelect && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <Label className="mb-2 block">Select Package</Label>
                <Select onValueChange={addPackageLineItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a package..." />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.filter(p => p.isActive).map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} - £{((pkg.price || 0) / 100).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Section 3: Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-3 p-4 bg-gray-50 rounded-lg border">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">£{subtotal.toFixed(2)}</span>
              </div>

              {/* VAT */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Select
                    value={String(formData.vatRate)}
                    onValueChange={(value) => setFormData({ ...formData, vatRate: value })}
                  >
                    <SelectTrigger className="flex-1 h-9 text-sm bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No VAT (0%)</SelectItem>
                      <SelectItem value="20">Standard (20%)</SelectItem>
                      <SelectItem value="5">Reduced (5%)</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="font-semibold text-gray-900 whitespace-nowrap">£{vatAmount.toFixed(2)}</span>
                </div>

                {formData.vatRate === 'custom' && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.customVatRate}
                      onChange={(e) => setFormData({ ...formData, customVatRate: e.target.value })}
                      placeholder="Enter %"
                      className="h-9 text-sm bg-white"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300 my-2"></div>

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-emerald-600">£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Notes & Terms */}
          <div className="space-y-4">
            <div className="border-b pb-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notes & Terms</h3>
            </div>

            {/* Invoice Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or payment instructions..."
                rows={3}
              />
              <p className="text-xs text-gray-500">These will appear on the invoice</p>
            </div>

            {/* Payment Terms */}
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Textarea
                id="paymentTerms"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                placeholder="e.g., Bank transfer to: Sort Code XX-XX-XX, Account XXXXXXXX"
                rows={2}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={!formData.client_id || !formData.invoiceNumber || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save as Draft'
                )}
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, 'sent')}
                disabled={!formData.client_id || !formData.invoiceNumber || isLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create & Send'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}