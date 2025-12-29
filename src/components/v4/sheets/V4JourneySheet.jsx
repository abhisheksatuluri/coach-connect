import React from 'react';
import V4BottomSheet from '@/components/v4/V4BottomSheet';
import { Map, Users, ChevronRight, Clock, CheckCircle2, Circle, Sparkles, Plus, MoreHorizontal } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function V4JourneySheet({ journey, isOpen, onClose }) {
    if (!journey) return null;

    return (
        <V4BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={journey.label || journey.title || "Journey Details"}
        >
            <div className="space-y-6 pb-20">
                {/* Header Info */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        {journey.isAI && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide border border-indigo-100">
                                <Sparkles className="w-3 h-3" /> AI Generated
                            </span>
                        )}
                        <span className={cn("px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide border",
                            journey.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                journey.status === 'Draft' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                    "bg-stone-100 text-stone-600 border-stone-200"
                        )}>
                            {journey.status || 'Active'}
                        </span>
                    </div>
                    <p className="text-stone-600 leading-relaxed text-sm">
                        {journey.description || "No description provided."}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
                        <div className="text-xl font-bold text-stone-900">{journey.steps?.length || 0}</div>
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Steps</div>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
                        <div className="text-xl font-bold text-stone-900">{journey.enrolledCount || 0}</div>
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Enrolled</div>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-center">
                        <div className="text-xl font-bold text-stone-900">{journey.duration || '4w'}</div>
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Duration</div>
                    </div>
                </div>

                {/* Steps Timeline */}
                <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2"><Map className="w-4 h-4 text-emerald-500" /> Program Path</span>
                        <button className="text-emerald-600 hover:text-emerald-700 text-[10px] flex items-center gap-1 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                            <Plus className="w-3 h-3" /> Add Step
                        </button>
                    </h4>
                    <div className="space-y-0 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[15px] top-3 bottom-0 w-0.5 bg-stone-100" />

                        {journey.steps && journey.steps.map((step, i) => (
                            <div key={i} className="relative flex gap-4 p-3 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer group">
                                <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-sm transition-colors bg-white border-emerald-500 text-emerald-600 font-bold text-xs">
                                    {i + 1}
                                </div>
                                <div className="flex-1 pt-1">
                                    <div className="flex justify-between items-center">
                                        <h5 className="text-sm font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                                            {step.title}
                                        </h5>
                                        <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded font-medium">{step.type || 'Module'}</span>
                                    </div>
                                    <p className="text-xs text-stone-500 mt-1 line-clamp-1">{step.description}</p>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-400 font-medium">
                                        <Clock className="w-3 h-3" /> {step.duration || '1 week'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Enrolled Clients Preview */}
                <div className="pt-4 border-t border-stone-100">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> Enrolled Clients</span>
                        <span className="text-stone-400 text-[10px]">{journey.enrolledCount} active</span>
                    </h4>
                    <div className="space-y-2">
                        {journey.enrolledClients && journey.enrolledClients.slice(0, 3).map((client, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-stone-100 hover:bg-stone-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center">
                                        {client.initials || client.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-stone-900">{client.name}</div>
                                        <div className="text-[10px] text-stone-500">Step {client.currentStep}</div>
                                    </div>
                                </div>
                                <div className="text-[10px] font-bold text-emerald-600">
                                    {Math.round((client.currentStep / (journey.steps?.length || 1)) * 100)}%
                                </div>
                            </div>
                        ))}
                        {journey.enrolledClients && journey.enrolledClients.length > 3 && (
                            <button className="w-full py-2 text-xs font-medium text-stone-400 hover:text-stone-600">
                                View {journey.enrolledClients.length - 3} more...
                            </button>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-stone-100">
                    <button className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm transition-colors text-sm">
                        Enroll Client
                    </button>
                    <button className="flex-1 py-3 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl font-medium transition-colors text-sm">
                        Edit Journey
                    </button>
                </div>
            </div>
        </V4BottomSheet>
    );
}
