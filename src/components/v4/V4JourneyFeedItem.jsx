import React from 'react';
import { cn } from "@/lib/utils";
import { Map, Share2, Award, MoreHorizontal, ArrowRight } from 'lucide-react';

export default function V4JourneyFeedItem({ item, onClick }) {
    return (
        <div
            onClick={() => onClick(item)}
            className="group relative bg-white border-b border-stone-100 p-6 cursor-pointer hover:bg-stone-50 transition-colors flex gap-4"
        >
            {/* Emerald Color Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />

            {/* Icon */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-stone-100 bg-emerald-50">
                {item.type === 'journey_completed' ? (
                    <Award className="w-5 h-5 text-emerald-600" />
                ) : (
                    <Map className="w-5 h-5 text-emerald-500" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                        {item.type === 'journey_completed' ? 'Journey Completed' : 'Journey Activity'}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">{item.timestamp}</span>
                </div>

                <h3 className="text-base font-medium text-stone-900 mb-1 group-hover:text-emerald-600 transition-colors">
                    {item.title}
                </h3>

                <p className="text-sm text-stone-500 line-clamp-2 mb-2">
                    {item.preview}
                </p>

                {/* Inline Progress Bar for Step Completion */}
                {item.type === 'journey_step_completed' && (
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: '40%' }} />
                        </div>
                        <span className="text-xs font-medium text-stone-500">Step 3 of 8</span>
                    </div>
                )}

                {/* Completed Highlight */}
                {item.type === 'journey_completed' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100 mt-1">
                        <Award className="w-3 h-3" />
                        Certificate Generated
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
