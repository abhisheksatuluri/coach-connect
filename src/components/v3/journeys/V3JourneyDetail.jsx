
import React from 'react';
import { ArrowLeft, CheckCircle2, Circle, TrendingUp, Users } from 'lucide-react';
import { useStackNavigation } from '@/context/StackNavigationContext';
import { cn } from "@/lib/utils";

export default function V3JourneyDetail({ journey }) {
    const { popScreen } = useStackNavigation();

    // Mock steps logic since dummy data only had counts
    const steps = Array.from({ length: journey.totalSteps }).map((_, i) => ({
        step: i + 1,
        title: `Week ${i + 1}: ${['Foundation', 'Habits', 'Nutrition', 'Movement', 'Sleep', 'Stress', 'Minset', 'Recovery', 'Social', 'Environment', 'Advanced', 'Maintenance'][i] || 'Focus'}`,
        description: "Focus on establishing core routines.",
        duration: "1 week"
    }));

    // Calculate aggregated progress
    const totalProgress = Math.round(
        journey.participants.reduce((acc, p) => acc + (p.currentStep / journey.totalSteps), 0) / journey.participants.length * 100
    );

    return (
        <div className="flex flex-col h-full bg-[#FAFAF9]">
            {/* Header */}
            <div className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={popScreen}
                        className="p-2 -ml-2 text-stone-500 hover:text-stone-900 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-semibold text-stone-900 leading-tight">{journey.title}</h1>
                        <span className="text-xs text-stone-500 font-medium">{journey.participants.length} Active Participants</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                {/* Progress Card */}
                <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Cohort Progress</h3>
                        <div className="text-2xl font-bold text-teal-600">{totalProgress}%</div>
                    </div>
                    <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full transition-all duration-1000" style={{ width: `${totalProgress}%` }} />
                    </div>
                </div>

                {/* Steps List */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider px-2">Curriculum</h3>
                    <div className="space-y-0 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-stone-200" />

                        {steps.map((s, i) => (
                            <div key={s.step} className="relative flex gap-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm z-10 ml-0 hover:ml-1 transition-all">
                                <div className={cn(
                                    "w-5 h-5 rounded-full border-2 bg-white shrink-0 mt-1 z-10",
                                    i < 4 ? "border-teal-500 text-teal-500" : "border-stone-300 text-stone-300"
                                    // Mock logic: first 4 steps done/active
                                )}>
                                    {i < 4 && <div className="w-2.5 h-2.5 bg-teal-500 rounded-full m-0.5" />}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-stone-900">{s.title}</div>
                                    <div className="text-sm text-stone-500">{s.description}</div>
                                </div>
                                <div className="text-xs font-bold text-stone-400 uppercase">{s.duration}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-12" />
            </div>
        </div>
    );
}
