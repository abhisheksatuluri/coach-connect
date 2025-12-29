import React from 'react';
import { cn } from "@/lib/utils";
import { ChevronRight, Mail, Calendar, TrendingUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function V2ClientCard({ client, isSelected, onClick }) {
    if (!client) return null;

    return (
        <div
            className={cn(
                "group p-3 rounded-lg border border-slate-800/50 cursor-pointer transition-all duration-200 relative mb-2",
                isSelected
                    ? "bg-slate-800 border-l-4 border-l-indigo-500 border-t-slate-700 border-r-slate-700 border-b-slate-700 shadow-lg"
                    : "bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700"
            )}
            onClick={onClick}
        >
            {/* Row 1: Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                            {client.initials}
                        </div>
                        <div className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900",
                            client.status === 'Active' ? "bg-emerald-500" : "bg-slate-500"
                        )} />
                    </div>
                    <div>
                        <h3 className={cn("text-sm font-bold leading-none", isSelected ? "text-white" : "text-slate-200")}>
                            {client.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {client.email}
                            </span>
                        </div>
                    </div>
                </div>
                <ChevronRight className={cn("w-4 h-4 transition-transform", isSelected ? "text-indigo-400 rotate-90" : "text-slate-600 group-hover:text-slate-400")} />
            </div>

            {/* Row 2: Stats */}
            <div className="flex items-center gap-3 mb-2 px-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-950/30 px-2 py-1 rounded">
                    <span className="font-semibold text-slate-300">{client.stats?.totalSessions || 0}</span> Sess
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-950/30 px-2 py-1 rounded">
                    <span className="font-semibold text-slate-300">{client.stats?.activeJourneys || 0}</span> Jrny
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/80 bg-emerald-950/10 px-2 py-1 rounded">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-bold">${client.stats?.totalPaid || 0}</span>
                </div>
            </div>

            {/* Row 3: Next Action */}
            {client.nextSession && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/50">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    <span className="text-[11px] text-indigo-300 font-medium truncate">
                        Next: {client.nextSession}
                    </span>
                </div>
            )}
        </div>
    );
}
