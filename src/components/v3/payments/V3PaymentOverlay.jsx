import React from 'react';
import { Download, Share2, Send, RotateCcw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import V3Overlay from '@/components/v3/V3Overlay';

export default function V3PaymentOverlay({ invoice, isOpen, onClose }) {
    if (!invoice) return null;

    return (
        <V3Overlay isOpen={isOpen} onClose={onClose} title={`Invoice #${invoice.id}`}>
            <div className="mb-8 text-center pb-8 border-b border-stone-100">
                <div className="text-4xl font-bold text-stone-900 mb-2">{invoice.amount}</div>
                <span className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium border inline-flex items-center gap-1.5",
                    invoice.status === 'Paid' ? "bg-teal-50 text-teal-700 border-teal-100" :
                        invoice.status === 'Overdue' ? "bg-rose-50 text-rose-700 border-rose-100" :
                            "bg-amber-50 text-amber-700 border-amber-100"
                )}>
                    {invoice.status === 'Paid' && <CheckCircle className="w-3.5 h-3.5" />}
                    {invoice.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                    {invoice.status === 'Overdue' && <AlertCircle className="w-3.5 h-3.5" />}
                    {invoice.status}
                </span>
            </div>

            {/* Client Section */}
            <div className="mb-8">
                <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Bill To</h4>
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-medium">
                        {invoice.clientAvatar ? (
                            <img src={invoice.clientAvatar} alt={invoice.clientName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            invoice.clientName.charAt(0)
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-stone-900">{invoice.clientName}</div>
                        <div className="text-xs text-stone-500">{invoice.clientEmail}</div>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto text-teal-600 hover:bg-teal-50 h-8">
                        View
                    </Button>
                </div>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-xs text-stone-400 block mb-1">Issue Date</span>
                    <span className="text-sm font-medium text-stone-900">{invoice.issueDate}</span>
                </div>
                <div className={cn(
                    "p-3 bg-stone-50 rounded-xl border border-stone-100",
                    invoice.status === 'Overdue' && "bg-rose-50 border-rose-100"
                )}>
                    <span className={cn("text-xs block mb-1", invoice.status === 'Overdue' ? "text-rose-400" : "text-stone-400")}>Due Date</span>
                    <span className={cn("text-sm font-medium", invoice.status === 'Overdue' ? "text-rose-700" : "text-stone-900")}>{invoice.dueDate}</span>
                </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
                <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Line Items</h4>
                <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
                    {invoice.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-4 border-b border-stone-100 last:border-0">
                            <span className="text-sm text-stone-700">{item.description}</span>
                            <span className="text-sm font-medium text-stone-900">{item.price}</span>
                        </div>
                    ))}
                    <div className="p-4 bg-stone-50 flex justify-between items-center">
                        <span className="text-sm font-medium text-stone-900">Total</span>
                        <span className="text-lg font-bold text-stone-900">{invoice.amount}</span>
                    </div>
                </div>
            </div>

            {/* History / Timeline */}
            <div className="mb-8">
                <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">History</h4>
                <div className="space-y-4 pl-2 relative border-l border-stone-200 ml-2">
                    {invoice.history.map((event, i) => (
                        <div key={i} className="relative pl-6">
                            <div className={cn(
                                "absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-white",
                                i === 0 ? "border-teal-500" : "border-stone-300"
                            )} />
                            <p className="text-sm text-stone-900 font-medium">{event.action}</p>
                            <p className="text-xs text-stone-500">{event.date}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto flex gap-3 pb-safe">
                {invoice.status === 'Pending' || invoice.status === 'Overdue' ? (
                    <>
                        <Button className="flex-1 bg-teal-700 hover:bg-teal-800 text-white rounded-xl h-12 shadow-sm border-0">
                            <Send className="w-4 h-4 mr-2" /> Send Reminder
                        </Button>
                        <Button variant="outline" className="flex-1 border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl h-12">
                            <Share2 className="w-4 h-4 mr-2" /> Copy Link
                        </Button>
                    </>
                ) : (
                    <>
                        <Button className="flex-1 bg-stone-800 hover:bg-stone-900 text-white rounded-xl h-12 shadow-sm border-0">
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                        </Button>
                        <Button variant="ghost" className="h-12 text-stone-500 hover:text-stone-600 hover:bg-stone-50 rounded-xl px-4">
                            <RotateCcw className="w-5 h-5" />
                        </Button>
                    </>
                )}
            </div>
        </V3Overlay>
    );
}
