import React from 'react';
import { cn } from "@/lib/utils";
import { Users, MoreHorizontal } from 'lucide-react';

export default function V5ClientNode({
    id,
    data, // { name, status, stats: { sessions, journeys }, avatar }
    x,
    y,
    selected,
    onSelect,
    onDoubleClick
}) {
    return (
        <div
            className={cn(
                "absolute rounded-2xl shadow-sm border transition-all duration-200 group select-none cursor-pointer bg-blue-50",
                selected ? "ring-2 ring-blue-500 ring-offset-2 border-blue-500 z-10 scale-105 shadow-xl" : "border-stone-200 hover:border-blue-300 hover:shadow-md"
            )}
            style={{
                left: x,
                top: y,
                width: 200,
                // height: 100 // Auto height based on content
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
            <div className="h-1 w-full rounded-t-2xl bg-blue-500" />

            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm shrink-0">
                        {data.avatar || data.title?.charAt(0) || 'C'}
                    </div>

                    {/* Name & Status */}
                    <div className="overflow-hidden">
                        <h3 className="text-sm font-bold text-stone-900 leading-tight truncate">{data.title}</h3>
                        <span className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-block mt-0.5",
                            data.status === 'Active' ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-600"
                        )}>
                            {data.status || 'Active'}
                        </span>
                    </div>
                </div>

                {/* Stats Line */}
                <div className="text-xs text-stone-500 flex items-center justify-between border-t border-blue-100/50 pt-2">
                    <span>{data.stats?.sessions || 0} sessions</span>
                    <span>•</span>
                    <span>{data.stats?.journeys || 0} journeys</span>
                </div>
            </div>

            {/* Connection Ports (Appear on Hover) */}
            {/* Right: Sessions */}
            <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-white border border-stone-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 hover:border-blue-500 hover:bg-blue-50" title="Sessions" />

            {/* Bottom: Journeys */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-stone-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 hover:border-blue-500 hover:bg-blue-50" title="Journeys" />

            {/* Left: Practitioner */}
            <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-white border border-stone-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 hover:border-blue-500 hover:bg-blue-50" title="Referral" />
        </div>
    );
}
