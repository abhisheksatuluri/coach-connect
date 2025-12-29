import React from 'react';
import { cn } from "@/lib/utils";
import { PoundSterling, Check, AlertCircle, Clock } from 'lucide-react';

export default function V5PaymentNode({
    id,
    data, // { amount, clientName, status, date }
    x,
    y,
    selected,
    onSelect,
    onDoubleClick
}) {
    const isOverdue = data.status === 'overdue';
    const isPaid = data.status === 'paid';
    const isPending = data.status === 'pending';

    return (
        <div
            className={cn(
                "absolute rounded-xl shadow-sm border transition-all duration-200 group select-none cursor-pointer bg-teal-50",
                selected
                    ? "ring-2 ring-teal-500 ring-offset-2 border-teal-500 z-10 scale-105 shadow-xl"
                    : (isOverdue ? "border-red-300 hover:border-red-400 shadow-red-100" : "border-stone-200 hover:border-teal-300 hover:shadow-md"),
                isOverdue && "bg-red-50"
            )}
            style={{
                left: x,
                top: y,
                width: 160,
            }}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(id);
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onDoubleClick(id);
            }}
        >
            {/* Top Color Bar */}
            <div className={cn(
                "h-1 w-full rounded-t-xl",
                isOverdue ? "bg-red-500" : "bg-teal-500"
            )} />

            <div className="p-3">
                <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center text-stone-900 font-bold text-lg leading-none">
                        <PoundSterling className="w-4 h-4 mr-0.5" />
                        {data.amount}
                    </div>
                    {isPaid && <div className="p-0.5 bg-teal-100 rounded-full text-teal-600"><Check className="w-3 h-3" /></div>}
                    {isPending && <div className="p-0.5 bg-amber-100 rounded-full text-amber-600"><Clock className="w-3 h-3" /></div>}
                    {isOverdue && <div className="p-0.5 bg-red-100 rounded-full text-red-600"><AlertCircle className="w-3 h-3" /></div>}
                </div>

                <div className="text-xs font-semibold text-stone-700 truncate">{data.clientName}</div>
                <div className={cn(
                    "text-[10px] uppercase font-bold tracking-wide mt-1",
                    isPaid ? "text-teal-600" : (isOverdue ? "text-red-600" : "text-amber-600")
                )}>
                    {data.status}
                </div>
            </div>

            {/* Connection Ports */}
            <div className="absolute top-1/2 -right-1.5 w-2 h-2 bg-white border border-stone-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 hover:border-teal-500 hover:bg-teal-50" />
        </div>
    );
}
