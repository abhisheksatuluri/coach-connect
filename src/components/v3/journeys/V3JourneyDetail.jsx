import React from 'react';
import { useParams } from 'react-router-dom';
import V3Layout from '@/components/v3/V3Layout';
import { Map, CheckCircle, Users, ChevronRight } from 'lucide-react';

export default function V3JourneyDetail() {
    const { id } = useParams();

    const journey = {
        title: '12-Week Transformation',
        description: 'Complete holistic health overhaul focusing on nutrition, sleep, and mental resilience.',
        stats: { enrolled: 8, completion: '65%' },
        steps: [
            { title: 'Intake & Goal Setting', duration: 'Week 1', status: 'completed' },
            { title: 'Sleep Optimization', duration: 'Week 2-3', status: 'active' },
            { title: 'Nutrition Basics', duration: 'Week 4-6', status: 'locked' },
        ]
    };

    return (
        <V3Layout title="Journey Details" showBack={true} initialActiveTab="journeys">
            <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col md:flex-row gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 text-3xl flex items-center justify-center shrink-0">
                        🦋
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900 mb-2">{journey.title}</h1>
                        <p className="text-stone-500">{journey.description}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-stone-900">{journey.stats.enrolled}</div>
                            <div className="text-xs font-bold text-stone-400 uppercase">Enrolled</div>
                        </div>
                        <Users className="w-8 h-8 text-stone-100" />
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-stone-900">{journey.stats.completion}</div>
                            <div className="text-xs font-bold text-stone-400 uppercase">Avg Completion</div>
                        </div>
                        <CheckCircle className="w-8 h-8 text-stone-100" />
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6">
                    <h3 className="font-bold text-stone-900 mb-4">Journey Path</h3>
                    <div className="relative space-y-8 pl-2">
                        {/* Line */}
                        <div className="absolute top-2 bottom-2 left-[19px] w-0.5 bg-stone-100" />

                        {journey.steps.map((step, i) => (
                            <div key={i} className="relative flex items-center gap-4 group">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 border-4 border-white ${step.status === 'completed' ? 'bg-teal-500 text-white' :
                                        step.status === 'active' ? 'bg-white border-teal-500 text-teal-600' :
                                            'bg-stone-100 text-stone-400'
                                    }`}>
                                    {step.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-bold">{i + 1}</span>}
                                </div>
                                <div className="flex-1 p-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer border border-transparent hover:border-stone-100">
                                    <div className="font-semibold text-stone-900">{step.title}</div>
                                    <div className="text-xs text-stone-500">{step.duration}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </V3Layout>
    );
}
