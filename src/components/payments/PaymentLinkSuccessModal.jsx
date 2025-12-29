import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, Mail, X } from "lucide-react";

export default function PaymentLinkSuccessModal({ isOpen, onClose, paymentLink, client }) {
  const [copied, setCopied] = useState(false);
  
  const linkUrl = `${window.location.origin}/pay/${paymentLink.linkCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailSend = () => {
    const subject = encodeURIComponent(`Payment Link: ${paymentLink.title}`);
    const body = encodeURIComponent(
      `Hi ${client.full_name},\n\nHere's your payment link:\n${linkUrl}\n\nAmount: £${(paymentLink.displayAmount || 0).toFixed(2)}\n\nThank you!`
    );
    window.open(`mailto:${client.email}?subject=${subject}&body=${body}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" />
              Payment Link Created
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Payment link for:</p>
            <p className="font-semibold text-gray-900">{paymentLink.title}</p>
            <p className="text-2xl font-bold text-emerald-600 mt-2">
              £{(paymentLink.displayAmount || 0).toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Payment Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={linkUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border rounded-md text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className={copied ? "bg-emerald-50 border-emerald-300" : ""}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleEmailSend}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email to Client
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}