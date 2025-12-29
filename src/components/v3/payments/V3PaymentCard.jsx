import React from 'react';
import { cn } from "@/lib/utils";

export default function V3PaymentCard({ invoice, onClick }) {
    const getStatusColor = () => {
        switch (invoice.status) {
            case 'Paid': return 'bg-teal-50 text-teal-700 border-teal-100';
            case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Overdue': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-stone-100 text-stone-600 border-stone-200';
        }
    };

    return (
        <div
            onClick={onClick}
            className="group flex items-center h-[80px] px-4 cursor-pointer bg-white rounded-xl border border-stone-100 hover:border-teal-200 hover:shadow-sm hover:bg-stone-50 transition-all mb-2"
        >
            {/* Left: Amount */}
            <div className="flex-shrink-0 w-24">
                <span className="text-lg font-bold text-stone-900 group-hover:text-teal-900 transition-colors">
                    {invoice.amount}
                </span>
            </div>

            {/* Middle: Client + Date */}
            <div className="flex-1 min-w-0 px-4 border-l border-stone-100">
                <h3 className="text-sm font-medium text-stone-900 truncate">
                    {invoice.clientName}
                </h3>
                <p className="text-xs text-stone-500 truncate">
                    {invoice.date}
                </p>
            </div>

            {/* Right: Status */}
            <div className="flex-shrink-0">
                <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                    getStatusColor()
                )}>
                    {invoice.status}
                </span>
            </div>
        </div>
    );
}
