import React from 'react';
import { cn } from "@/lib/utils";
import { PoundSterling, Calendar, Download, RefreshCw, Send, CheckCircle2, AlertCircle, User } from 'lucide-react';

export default function V5PaymentWindow({ data }) {
    const payment = data || { amount: 0, status: 'pending', items: [] };
    const isPaid = payment.status === 'paid';
    const isOverdue = payment.status === 'overdue';

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-stone-100 bg-teal-50/30">
                <div className="flex justify-between items-start mb-2">
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                        Invoice #{payment.invoiceId || 'INV-001'}
                    </div>
                    <div className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1",
                        isPaid ? "bg-teal-100 text-teal-700" : (isOverdue ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")
                    )}>
                        {isPaid && <CheckCircle2 className="w-3 h-3" />}
                        {isOverdue && <AlertCircle className="w-3 h-3" />}
                        {payment.status}
                    </div>
                </div>

                <div className="flex items-baseline text-3xl font-bold text-stone-900 mb-1">
                    <span className="text-lg text-stone-400 font-medium mr-1">£</span>
                    {payment.amount}
                </div>

                <div className="flex items-center gap-2 mt-2 p-2 bg-white rounded-lg border border-stone-100 shadow-sm cursor-pointer hover:border-teal-200 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                        <User className="w-3 h-3" />
                    </div>
                    <div className="text-sm font-medium text-stone-900">{payment.clientName || 'Client Name'}</div>
                    <div className="text-xs text-stone-400 ml-auto">View Profile</div>
                </div>
            </div>

            {/* Details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Dates Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="text-[10px] font-bold text-stone-400 uppercase">Issued</div>
                        <div className="text-sm font-medium text-stone-900 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            {payment.issueDate || 'Oct 24, 2024'}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] font-bold text-stone-400 uppercase">Due</div>
                        <div className={cn(
                            "text-sm font-medium flex items-center gap-1.5",
                            isOverdue ? "text-red-600" : "text-stone-900"
                        )}>
                            <Calendar className="w-3.5 h-3.5 text-inherit" />
                            {payment.dueDate || 'Oct 31, 2024'}
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="space-y-3">
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 pb-2">Line Items</div>
                    <div className="space-y-2">
                        {(payment.items || [{ desc: 'Therapy Session (60m)', price: payment.amount }]).map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <span className="text-stone-700">{item.desc}</span>
                                <span className="font-semibold text-stone-900">£{item.price}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-stone-100 mt-2">
                        <span className="font-bold text-stone-900">Total</span>
                        <span className="font-bold text-xl text-teal-600">£{payment.amount}</span>
                    </div>
                </div>

                {/* Timeline (Simplified) */}
                <div className="relative pl-4 border-l-2 border-stone-100 space-y-6 my-4">
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-stone-300 border-2 border-white" />
                        <div className="text-xs text-stone-500">Invoice Created</div>
                    </div>
                    <div className="relative">
                        <div className={cn(
                            "absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white",
                            isPaid ? "bg-teal-500" : "bg-stone-300"
                        )} />
                        <div className={cn("text-xs", isPaid ? "text-stone-900 font-medium" : "text-stone-400")}>
                            {isPaid ? "Payment Received" : "Awaiting Payment"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-stone-100 flex gap-2 bg-stone-50">
                {isPaid ? (
                    <>
                        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-sm font-medium transition-colors">
                            <Download className="w-4 h-4" />
                            PDF
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-200 hover:text-red-600 text-stone-700 rounded-lg text-sm font-medium transition-colors">
                            <RefreshCw className="w-4 h-4" />
                            Refund
                        </button>
                    </>
                ) : (
                    <>
                        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-sm font-medium transition-colors">
                            <Send className="w-4 h-4" />
                            Resend
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                            Mark Paid
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
