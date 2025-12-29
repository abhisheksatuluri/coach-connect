import React from 'react';
import { cn } from "@/lib/utils";

export default function V5StepNode({
    id,
    data, // { title, stepNumber }
    x,
    y,
    selected,
    onSelect,
    onDoubleClick
}) {
    return (
        <div
            className={cn(
                "absolute rounded-xl shadow-sm border transition-all duration-200 group select-none cursor-pointer bg-white",
                selected ? "ring-2 ring-emerald-500 ring-offset-2 border-emerald-500 z-10 scale-105 shadow-xl" : "border-stone-200 hover:border-emerald-300 hover:shadow-md"
            )}
            style={{
                left: x,
                top: y,
                width: 120,
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
            <div className="p-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                    {data.stepNumber}
                </div>
                <h3 className="text-xs font-semibold text-stone-800 leading-tight line-clamp-2">
                    {data.title}
                </h3>
            </div>

            {/* Ports */}
            <div className="absolute top-1/2 -left-1.5 w-2 h-2 bg-emerald-200 border border-emerald-400 rounded-full" />
            <div className="absolute top-1/2 -right-1.5 w-2 h-2 bg-emerald-200 border border-emerald-400 rounded-full" />
        </div>
    );
}
