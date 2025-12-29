import React from 'react';
import { cn } from "@/lib/utils";

export default function V3SessionCard({ session, onClick }) {
    const isPast = new Date(session.rawDate) < new Date();

    return (
        <div
            onClick={onClick}
            className="group flex flex-col justify-center h-[80px] p-4 cursor-pointer bg-white rounded-xl border border-stone-100 hover:border-stone-300 shadow-sm hover:shadow-md transition-all relative overflow-hidden mb-3"
        >
            {/* Side Color Bar */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                session.type === 'upcoming' ? "bg-teal-500" : "bg-stone-300"
            )} />

            <div className="flex items-center justify-between pl-2">
                {/* Left: Time & Info */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-stone-900">{session.time}</span>
                        <span className="text-xs text-stone-500 px-1.5 py-0.5 bg-stone-100 rounded">{session.duration}</span>
                    </div>
                    <h3 className="text-stone-800 font-medium text-sm truncate">{session.title}</h3>
                </div>

                {/* Right: Client Avatar */}
                <div className="flex-shrink-0 ml-3">
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-xs font-bold border border-white shadow-sm ring-1 ring-stone-100">
                        {session.clientInitials}
                    </div>
                </div>
            </div>
        </div>
    );
}
