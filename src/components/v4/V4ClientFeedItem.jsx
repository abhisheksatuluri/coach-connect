import React from 'react';
import { cn } from "@/lib/utils";
import { UserPlus, User, MoreHorizontal } from 'lucide-react';

export default function V4ClientFeedItem({ item, onClick }) {
    return (
        <div
            onClick={() => onClick(item)}
            className="group relative bg-white border-b border-stone-100 p-6 cursor-pointer hover:bg-stone-50 transition-colors flex gap-4"
        >
            {/* Blue Color Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />

            {/* Icon */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-stone-100 bg-blue-50">
                <User className="w-5 h-5 text-blue-500" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                        Client Activity
                    </span>
                    <span className="text-xs text-stone-400 font-medium">{item.timestamp}</span>
                </div>

                <h3 className="text-base font-medium text-stone-900 mb-1">
                    {item.type === 'client_added' && (
                        <>New client <span className="font-bold text-stone-900 group-hover:text-blue-600 transition-colors">{item.clientName}</span> added</>
                    )}
                    {item.type === 'client_updated' && (
                        <>Profile updated for <span className="font-bold text-stone-900 group-hover:text-blue-600 transition-colors">{item.clientName}</span></>
                    )}
                    {item.type === 'client_milestone' && (
                        <><span className="font-bold text-stone-900 group-hover:text-blue-600 transition-colors">{item.clientName}</span> reached a milestone</>
                    )}
                </h3>

                <p className="text-sm text-stone-500 line-clamp-2">
                    {item.preview}
                </p>
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
