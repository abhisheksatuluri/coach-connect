import React from 'react';
import { cn } from "@/lib/utils";
import { Video, Calendar } from 'lucide-react';

export default function V5SessionNode({
    id,
    data, // { title, date, time, status, type }
    x,
    y,
    selected,
    onSelect,
    onDoubleClick
}) {
    const isUpcoming = data.status === 'upcoming';

    return (
        <div
            className={cn(
                "absolute rounded-2xl shadow-sm border transition-all duration-200 group select-none cursor-pointer bg-violet-50",
                selected ? "ring-2 ring-violet-500 ring-offset-2 border-violet-500 z-10 scale-105 shadow-xl" : "border-stone-200 hover:border-violet-300 hover:shadow-md"
            )}
            style={{
                left: x,
                top: y,
                width: 180,
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
            <div className="h-1 w-full rounded-t-2xl bg-violet-500" />

            <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                    <div className="text-xs font-semibold text-violet-700 uppercase tracking-wider">{data.type || 'Session'}</div>
                    <div className={cn("w-2 h-2 rounded-full", isUpcoming ? "bg-violet-500 animate-pulse" : "bg-stone-300")} />
                </div>

                <h3 className="text-sm font-bold text-stone-900 mb-1 leading-tight">{data.title}</h3>

                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Calendar className="w-3 h-3" />
                    <span>{data.date || 'Today'} • {data.time || '10:00 AM'}</span>
                </div>
            </div>

            {/* Connection Ports */}
            {/* Left: Client Connection */}
            <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-white border border-stone-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 hover:border-violet-500 hover:bg-violet-50" />
        </div>
    );
}
