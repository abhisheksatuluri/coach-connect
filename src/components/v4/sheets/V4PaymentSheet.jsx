import React from 'react';
import V4BottomSheet from '@/components/v4/V4BottomSheet';
import { Receipt, CheckCircle2, Clock, Mail, Download, CornerUpLeft, User, CreditCard } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function V4PaymentSheet({ payment, isOpen, onClose }) {
    if (!payment) return null;

    const isPaid = payment.status === 'paid' || payment.type === 'payment_received';
    const isOverdue = payment.status === 'overdue' || payment.type === 'payment_overdue';

    return (
        <V4BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Invoice Details"
        >
            <div className="space-y-6 pb-20">
                {/* Header Context */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className={cn(
                                "px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border",
                                isPaid ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    isOverdue ? "bg-rose-50 text-rose-600 border-rose-100" :
                                        "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                                {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                            </div>
                            <span className="text-stone-400 text-xs">#INV-2024-001</span>
                        </div>
                        <h2 className="text-4xl font-bold text-stone-900 tracking-tight">
                            {payment.amount || '£150.00'}
                        </h2>
                        <p className="text-stone-500 text-sm mt-1">Due {payment.dueDate || 'Dec 30, 2024'}</p>
                    </div>
                    <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
                        <Receipt className="w-6 h-6 text-stone-400" />
                    </div>
                </div>

                <div className="h-px bg-stone-100" />

                {/* Client Info */}
                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        SM
                    </div>
                    <div>
                        <div className="font-bold text-stone-900">{payment.clientName || 'Sarah Mitchell'}</div>
                        <div className="text-xs text-stone-500">sarah.m@example.com</div>
                    </div>
                    <button className="ml-auto p-2 text-stone-400 hover:text-stone-600">
                        <User className="w-5 h-5" />
                    </button>
                </div>

                {/* Line Items */}
                <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Line Items</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-start text-sm">
                            <span className="text-stone-700 font-medium">1:1 Coaching Session (60m)</span>
                            <span className="text-stone-900 font-bold">£150.00</span>
                        </div>
                        <div className="flex justify-between items-start text-sm text-stone-400">
                            <span>Processing Fee</span>
                            <span>£0.00</span>
                        </div>
                    </div>
                    <div className="border-t border-stone-100 mt-4 pt-4 flex justify-between items-end">
                        <span className="text-sm font-bold text-stone-900">Total</span>
                        <span className="text-xl font-bold text-stone-900">£150.00</span>
                    </div>
                </div>

                {/* Timeline */}
                <div className="pt-4 border-t border-stone-100">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">History</h4>
                    <div className="space-y-4">
                        <div className="flex gap-3 relative">
                            <div className="w-2 h-2 rounded-full bg-stone-300 mt-1.5 shrink-0" />
                            <div className="pb-4 border-l border-stone-100 pl-4 -ml-[19px]">
                                <p className="text-sm text-stone-900 font-medium">Invoice Created</p>
                                <p className="text-xs text-stone-400">Dec 15, 2024 • 10:30 AM</p>
                            </div>
                        </div>
                        <div className="flex gap-3 relative">
                            <div className="w-2 h-2 rounded-full bg-stone-300 mt-1.5 shrink-0" />
                            <div className="pb-4 border-l border-stone-100 pl-4 -ml-[19px]">
                                <p className="text-sm text-stone-900 font-medium">Sent to Client</p>
                                <p className="text-xs text-stone-400">Dec 15, 2024 • 10:35 AM</p>
                            </div>
                        </div>
                        {isPaid && (
                            <div className="flex gap-3 relative">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                <div className="pl-4 -ml-[19px]">
                                    <p className="text-sm text-stone-900 font-medium">Payment Received</p>
                                    <p className="text-xs text-stone-400">Dec 16, 2024 • 02:15 PM</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-stone-100">
                    {isPaid ? (
                        <>
                            <button className="flex-1 py-3 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> Download PDF
                            </button>
                            <button className="px-4 py-3 text-stone-400 hover:text-stone-600 rounded-xl font-medium transition-colors flex items-center gap-2">
                                <CornerUpLeft className="w-4 h-4" /> Refund
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium shadow-sm transition-colors flex items-center justify-center gap-2">
                                <Mail className="w-4 h-4" /> Resend Invoice
                            </button>
                            <button className="flex-1 py-3 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Mark Paid
                            </button>
                        </>
                    )}
                </div>
            </div>
        </V4BottomSheet>
    );
}
