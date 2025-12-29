import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { CheckSquare, Square, Check, Clock, AlertCircle, MoreHorizontal } from 'lucide-react';

export default function V4TaskFeedItem({ item, onClick }) {
    const [isCompleted, setIsCompleted] = useState(item.type === 'task_completed');
    const isOverdue = item.type === 'task_overdue';
    const isToday = item.type === 'task_due_today';

    const handleCheck = (e) => {
        e.stopPropagation(); // Prevent opening sheet
        setIsCompleted(!isCompleted);
    };

    return (
        <div
            onClick={() => onClick(item)}
            className={cn(
                "group relative border-b border-stone-100 p-6 cursor-pointer transition-all flex gap-4",
                isOverdue ? "bg-rose-50/30 hover:bg-rose-50/50" : isToday ? "bg-amber-50/10 hover:bg-amber-50/30" : "bg-white hover:bg-stone-50",
                isCompleted && "bg-stone-50 opacity-60"
            )}
        >
            {/* Amber Color Bar (Red if overdue) */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                isOverdue ? "bg-rose-400" : isCompleted ? "bg-stone-300" : "bg-amber-500"
            )} />

            {/* Interactive Checkbox Icon */}
            <div
                onClick={handleCheck}
                className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all cursor-pointer z-10",
                    isCompleted
                        ? "bg-green-100 border-green-200 text-green-600"
                        : isOverdue
                            ? "bg-white border-rose-300 text-rose-400 hover:border-rose-400"
                            : "bg-white border-stone-200 text-stone-300 hover:border-amber-400 hover:text-amber-400"
                )}
            >
                {isCompleted ? <Check className="w-5 h-5" /> : <div className="w-5 h-5 rounded-md border-2 border-current" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-start mb-0.5">
                    <div className="flex items-center gap-2">
                        {isOverdue && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-rose-100 text-rose-600">
                                <AlertCircle className="w-3 h-3" /> Overdue
                            </span>
                        )}
                        {isToday && !isOverdue && !isCompleted && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-600">
                                <Clock className="w-3 h-3" /> Due Today
                            </span>
                        )}
                    </div>
                </div>

                <h3 className={cn(
                    "text-base font-medium mb-1 transition-colors",
                    isCompleted ? "text-stone-400 line-through" : "text-stone-900",
                    !isCompleted && "group-hover:text-amber-600"
                )}>
                    {item.title}
                </h3>

                <div className="flex items-center gap-3 text-sm text-stone-500">
                    <span>{item.time || item.timestamp}</span>
                    {item.linkedEntity && (
                        <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <span className={cn("w-1.5 h-1.5 rounded-full", item.linkedEntityColor || "bg-stone-300")} />
                                {item.linkedEntity}
                            </span>
                        </>
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
