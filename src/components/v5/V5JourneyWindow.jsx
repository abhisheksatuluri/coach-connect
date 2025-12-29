import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Map, Users, ChevronRight, Play, MoreHorizontal, User, Sparkles, CheckCircle2 } from 'lucide-react';

export default function V5JourneyWindow({ journey }) {
    if (!journey) return (
        <div className="flex items-center justify-center h-full text-stone-400">
            Select a journey to view details
        </div>
    );

    const [activeTab, setActiveTab] = useState('Steps');

    return (
        <div className="flex flex-col h-full bg-stone-50/50">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 bg-white border-b border-stone-100">
                <div className="flex items-center gap-2 mb-2">
                    {journey.isAI && (
                        <div className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wide border border-indigo-100 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI Generated
                        </div>
                    )}
                    <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                        journey.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-stone-50 text-stone-600 border-stone-200"
                    )}>
                        {journey.status || 'Active'}
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 border border-white shadow-sm">
                        <Map className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-stone-900 leading-tight">{journey.title}</h2>
                        <div className="text-sm text-stone-500 mt-1">
                            {journey.steps?.length || 0} steps • {journey.enrolledCount || 0} active clients
                        </div>
                    </div>
                </div>

                {/* Avg Completion Stats */}
                <div className="mt-4 flex gap-4 text-xs">
                    <div className="space-y-1">
                        <div className="text-stone-400 uppercase font-bold tracking-wider">Avg Time</div>
                        <div className="font-semibold text-stone-900">{journey.duration || '4w'}</div>
                    </div>
                    <div className="w-px bg-stone-200" />
                    <div className="space-y-1">
                        <div className="text-stone-400 uppercase font-bold tracking-wider">Completion Rate</div>
                        <div className="font-semibold text-emerald-600">{journey.avgCompletion || 0}%</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center px-4 border-b border-stone-200 bg-white">
                <button
                    onClick={() => setActiveTab('Steps')}
                    className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'Steps' ? "border-emerald-500 text-emerald-600" : "border-transparent text-stone-500 hover:text-stone-800")}
                >
                    Steps
                </button>
                <button
                    onClick={() => setActiveTab('Clients')}
                    className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'Clients' ? "border-emerald-500 text-emerald-600" : "border-transparent text-stone-500 hover:text-stone-800")}
                >
                    Enrolled Clients
                </button>
                <button
                    onClick={() => setActiveTab('Settings')}
                    className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'Settings' ? "border-emerald-500 text-emerald-600" : "border-transparent text-stone-500 hover:text-stone-800")}
                >
                    Settings
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'Steps' && (
                    <div className="space-y-3">
                        {journey.steps && journey.steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-stone-200 hover:border-emerald-300 transition-colors cursor-pointer group hover:shadow-sm">
                                <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 font-bold text-xs flex items-center justify-center shrink-0 border border-stone-200 group-hover:bg-emerald-100 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-colors">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-stone-900 group-hover:text-emerald-700">{step.title}</div>
                                    <div className="text-xs text-stone-500">{step.type || 'Module'} • {step.duration || 'Session'}</div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 p-1 hover:bg-stone-100 rounded text-stone-400">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'Clients' && (
                    <div className="space-y-3">
                        {journey.enrolledClients && journey.enrolledClients.map((client, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-stone-200 hover:shadow-sm transition-shadow">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-white shadow-sm">
                                    {client.initials || client.name?.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-stone-900">{client.name}</div>
                                    <div className="w-full bg-stone-100 h-1 rounded-full mt-1.5 overflow-hidden">
                                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(client.currentStep / (journey.steps?.length || 1) * 100)}%` }} />
                                    </div>
                                </div>
                                <div className="text-xs font-medium text-emerald-600">Step {client.currentStep}</div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'Settings' && (
                    <div className="p-4 bg-white rounded-xl border border-stone-200 text-center text-stone-500 text-sm">
                        Settings configuration available in full view.
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-200 bg-white flex justify-between items-center text-xs text-stone-500">
                <span>Refreshed just now</span>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                    <Play className="w-3 h-3 fill-current" />
                    Enroll Client
                </button>
            </div>
        </div>
    );
}
