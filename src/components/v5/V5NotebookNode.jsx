import React from 'react';
import { cn } from "@/lib/utils";
import { Copy, FileText, User, Video, File } from 'lucide-react';

export default function V5NotebookNode({
    id,
    data, // { title, type, preview, linkedTo }
    x,
    y,
    selected,
    onSelect,
    onDoubleClick
}) {
    const getIcon = () => {
        if (data.type === 'file') return File;
        return FileText; // Default note
    };

    const Icon = getIcon();

    return (
        <div
            className={cn(
                "absolute rounded-xl shadow-sm border transition-all duration-200 group select-none cursor-pointer bg-pink-50",
                selected ? "ring-2 ring-pink-500 ring-offset-2 border-pink-500 z-10 scale-105 shadow-xl" : "border-stone-200 hover:border-pink-300 hover:shadow-md"
            )}
            style={{
                left: x,
                top: y,
                width: 160,
                // height: 70
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
            <div className="h-1 w-full rounded-t-xl bg-pink-500" />

            <div className="p-3">
                <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded bg-pink-100 flex items-center justify-center text-pink-600 shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-bold text-stone-900 leading-tight mb-0.5 truncate">{data.title}</h3>
                        <p className="text-[10px] text-stone-500 line-clamp-2 leading-snug">{data.preview || "No preview available..."}</p>
                    </div>
                </div>

                {/* Linked Indicator (if present) */}
                {data.linkedTo && (
                    <div className="mt-2 flex items-center gap-1 text-[9px] text-stone-400 bg-white/50 rounded px-1 py-0.5 w-fit">
                        {data.linkedTo.type === 'client' && <User className="w-2.5 h-2.5" />}
                        {data.linkedTo.type === 'session' && <Video className="w-2.5 h-2.5" />}
                        <span className="truncate max-w-[80px]">{data.linkedTo.name}</span>
                    </div>
                )}
            </div>

            {/* Connection Ports */}
            <div className="absolute top-1/2 -left-1.5 w-2 h-2 bg-white border border-stone-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 hover:border-pink-500 hover:bg-pink-50" />
        </div>
    );
}
