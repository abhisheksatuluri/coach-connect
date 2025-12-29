import React from 'react';
import { useParams } from 'react-router-dom';
import V3Layout from '@/components/v3/V3Layout';
import { Brain, Sparkles, CheckSquare, FileText, ChevronRight, Play } from 'lucide-react';

export default function V3SessionDetail() {
    const { id } = useParams();

    // Mock data
    const session = {
        id,
        title: 'Weekly Check-in',
        date: 'Oct 24, 2024 at 2:00 PM',
        client: 'Sarah Connor',
        transcript_summary: "Sarah reported improved sleep quality but struggles with mid-day fatigue. Discussed cortisol rhythms and suggested morning sunlight exposure (15m). She agreed to track caffeine intake.",
        insights: [
            { type: 'pattern', text: 'Recurring theme of stress-induced insomnia on Sundays.' },
            { type: 'sentiment', text: 'Positive shift in motivation compared to last week.' }
        ],
        actions: [
            { id: 1, text: 'Send sunlight protocol PDF' },
            { id: 2, text: 'Check in on Wednesday re: sleep logs' }
        ]
    };

    return (
        <V3Layout title="Session Details" showBack={true} initialActiveTab="sessions">
            <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">

                {/* Header Card */}
                <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-stone-900">{session.title}</h1>
                            <div className="flex items-center gap-2 text-stone-500 mt-1">
                                <span className="font-medium text-teal-600">{session.client}</span>
                                <span>•</span>
                                <span>{session.date}</span>
                            </div>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-stone-50 hover:bg-teal-50 text-stone-900 hover:text-teal-600 flex items-center justify-center transition-colors">
                            <Play className="w-4 h-4 ml-0.5" />
                        </button>
                    </div>
                </div>

                {/* AI Summary Block */}
                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden">
                    <Sparkles className="absolute top-4 right-4 w-24 h-24 text-indigo-100 -z-10 opacity-50" />
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Brain className="w-4 h-4" />
                        </div>
                        <h2 className="font-bold text-indigo-950">AI Summary</h2>
                    </div>
                    <p className="text-indigo-900/80 leading-relaxed text-sm lg:text-base">
                        {session.transcript_summary}
                    </p>
                </div>

                {/* Insights Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                    {session.insights.map((insight, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">{insight.type}</div>
                            <p className="text-stone-700 text-sm font-medium">{insight.text}</p>
                        </div>
                    ))}
                </div>

                {/* Action Items */}
                <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-stone-400" />
                            <h3 className="font-bold text-stone-900">Action Items</h3>
                        </div>
                        <button className="text-xs font-bold text-teal-600 hover:underline">+ Add Task</button>
                    </div>
                    <div className="divide-y divide-stone-50">
                        {session.actions.map(action => (
                            <div key={action.id} className="p-4 flex items-center gap-3 hover:bg-stone-50 cursor-pointer group">
                                <div className="w-5 h-5 rounded border border-stone-300 group-hover:border-teal-500 flex items-center justify-center" />
                                <span className="text-stone-700 font-medium group-hover:text-stone-900">{action.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </V3Layout>
    );
}
