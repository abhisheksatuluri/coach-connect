import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function V3TaskCard({ task, onClick, onComplete }) {
    const [complete, setComplete] = useState(task.completed);

    const handleCheck = (e) => {
        e.stopPropagation();
        setComplete(!complete);
        if (onComplete) onComplete(task.id);
        // In a real app, we'd wait for animation before triggering callback
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "group flex items-center min-h-[56px] px-3 py-2 cursor-pointer bg-white rounded-lg border border-transparent hover:border-stone-200 hover:bg-stone-50 transition-all",
                complete && "opacity-50"
            )}
        >
            {/* Checkbox */}
            <div
                onClick={handleCheck}
                className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-colors cursor-pointer",
                    complete ? "bg-teal-500 border-teal-500" : "border-stone-300 group-hover:border-teal-400"
                )}
            >
                {complete && <Check className="w-3 h-3 text-white" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h3 className={cn(
                    "text-sm font-medium truncate transition-all",
                    complete ? "text-stone-400 line-through" : "text-stone-800"
                )}>
                    {task.title}
                </h3>
                {task.detail && (
                    <p className="text-xs text-stone-400 truncate mt-0.5">{task.detail}</p>
                )}
            </div>

            {/* Tag */}
            {task.priority === 'High' && !complete && (
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 ml-2" />
            )}
        </div>
    );
}
