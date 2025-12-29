import React from 'react';
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight, Video } from 'lucide-react';

export default function V4AIInsightFeedItem({ item, onClick }) {
    return (
        <div
            onClick={() => onClick(item)}
            className="group relative bg-gradient-to-r from-violet-50/50 to-indigo-50/50 border-b border-stone-100 p-6 cursor-pointer hover:from-violet-50 hover:to-indigo-50 transition-colors flex gap-4"
        >
            {/* Gradient Color Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-indigo-500" />

            {/* Icon */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white shadow-sm bg-white">
                <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        AI Analysis Complete
                    </span>
                    <span className="text-xs text-stone-400 font-medium">{item.timestamp}</span>
                </div>

                <h3 className="text-base font-medium text-stone-900 mb-2">
                    Summary generated for session with <span className="text-stone-900 font-bold">{item.clientName}</span>
                </h3>

                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>3 Action Items identified</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>2 Knowledge Base articles matched</span>
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-violet-600 group-hover:underline">
                    View Full Insight <ArrowRight className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
}
