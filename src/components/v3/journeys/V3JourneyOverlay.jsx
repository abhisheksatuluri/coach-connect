import React, { useState } from 'react';
import { Book, Users, MoreHorizontal, Settings, Plus, ChevronDown, ChevronRight, CheckCircle, Circle, Sparkles, Clock, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import V3Overlay from '@/components/v3/V3Overlay';

const StepNode = ({ step, index, isLast, onClick }) => (
    <div className="flex gap-4 relative">
        {/* Line */}
        {!isLast && (
            <div className="absolute left-[15px] top-8 bottom-[-8px] w-[2px] bg-stone-100" />
        )}

        {/* Node */}
        <div
            className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center text-teal-700 font-bold text-sm shadow-sm z-10 cursor-pointer hover:scale-110 transition-transform"
            onClick={onClick}
        >
            {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 pb-8 cursor-pointer group" onClick={onClick}>
            <div className="flex justify-between items-start">
                <h4 className="font-medium text-stone-900 group-hover:text-teal-800 transition-colors">{step.title}</h4>
                <span className="text-[10px] text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-100 uppercase font-bold tracking-wider">{step.type || 'Module'}</span>
            </div>
            <p className="text-sm text-stone-500 mt-1 line-clamp-2">{step.description}</p>
            <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {step.duration}
                </span>
                {step.hasTasks && (
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {step.tasksCount || 1} tasks
                    </span>
                )}
            </div>
        </div>
    </div>
);

const Section = ({ title, icon: Icon, isOpen: defaultOpen = false, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-stone-100 last:border-0 py-5">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-1 text-left group"
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-stone-400 group-hover:text-stone-600" />
                    <span className="font-medium text-stone-700 group-hover:text-stone-900">{title}</span>
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
            </button>
            {isOpen && (
                <div className="pt-4 animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export default function V3JourneyOverlay({ journey, isOpen, onClose }) {
    if (!journey) return null;

    return (
        <V3Overlay isOpen={isOpen} onClose={onClose} title="Journey Details">
            <div className="mb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                    {journey.isAI && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" /> AI Generated
                        </div>
                    )}
                    <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                        journey.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-stone-50 text-stone-600 border-stone-200"
                    )}>
                        {journey.status || 'Active'}
                    </div>
                </div>
                <h2 className="text-2xl font-medium text-stone-900 mb-2">{journey.title}</h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-50 border border-stone-100 text-stone-500 text-xs">
                    <span>{journey.steps?.length || 0} Steps</span>
                    <span className="w-1 h-1 rounded-full bg-stone-300" />
                    <span>{journey.enrolledCount || 0} Enrolled</span>
                    <span className="w-1 h-1 rounded-full bg-stone-300" />
                    <span>{journey.duration || '4 Weeks'}</span>
                </div>
            </div>

            <div className="space-y-1 pb-24">
                {/* Section 1: Overview */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-sm text-stone-600 leading-relaxed mb-6">
                    {journey.description || "No description provided."}
                </div>

                {/* Section 2: Steps Timeline */}
                <Section title="Program Roadmap" icon={Book} isOpen={true}>
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
                </Section>

                {/* Section 3: Enrolled Clients */}
                <Section title={`Enrolled Clients (${journey.enrolledClients?.length || 0})`} icon={Users}>
                    <div className="space-y-3">
                        {journey.enrolledClients && journey.enrolledClients.length > 0 ? (
                            journey.enrolledClients.map((client, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white border border-stone-100 rounded-lg hover:border-stone-200 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">
                                            {client.initials || client.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-stone-900">{client.name}</div>
                                            <div className="text-xs text-stone-400">Current: Step {client.currentStep}</div>
                                        </div>
                                    </div>
                                    <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-teal-500" style={{ width: `${(client.currentStep / (journey.steps?.length || 1)) * 100}%` }} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-stone-400 text-sm italic">No active enrollments</div>
                        )}
                    </div>
                </Section>

                {/* Section 4: Settings */}
                <Section title="Settings" icon={Settings}>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="h-10 text-sm border-stone-200 text-stone-600 hover:bg-stone-50">
                            Duplicate Journey
                        </Button>
                        <Button variant="outline" className="h-10 text-sm border-stone-200 text-stone-600 hover:bg-stone-50">
                            Edit Metadata
                        </Button>
                    </div>
                </Section>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-6 left-6 right-6 flex gap-3 z-50">
                <Button className="flex-1 bg-teal-700 hover:bg-teal-800 text-white rounded-xl h-12 shadow-sm border-0 gap-2 font-medium tracking-wide">
                    <Users className="w-4 h-4" /> Enroll Client
                </Button>
                <Button variant="outline" className="flex-1 border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl h-12 font-medium tracking-wide">
                    Edit Steps
                </Button>
            </div>
        </V3Overlay>
    );
}
