import React from 'react';
import { cn } from "@/lib/utils";

export default function V3PractitionerCard({ practitioner, onClick }) {
    return (
        <div
            onClick={onClick}
            className="group flex items-center h-[80px] px-4 cursor-pointer bg-white rounded-xl border border-stone-100 hover:border-teal-200 hover:shadow-sm hover:bg-stone-50 transition-all mb-2"
        >
            {/* Left: Avatar */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-stone-200 mr-4 overflow-hidden border border-stone-100">
                {practitioner.avatar ? (
                    <img src={practitioner.avatar} alt={practitioner.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-500 font-medium text-lg">
                        {practitioner.name.charAt(0)}
                    </div>
                )}
            </div>

            {/* Middle: Name + Specialty */}
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-stone-900 group-hover:text-teal-900 transition-colors">
                    {practitioner.name}
                </h3>
                <p className="text-xs text-stone-500 truncate">
                    {practitioner.specialty}
                </p>
            </div>

            {/* Right: Status */}
            <div className="flex-shrink-0 ml-4">
                <div className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    practitioner.status === 'Active' ? "bg-teal-500" : "bg-amber-400"
                )} title={practitioner.status} />
            </div>
        </div>
    );
}
