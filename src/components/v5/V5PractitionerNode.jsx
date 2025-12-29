import React from 'react';
import { cn } from "@/lib/utils";
import { User, ShieldCheck } from 'lucide-react';

export default function V5PractitionerNode({
    id,
    data, // { name, specialty, status, avatar }
    x,
    y,
    selected,
    onSelect,
    onDoubleClick
}) {
    return (
        <div
            className={cn(
                "absolute rounded-xl shadow-sm border transition-all duration-200 group select-none cursor-pointer bg-orange-50",
                selected ? "ring-2 ring-orange-500 ring-offset-2 border-orange-500 z-10 scale-105 shadow-xl" : "border-stone-200 hover:border-orange-300 hover:shadow-md"
            )}
            style={{
                left: x,
                top: y,
                width: 200,
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
            <div className="h-1 w-full rounded-t-xl bg-orange-500" />

            <div className="p-3 flex items-center gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 shrink-0 border-2 border-white shadow-sm overflow-hidden relative">
                    {data.avatar ? (
                        <img src={data.avatar} alt={data.name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-5 h-5" />
                    )}
                    {/* Status Dot */}
                    <div className={cn(
                        "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white",
                        data.status === 'active' ? "bg-green-500" : "bg-amber-400"
                    )} />
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-stone-900 leading-tight truncate">{data.name}</h3>
                    <div className="text-[10px] text-orange-700 font-medium bg-orange-100/50 px-1.5 py-0.5 rounded w-fit mt-0.5 truncate">
                        {data.specialty || 'Practitioner'}
                    </div>
                </div>
            </div>

            {/* Connection Ports */}
            <div className="absolute top-1/2 -left-1.5 w-2 h-2 bg-white border border-stone-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 hover:border-orange-500 hover:bg-orange-50" />
            <div className="absolute top-1/2 -right-1.5 w-2 h-2 bg-white border border-stone-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 hover:border-orange-500 hover:bg-orange-50" />
        </div>
    );
}
