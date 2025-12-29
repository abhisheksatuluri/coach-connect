import React from 'react';
import { cn } from "@/lib/utils";
import { ChevronRight, DollarSign, Calendar, User, Package } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function V2PaymentCard({ payment, isSelected, onClick }) {
    const statusConfig = {
        'Paid': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        'Pending': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        'Overdue': { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
        'Refunded': { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    };

    const status = statusConfig[payment.status] || statusConfig['Pending'];

    return (
        <div
            className={cn(
                "group p-3 rounded-lg border border-slate-800/50 cursor-pointer transition-all duration-200 relative mb-2",
                isSelected
                    ? "bg-slate-800 border-l-4 border-l-emerald-500 border-t-slate-700 border-r-slate-700 border-b-slate-700 shadow-lg"
                    : "bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700"
            )}
            onClick={onClick}
        >
            {/* Row 1: Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">#{payment.invoiceNumber}</span>
                    <span className={cn("text-base font-bold", isSelected ? "text-white" : "text-slate-200")}>
                        {payment.amount}
                    </span>
                    <Badge variant="outline" className={cn("text-[10px] h-4 px-1 border", status.bg, status.color, status.border)}>
                        {payment.status}
                    </Badge>
                </div>
                <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isSelected ? "text-emerald-400 rotate-90" : "text-slate-600 group-hover:text-slate-400")} />
            </div>

            {/* Row 2: Client & Date */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <User className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-300 truncate">{payment.clientName}</span>
                </div>
                <span className="text-[10px] text-slate-500">{payment.dateIssued}</span>
            </div>

            {/* Row 3: Package & Due Date */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Package className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{payment.packageName}</span>
                </div>
                {payment.status !== 'Paid' && (
                    <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-slate-500">Due:</span>
                        <span className={cn("font-medium", payment.isOverdue ? "text-rose-400" : "text-slate-300")}>
                            {payment.dueDate}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
