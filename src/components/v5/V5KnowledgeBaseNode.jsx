import React from 'react';
import { cn } from "@/lib/utils";
import { Book, LayoutGrid, Sparkles } from 'lucide-react';

export default function V5KnowledgeBaseNode({
    id,
    data, // { title, category, matches }
    x,
    y,
    selected,
    onSelect,
    onDoubleClick
}) {
    return (
        <div
            className={cn(
                "absolute rounded-xl shadow-sm border transition-all duration-200 group select-none cursor-pointer bg-indigo-50",
                selected ? "ring-2 ring-indigo-500 ring-offset-2 border-indigo-500 z-10 scale-105 shadow-xl" : "border-stone-200 hover:border-indigo-300 hover:shadow-md"
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
            <div className="h-1 w-full rounded-t-xl bg-indigo-500" />

            <div className="p-3">
                <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <Book className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-wide mb-0.5 truncate">{data.category || 'Article'}</div>
                        <h3 className="text-xs font-bold text-stone-900 leading-tight line-clamp-2">{data.title}</h3>
                    </div>
                </div>

                {/* Stats Footer */}
                {data.matches && (
                    <div className="mt-2 text-[10px] text-indigo-600/80 font-medium flex items-center gap-1.5 bg-indigo-100/50 rounded px-1.5 py-0.5 w-fit">
                        <Sparkles className="w-2.5 h-2.5" />
                        Matched {data.matches}x
                    </div>
                )}
            </div>

            {/* Connection Ports */}
            <div className="absolute top-1/2 -right-1.5 w-2 h-2 bg-white border border-stone-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 hover:border-indigo-500 hover:bg-indigo-50" />
        </div>
    );
}
