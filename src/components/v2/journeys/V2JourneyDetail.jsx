import React from 'react';
import {
    MoreHorizontal, Edit, Copy, Archive, Plus, Users, Layout, Map, Sparkles, CheckCircle, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SectionHeader = ({ title, action }) => (
    <div className="flex items-center justify-between py-2 mb-2 border-b border-slate-800/50">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
        {action && (
            <button className="text-xs text-indigo-400 hover:text-white transition-colors flex items-center gap-1">
                {action}
            </button>
        )}
    </div>
);

const StepNode = ({ step, index, isLast }) => (
    <div className="flex gap-4 relative group">
        {/* Line */}
        {!isLast && (
            <div className="absolute left-[15px] top-8 bottom-[-8px] w-[2px] bg-slate-800" />
        )}

        {/* Node */}
        <div
            className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-slate-500 font-bold text-sm shadow-sm z-10 cursor-pointer group-hover:border-indigo-500 group-hover:text-indigo-400 transition-colors"
        >
            {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 pb-6 cursor-pointer">
            <div className="flex justify-between items-start">
                <h4 className="font-medium text-slate-200 group-hover:text-white transition-colors">{step.title}</h4>
                <span className="text-[10px] text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-800 uppercase font-bold tracking-wider">{step.type || 'Module'}</span>
            </div>
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{step.description}</p>
            <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {step.duration}
                </span>
                {step.hasTasks && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {step.tasksCount || 1} tasks
                    </span>
                )}
            </div>
        </div>
    </div>
);

export default function V2JourneyDetail({ journey }) {
    if (!journey) return (
        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Select a journey to view details
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-900 text-slate-200">

            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-800 bg-slate-900 block">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-sm">
                            {journey.icon}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {journey.isAI && (
                                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 text-[10px] px-1.5 py-0">
                                        <Sparkles className="w-3 h-3 mr-1" /> AI
                                    </Badge>
                                )}
                                <h2 className="text-xl font-bold text-white leading-none">
                                    {journey.title}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 border-0",
                                    journey.status === 'Active' ? "bg-emerald-500/10 text-emerald-400" :
                                        journey.status === 'Draft' ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-400"
                                )}>{journey.status}</Badge>
                                <span className="text-xs text-slate-500">ID: #{journey.id}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white border-0">
                            <Users className="w-3.5 h-3.5 mr-2" /> Enroll
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6 py-3 px-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    <div>
                        <span className="block text-xl font-bold text-white">{journey.steps?.length || 0}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Steps</span>
                    </div>
                    <div>
                        <span className="block text-xl font-bold text-white">{journey.enrolledCount}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Enrolled</span>
                    </div>
                    <div>
                        <span className="block text-xl font-bold text-emerald-400">{journey.avgCompletion}%</span>
                        <span className="text-[10px] text-emerald-500/60 uppercase font-bold">Avg Completion</span>
                    </div>
                    <div>
                        <span className="block text-xl font-bold text-white">{journey.duration || '4w'}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Duration</span>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">

                    {/* 1. Description */}
                    <div>
                        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl bg-slate-800/10 p-2 rounded">
                            {journey.description || "No description provided."}
                        </p>
                        <div className="flex gap-2 mt-3">
                            {journey.tags && journey.tags.map(tag => (
                                <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 2. Steps Section */}
                    <div>
                        <SectionHeader title="Program Path" action={<span className="flex items-center gap-1"><Plus className="w-3 h-3" /> Add Step</span>} />
                        <div className="pl-2 pt-2">
                            {journey.steps && journey.steps.map((step, i) => (
                                <StepNode
                                    key={step.id || i}
                                    step={step}
                                    index={i}
                                    isLast={i === journey.steps.length - 1}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 3. Enrolled Clients */}
                    <div>
                        <SectionHeader title={`Enrolled Clients (${journey.enrolledClients?.length || 0})`} action="View All" />
                        <div className="space-y-2">
                            {journey.enrolledClients && journey.enrolledClients.map((client, i) => (
                                <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded group transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                            {client.initials || client.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-slate-200">{client.name}</div>
                                            <div className="text-[11px] text-slate-500 font-mono">Step {client.currentStep}</div>
                                        </div>
                                    </div>
                                    <div className="w-24">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] text-slate-500">Progress</span>
                                            <span className="text-[10px] font-bold text-indigo-400">{(client.currentStep / (journey.steps?.length || 1) * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${(client.currentStep / (journey.steps?.length || 1) * 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
}
