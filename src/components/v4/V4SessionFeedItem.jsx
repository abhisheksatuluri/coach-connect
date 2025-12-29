import React from 'react';
import { cn } from "@/lib/utils";
import { Video, Calendar, MoreHorizontal } from 'lucide-react';

export default function V4SessionFeedItem({ item, onClick }) {
    const isToday = item.isToday;

    return (
        <div
            onClick={() => onClick(item)}
            className={cn(
                "group relative border-b border-stone-100 p-6 cursor-pointer hover:bg-stone-50 transition-colors flex gap-4",
                isToday ? "bg-violet-50/10" : "bg-white"
            )}
        >
            {/* Violet Color Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500" />

            {/* Icon */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-stone-100 bg-violet-50">
                <Video className="w-5 h-5 text-violet-500" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-violet-500">
                        Session
                    </span>
                    <span className="text-xs text-stone-400 font-medium">{item.timestamp}</span>
                </div>

                <h3 className="text-base font-medium text-stone-900 mb-1 group-hover:text-violet-600 transition-colors">
                    {item.title}
                </h3>

                <div className="flex items-center text-sm text-stone-500">
                    {item.type === 'session_scheduled' && (
                        <>{item.date} • {item.duration}</>
                    )}
                    {item.type === 'session_started' && (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Live now
                        </span>
                    )}
                    {!['session_scheduled', 'session_started'].includes(item.type) && item.preview}
                </div>

                {item.type === 'session_started' && (
                    <button className="mt-3 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-full transition-colors shadow-sm">
                        Join Meeting
                    </button>
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
