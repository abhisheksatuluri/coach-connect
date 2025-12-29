import React from 'react';
import { cn } from "@/lib/utils";
import { MoreHorizontal } from 'lucide-react';

export default function V5Node({
    id,
    type,
    title,
    details,
    color = "bg-white",
    accentColor = "bg-stone-500",
    icon: Icon,
    x,
    y,
    selected,
    onSelect,
    onDoubleClick,
    ...props
}) {
    return (
        <div
            className={cn(
                "absolute rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border transition-all duration-300 group select-none cursor-pointer flex flex-col overflow-hidden",
                selected ? "ring-2 ring-blue-500 ring-offset-2 border-blue-500 z-10 shadow-[0_8px_24px_rgba(37,99,235,0.15)]" : "border-slate-200 hover:border-blue-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5",
                "bg-white" // Enforce white background for clean Figma look
            )}
            style={{
                left: x,
                top: y,
                width: 200, // Slightly more compact
                minHeight: 100
            }}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(id);
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onDoubleClick(id);
            }}
            onMouseDown={props.onMouseDown}
            onContextMenu={props.onContextMenu}
        >
            {/* Top Color Bar */}
            <div className={cn("h-[4px] w-full", accentColor)} />

            <div className="p-4 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-transparent", accentColor.replace('bg-', 'bg-').replace('500', '50'))}>
                        {Icon && <Icon className={cn("w-4.5 h-4.5", accentColor.replace('bg-', 'text-'))} />}
                    </div>
                </div>

                {/* Content */}
                <h3 className="text-[14px] font-semibold text-slate-800 mb-1 leading-snug">{title}</h3>
                <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2">{details}</p>
            </div>

            {/* Connection Ports (Invisible but existent for future) */}
            <div className="absolute top-1/2 -left-1 w-2 h-2 bg-slate-300 rounded-full opacity-0" />
            <div className="absolute top-1/2 -right-1 w-2 h-2 bg-slate-300 rounded-full opacity-0" />
        </div>
    );
}
