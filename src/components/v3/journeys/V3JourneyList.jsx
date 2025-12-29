import React from 'react';
import { Map, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function V3JourneyList({ onCloseSlider }) {
    const journeys = [
        { id: 1, title: '12-Week Transformation', status: 'Active', enrolled: 8 },
        { id: 2, title: 'Anxiety Management', status: 'Active', enrolled: 15 },
        { id: 3, title: 'Sleep Mastery', status: 'Draft', enrolled: 0 },
    ];

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-2">
                {journeys.map(j => (
                    <div key={j.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 cursor-pointer group">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <span className="text-xl">🦋</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-stone-900 truncate">{j.title}</div>
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                                    j.status === 'Active' ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"
                                )}>{j.status}</span>
                                <span>•</span>
                                <span>{j.enrolled} enrolled</span>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500" />
                    </div>
                ))}
            </div>
        </div>
    );
}
