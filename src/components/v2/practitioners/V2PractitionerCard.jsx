import React from 'react';
import { cn } from "@/lib/utils";
import { ChevronRight, Stethoscope, Mail, Phone } from 'lucide-react';

export default function V2PractitionerCard({ practitioner, isSelected, onClick }) {
    const statusColors = {
        'Active': 'bg-emerald-500',
        'Pending Approval': 'bg-amber-500',
        'Inactive': 'bg-slate-500'
    };

    return (
        <div
            className={cn(
                "group p-3 rounded-lg border border-slate-800/50 cursor-pointer transition-all duration-200 relative mb-2",
                isSelected
                    ? "bg-slate-800 border-l-4 border-l-cyan-500 border-t-slate-700 border-r-slate-700 border-b-slate-700 shadow-lg"
                    : "bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700"
            )}
            onClick={onClick}
        >
            {/* Row 1: Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                            {practitioner.avatar}
                        </div>
                        <div className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900",
                            statusColors[practitioner.status]
                        )} />
                    </div>
                    <div>
                        <h3 className={cn("text-sm font-bold leading-none mb-1", isSelected ? "text-white" : "text-slate-200")}>
                            {practitioner.name}
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <Stethoscope className="w-3 h-3 text-cyan-400" />
                            <span className="text-[11px] text-cyan-300 font-medium">{practitioner.specialty}</span>
                        </div>
                    </div>
                </div>
                <ChevronRight className={cn("w-4 h-4 transition-transform", isSelected ? "text-cyan-400 rotate-90" : "text-slate-600 group-hover:text-slate-400")} />
            </div>

            {/* Row 2: Contact */}
            <div className="flex items-center gap-3 mb-2 px-1 text-[11px] text-slate-500">
                {practitioner.email && (
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {practitioner.email}</span>
                )}
                {practitioner.phone && (
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {practitioner.phone}</span>
                )}
            </div>

            {/* Row 3: Stats */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-[10px] text-slate-400">
                <span className="font-medium text-slate-300">{practitioner.referrals} referrals</span>
                <span>Last: {practitioner.lastReferral}</span>
            </div>
        </div>
    );
}
