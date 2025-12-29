import React from 'react';
import { cn } from "@/lib/utils";
import { CreditCard, CheckCircle2, AlertCircle, FileText, ArrowRight, MoreHorizontal, Receipt } from 'lucide-react';

export default function V4PaymentFeedItem({ item, onClick }) {
    const isReceived = item.type === 'payment_received';
    const isOverdue = item.type === 'payment_overdue';

    return (
        <div
            onClick={() => onClick(item)}
            className={cn(
                "group relative border-b border-stone-100 p-6 cursor-pointer transition-colors flex gap-4",
                isReceived ? "bg-emerald-50/10 hover:bg-emerald-50/30" : isOverdue ? "bg-rose-50/10 hover:bg-rose-50/30" : "bg-white hover:bg-stone-50"
            )}
        >
            {/* Color Bar */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                isReceived ? "bg-emerald-500" : isOverdue ? "bg-rose-500" : "bg-teal-500"
            )} />

            {/* Icon */}
            <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                isReceived ? "bg-emerald-100 border-emerald-200" : isOverdue ? "bg-rose-100 border-rose-200" : "bg-teal-50 border-teal-100"
            )}>
                {isReceived ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isOverdue ? (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                ) : (
                    <Receipt className="w-5 h-5 text-teal-600" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <span className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        isReceived ? "text-emerald-600" : isOverdue ? "text-rose-600" : "text-teal-600"
                    )}>
                        {isReceived ? 'Payment Received' : isOverdue ? 'Overdue Invoice' : 'Invoice Activity'}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">{item.timestamp}</span>
                </div>

                <h3 className="text-base font-medium text-stone-900 mb-1 flex items-center gap-2">
                    {item.title}
                </h3>

                <div className="text-xl font-bold text-stone-900 mb-1">
                    {item.amount || '£0.00'}
                </div>

                <div className="flex items-center gap-2 text-sm text-stone-500">
                    <span>From</span>
                    <span className="font-medium text-stone-900">{item.clientName}</span>
                    {isOverdue && (
                        <span className="text-rose-500 font-medium ml-2">• {item.overdueDays || '5'} days late</span>
                    )}
                </div>
            </div>

            {/* Hover Action */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                <button className="p-2 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-600">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
