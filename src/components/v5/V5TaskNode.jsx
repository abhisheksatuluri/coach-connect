import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { CheckSquare, AlertCircle, Calendar } from 'lucide-react';

export default function V5TaskNode({
    id,
    data, // { title, dueDate, status, priority }
    x,
    y,
    selected,
    onSelect,
    onDoubleClick
}) {
    const [completed, setCompleted] = useState(data.status === 'completed');
    const isOverdue = data.status === 'overdue';

    const handleCheckboxClick = (e) => {
        e.stopPropagation();
        setCompleted(!completed);
        // In real app, bubble up completion event
    };

    return (
        <div
            className={cn(
                "absolute rounded-xl shadow-sm border transition-all duration-200 group select-none cursor-pointer",
                completed
                    ? "bg-stone-50 border-stone-200 opacity-80"
                    : "bg-amber-50",
                selected
                    ? "ring-2 ring-amber-500 ring-offset-2 border-amber-500 z-10 scale-105 shadow-xl"
                    : (isOverdue ? "border-red-300 hover:border-red-400" : "border-stone-200 hover:border-amber-300 hover:shadow-md")
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
                completed ? "bg-stone-300" : (isOverdue ? "bg-red-400" : "bg-amber-500")
            )} />

            <div className="p-3">
                <div className="flex items-start gap-2.5">
                    <button
                        onClick={handleCheckboxClick}
                        className={cn(
                            "w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                            completed
                                ? "bg-amber-500 border-amber-500 text-white"
                                : "bg-white border-stone-300 hover:border-amber-400"
                        )}
                    >
                        {completed && <CheckSquare className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex-1 min-w-0">
                        <h3 className={cn(
                            "text-xs font-semibold text-stone-900 leading-tight mb-1 truncate",
                            completed && "line-through text-stone-500"
                        )}>
                            {data.title}
                        </h3>
                        {data.dueDate && (
                            <div className={cn(
                                "flex items-center gap-1 text-[10px]",
                                isOverdue ? "text-red-600 font-medium" : "text-stone-500"
                            )}>
                                {isOverdue && <AlertCircle className="w-3 h-3" />}
                                <span>{data.dueDate}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Connection Ports (Appear on Hover) */}
            <div className="absolute top-1/2 -left-1.5 w-2.5 h-2.5 bg-white border border-stone-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 hover:border-amber-500 hover:bg-amber-50" />
        </div>
    );
}
