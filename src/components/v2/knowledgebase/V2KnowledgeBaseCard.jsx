import React from 'react';
import { cn } from "@/lib/utils";
import { ChevronRight, Book, Zap, Database } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function V2KnowledgeBaseCard({ article, isSelected, onClick }) {
    return (
        <div
            className={cn(
                "group p-3 rounded-lg border border-slate-800/50 cursor-pointer transition-all duration-200 relative mb-2",
                isSelected
                    ? "bg-slate-800 border-l-4 border-l-cyan-500 border-t-slate-700 border-r-slate-700 border-b-slate-700 shadow-lg"
                    : "bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700"
            )}
            onClick={onClick}
        >
            {/* Row 1: Header */}
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                        <Book className="w-3.5 h-3.5" />
                    </div>
                    <h3 className={cn("text-sm font-bold truncate max-w-[170px]", isSelected ? "text-white" : "text-slate-200")}>
                        {article.title}
                    </h3>
                </div>
                <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isSelected ? "text-cyan-400 rotate-90" : "text-slate-600 group-hover:text-slate-400")} />
            </div>

            {/* Row 2: Snippet */}
            <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                {article.snippet}
            </p>

            {/* Row 3: Footer */}
            <div className="flex items-center justify-between pt-2">
                <Badge variant="outline" className="border-slate-700 text-slate-400 bg-slate-800/50 h-5 px-1.5 font-normal text-[10px]">
                    {article.category}
                </Badge>

                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-950/20 px-1.5 py-0.5 rounded" title="Matched to Sessions">
                        <Zap className="w-2.5 h-2.5 text-amber-400" /> {article.matchCount}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-950/20 px-1.5 py-0.5 rounded" title="Total Uses">
                        <Database className="w-2.5 h-2.5 text-indigo-400" /> {article.useCount}
                    </span>
                </div>
            </div>
        </div>
    );
}
