import React from 'react';
import { cn } from "@/lib/utils";
import { Zap } from 'lucide-react';

export default function V3KnowledgeBaseCard({ article, onClick }) {
    return (
        <div
            onClick={onClick}
            className="group bg-white rounded-xl border border-stone-100 p-4 cursor-pointer hover:border-teal-200 hover:shadow-sm hover:bg-stone-50 transition-all mb-3 h-[88px] flex flex-col justify-between"
        >
            <div>
                <div className="flex items-start justify-between">
                    <h3 className="text-base font-medium text-stone-900 line-clamp-1 group-hover:text-teal-800 transition-colors">
                        {article.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[10px] uppercase font-bold tracking-wide border border-stone-200">
                        {article.category}
                    </span>
                </div>
                <p className="text-sm text-stone-500 line-clamp-1 mt-1 font-light">
                    {article.snippet}
                </p>
            </div>

            <div className="flex items-center gap-4 mt-auto">
                {article.matchCount > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                        <Zap className="w-3 h-3 text-amber-500" />
                        Matched {article.matchCount} times
                    </div>
                )}
            </div>
        </div>
    );
}
