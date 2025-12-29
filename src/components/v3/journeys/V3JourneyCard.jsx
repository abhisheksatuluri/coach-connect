import React from 'react';
import { Users, Map } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function V3JourneyCard({ journey, onClick }) {
    return (
        <div
            onClick={onClick}
            className="group bg-white rounded-xl border border-stone-100 p-5 cursor-pointer hover:border-teal-200 hover:shadow-md transition-all relative overflow-hidden mb-3"
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-medium text-stone-900 mb-1 group-hover:text-teal-900 transition-colors">
                        {journey.title}
                    </h3>
                    <span className="text-sm text-stone-500">{journey.stepCount} Steps</span>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 bg-stone-50 rounded-lg border border-stone-100">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-xs font-bold text-stone-600">{journey.enrolledCount}</span>
                </div>
            </div>

            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 w-[60%]" />
            </div>
            <div className="flex justify-between mt-2">
                <span className="text-xs text-stone-400">Progress</span>
                <span className="text-xs font-medium text-teal-700">60% avg</span>
            </div>
        </div>
    );
}
