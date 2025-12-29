import React from 'react';
import { cn } from "@/lib/utils";
import { LayoutGrid, Sparkles, MoreHorizontal, ArrowRight } from 'lucide-react';

export default function V4KnowledgeBaseFeedItem({ item, onClick }) {
    const isMatch = item.type === 'kb_article_matched';

    return (
        <div
            onClick={() => onClick(item)}
            className="group relative bg-white border-b border-stone-100 p-6 cursor-pointer hover:bg-stone-50 transition-colors flex gap-4"
        >
            {/* Indigo Color Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />

            {/* Icon */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-stone-100 bg-indigo-50">
                {isMatch ? (
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                ) : (
                    <LayoutGrid className="w-5 h-5 text-indigo-500" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500 flex items-center gap-1">
                        {isMatch && <Sparkles className="w-3 h-3" />}
                        {isMatch ? 'AI Insight Match' : 'Knowledge Base'}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">{item.timestamp}</span>
                </div>

                <h3 className="text-base font-medium text-stone-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                </h3>

                {isMatch ? (
                    <div className="mt-2 text-sm text-stone-600 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50 inline-block">
                        <div className="flex items-center gap-2">
                            <span>Matched to session with</span>
                            <span className="font-medium text-stone-900">{item.linkedEntity || 'Client'}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-stone-500 line-clamp-2">
                        {item.preview}
                    </p>
                )}

                {item.category && (
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-500 border border-stone-200">
                        {item.category}
                    </div>
                )}
            </div>

            {/* Hover Action */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                <button className="p-2 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-600">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
