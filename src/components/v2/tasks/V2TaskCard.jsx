import React from 'react';
import { cn } from "@/lib/utils";
import { ChevronRight, Calendar, User, Map, Check, Sparkles } from 'lucide-react';

export default function V2TaskCard({ task, isSelected, onClick, onToggle }) {
    if (!task) return null;

    const priorityColors = {
        'High': 'bg-rose-500',
        'Medium': 'bg-amber-500',
        'Low': 'bg-green-500'
    };

    return (
        <div
            className={cn(
                "group p-3 rounded-lg border border-slate-800/50 cursor-pointer transition-all duration-200 relative mb-2 flex gap-3",
                isSelected
                    ? "bg-slate-800 border-l-4 border-l-emerald-500 border-t-slate-700 border-r-slate-700 border-b-slate-700 shadow-lg"
                    : "bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700"
            )}
            onClick={onClick}
        >
            {/* Checkbox Area */}
            <div
                className="mt-0.5 flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); onToggle && onToggle(task.id); }}
            >
                <div className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                    task.status === 'Done' ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-600 hover:border-indigo-400 bg-slate-950"
                )}>
                    {task.status === 'Done' && <Check className="w-3.5 h-3.5" />}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        {task.isAI && <Sparkles className="w-3 h-3 text-indigo-400" />}
                        <h3 className={cn(
                            "text-sm font-medium truncate",
                            task.status === 'Done' ? "text-slate-500 line-through" : (isSelected ? "text-white" : "text-slate-200")
                        )}>
                            {task.title}
                        </h3>
                        {task.priority && (
                            <div className={cn("w-2 h-2 rounded-full", priorityColors[task.priority])} title={`${task.priority} Priority`} />
                        )}
                    </div>
                    <span className={cn(
                        "text-[10px] font-medium",
                        task.overdue ? "text-rose-400" : "text-slate-500"
                    )}>
                        {task.dueDate}
                    </span>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    {(task.clientName || task.client) && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-950/30 px-1.5 py-0.5 rounded border border-slate-800">
                            <User className="w-3 h-3 text-indigo-400" /> {task.clientName || task.client}
                        </div>
                    )}
                    {(task.journeyName || task.journey) && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-950/30 px-1.5 py-0.5 rounded border border-slate-800">
                            <Map className="w-3 h-3 text-emerald-400" /> {task.journeyName || task.journey}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
