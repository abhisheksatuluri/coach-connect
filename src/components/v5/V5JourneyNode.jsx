import React from 'react';
import { cn } from "@/lib/utils";
import { Map, Users, ChevronRight } from 'lucide-react';

export default function V5JourneyNode({
    id,
    data, // { title, stats: { steps, enrolled, completion } }
    x,
    y,
    selected,
    onSelect,
    onDoubleClick
}) {
    return (
        <div
            className={cn(
                "absolute rounded-2xl shadow-sm border transition-all duration-200 group select-none cursor-pointer bg-emerald-50",
                selected ? "ring-2 ring-emerald-500 ring-offset-2 border-emerald-500 z-10 scale-105 shadow-xl" : "border-stone-200 hover:border-emerald-300 hover:shadow-md"
            )}
            style={{
                left: x,
                top: y,
                width: 220,
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
            <div className="h-1 w-full rounded-t-2xl bg-emerald-500" />

            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Map className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 leading-tight">{data.title}</h3>
                </div>

                <div className="flex justify-between items-center text-xs text-stone-500 mb-2">
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{data.stats?.enrolled || 0} enrolled</span>
                    </div>
                    <span>{data.stats?.steps || 0} steps</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${data.stats?.completion || 0}%` }}
                    />
                </div>
            </div>

            {/* Connection Ports */}
            {/* Top: Clients */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-stone-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 hover:border-emerald-500 hover:bg-emerald-50" title="Enrolled Clients" />

            {/* Right: Steps Expansion */}
            <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-white border border-stone-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center" title="Expand Steps">
                <ChevronRight className="w-2 h-2 text-stone-400" />
            </div>
        </div>
    );
}
