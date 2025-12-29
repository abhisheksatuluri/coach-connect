import React from 'react';
import { cn } from "@/lib/utils";

export default function V4TaskSectionHeader({ title, count, color = "text-stone-500", bg = "bg-stone-100" }) {
    return (
        <div className="flex items-center justify-between px-6 py-3 bg-stone-50/50 backdrop-blur-sm border-b border-stone-200 sticky top-16 z-0">
            <h3 className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-2", color)}>
                {title}
                <span className={cn("px-1.5 py-0.5 rounded-md text-[10px]", bg)}>
                    {count}
                </span>
            </h3>
        </div>
    );
}
