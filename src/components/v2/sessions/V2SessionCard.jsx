import React from 'react';
import { cn } from "@/lib/utils";
import { ChevronRight, Calendar, Video, User, FileText } from 'lucide-react';

export default function V2SessionCard({ session, isSelected, onClick }) {
    if (!session) return null;

    const statusColors = {
        'upcoming': 'bg-emerald-500',
        'scheduled': 'bg-blue-500',
        'completed': 'bg-slate-500',
        'cancelled': 'bg-rose-500'
    };

    const statusKey = session.status?.toLowerCase() || 'scheduled';

    return (
        <div
            className={cn(
                "group p-3 rounded-lg border border-slate-800/50 cursor-pointer transition-all duration-200 relative mb-2",
                isSelected
                    ? "bg-slate-800 border-l-4 border-l-purple-500 border-t-slate-700 border-r-slate-700 border-b-slate-700 shadow-lg"
                    : "bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700"
            )}
            onClick={onClick}
        >
            {/* Row 1: Meta */}
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", statusColors[statusKey] || 'bg-slate-500')} />
                    <span className={cn("text-xs font-medium", statusKey === 'in-progress' ? "text-blue-400 animate-pulse" : "text-slate-400")}>
                        {session.time}
                    </span>
                    <span className="text-xs text-slate-500">• {session.duration}</span>
                </div>
                <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isSelected ? "text-purple-400 rotate-90" : "text-slate-600 group-hover:text-slate-400")} />
            </div>

            {/* Row 2: Title */}
            <h3 className={cn("text-sm font-bold mb-2 truncate", isSelected ? "text-white" : "text-slate-200")}>
                {session.title}
            </h3>

            {/* Row 3: Client & Location */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                        {session.clientName?.charAt(0) || 'C'}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{session.clientName}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Video className="w-3 h-3 text-slate-500" />
                    {session.notesCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-500">
                            <FileText className="w-3 h-3" /> {session.notesCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
