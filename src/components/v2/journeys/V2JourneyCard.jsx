import React from 'react';
import { cn } from "@/lib/utils";
import { ChevronRight, Users, Clock, Loader2, Sparkles } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function V2JourneyCard({ journey, isSelected, onClick }) {
    if (!journey) return null;

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
                    {/* Icon or AI Logo */}
                    {journey.isAI ? (
                        <div className="w-5 h-5 flex items-center justify-center rounded bg-indigo-500/10 text-indigo-400">
                            <Sparkles className="w-3.5 h-3.5" />
                        </div>
                    ) : (
                        <span className="text-lg">{journey.icon}</span>
                    )}

                    <h3 className={cn("text-sm font-bold truncate max-w-[140px]", isSelected ? "text-white" : "text-slate-200")}>
                        {journey.title}
                    </h3>
                    <Badge variant="outline" className={cn("text-[10px] h-4 px-1 border-0",
                        journey.status === 'Active' ? "bg-emerald-500/10 text-emerald-400" :
                            journey.status === 'Draft' ? "bg-amber-500/10 text-amber-400" :
                                "bg-slate-700 text-slate-400"
                    )}>
                        {journey.status}
                    </Badge>
                </div>
                <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isSelected ? "text-emerald-400 rotate-90" : "text-slate-600 group-hover:text-slate-400")} />
            </div>

            {/* Row 2: Stats */}
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                <span className="flex items-center gap-1 font-medium bg-slate-950/20 px-1.5 py-0.5 rounded">
                    {journey.steps?.length || 0} steps
                </span>
                <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {journey.enrolledCount} enrolled
                </span>
            </div>

            {/* Row 3: Progress Bar covering enrollment avg */}
            <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Avg Completion</span>
                    <span className="text-[10px] font-bold text-emerald-400">{journey.avgCompletion || 0}%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${journey.avgCompletion || 0}%` }}
                    />
                </div>
            </div>

            {/* Row 4: Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 text-[10px] text-slate-600">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {journey.duration || '4w'}</span>
                <span>Created {journey.createdDate || 'Today'}</span>
            </div>
        </div>
    );
}
