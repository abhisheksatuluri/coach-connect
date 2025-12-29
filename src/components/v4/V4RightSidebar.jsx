import React from 'react';
import { cn } from "@/lib/utils";
import { Calendar, CheckCircle2, TrendingUp } from 'lucide-react';

export default function V4RightSidebar({ item, className }) {
    return (
        <aside className={cn("w-[300px] h-screen bg-white border-l border-stone-200 flex flex-col p-6 overflow-y-auto", className)}>

            {item ? (
                // Context Preview Mode
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">
                        Details
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-stone-900 mb-2 leading-tight">
                            {item.title || item.content}
                        </h3>
                        <p className="text-stone-500 text-sm">
                            {item.timestamp} • {item.entityType}
                        </p>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold", item.entityColor)}>
                                {item.actor ? item.actor.charAt(0) : 'S'}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-stone-900">{item.actor || 'System'}</div>
                                <div className="text-xs text-stone-500">Author</div>
                            </div>
                        </div>
                        <div className="text-sm text-stone-600 leading-relaxed">
                            {item.preview || "No additional preview text available for this item."}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-stone-500">Status</span>
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                                Active
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-stone-500">Related</span>
                            <span className="text-blue-600 hover:underline cursor-pointer">View Client</span>
                        </div>
                    </div>
                </div>
            ) : (
                // Default Home Overview
                <div>
                    <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-6">
                        Today's Overview
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                            <div className="text-2xl font-bold text-stone-900 mb-1">3</div>
                            <div className="text-xs text-stone-500 font-medium">Sessions</div>
                        </div>
                        <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                            <div className="text-2xl font-bold text-stone-900 mb-1">5</div>
                            <div className="text-xs text-stone-500 font-medium">Tasks</div>
                        </div>
                    </div>

                    {/* Upcoming */}
                    <div className="mb-8">
                        <h4 className="text-sm font-semibold text-stone-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-stone-400" />
                            Up Next
                        </h4>
                        <div className="space-y-3">
                            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-sm">
                                <div className="text-sm font-medium text-stone-900">Sarah Connor</div>
                                <div className="text-xs text-stone-500 mt-0.5">10:00 AM • Intake Session</div>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-sm opacity-60">
                                <div className="text-sm font-medium text-stone-900">Mike Ross</div>
                                <div className="text-xs text-stone-500 mt-0.5">02:00 PM • Coaching</div>
                            </div>
                        </div>
                    </div>

                    {/* Trends */}
                    <div>
                        <h4 className="text-sm font-semibold text-stone-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-stone-400" />
                            Activity
                        </h4>
                        <div className="h-24 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-center text-xs text-stone-400 italic">
                            Activity Chart Placeholder
                        </div>
                    </div>
                </div>
            )}

        </aside>
    );
}
