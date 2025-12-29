
import React from 'react';
import { ArrowLeft, Calendar, Clock, Video, CheckCircle2, ScatterChart, Sparkles, BookOpen, ChevronRight, PlayCircle } from 'lucide-react';
import { useStackNavigation } from '@/context/StackNavigationContext';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { V3ArticleDetail } from '../knowledgebase/V3KnowledgeBase';
import { knowledgeBaseData } from '@/data/v3DummyData';

export default function V3SessionDetail({ session }) {
    const { popScreen, pushScreen } = useStackNavigation();

    const isCompleted = session.status === 'Completed';

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
                        <h1 className="text-lg font-semibold text-stone-900 leading-tight">{session.title}</h1>
                        <span className="text-xs text-stone-500 font-medium">{format(new Date(session.date), 'MMMM do, yyyy')}</span>
                    </div>
                </div>
                <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
                    isCompleted ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                )}>
                    {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                    {session.status}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                {/* Meta Card */}
                <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"><Clock className="w-5 h-5" /></div>
                        <div>
                            <div className="text-xs font-bold text-stone-400 uppercase">Duration</div>
                            <div className="font-semibold text-stone-900">{session.duration} min</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"><Video className="w-5 h-5" /></div>
                        <div>
                            <div className="text-xs font-bold text-stone-400 uppercase">Type</div>
                            <div className="font-semibold text-stone-900">{session.type || 'Video Call'}</div>
                        </div>
                    </div>
                    {session.hasMeetLink && !isCompleted && (
                        <button className="ml-auto px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20">
                            Join Meeting
                        </button>
                    )}
                </div>

                {/* AI Summary Section (If Completed) */}
                {isCompleted && session.aiSummary && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                        {/* Summary */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-stone-900 font-bold text-lg">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                <h2>AI Summary</h2>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-stone-200/60 shadow-sm leading-relaxed text-stone-600">
                                {session.aiSummary}
                            </div>
                        </div>

                        {/* Insights */}
                        {session.aiInsights && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider pl-1">Key Insights</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {session.aiInsights.map((insight, i) => (
                                        <div key={i} className="flex gap-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                                            <p className="text-sm font-medium text-stone-700">{insight}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* KB Matches */}
                        {session.kbMatches && (
                            <div className="space-y-3 pt-4 border-t border-stone-200">
                                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider pl-1">Recommended Reading</h3>
                                {session.kbMatches.map(kbId => {
                                    const article = knowledgeBaseData.find(k => k.id === kbId);
                                    if (!article) return null;
                                    return (
                                        <div
                                            key={kbId}
                                            onClick={() => pushScreen(V3ArticleDetail, { article })}
                                            className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-2xl hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-stone-900 group-hover:text-teal-700 transition-colors">{article.title}</div>
                                                    <div className="text-xs text-stone-500">{article.category} • Matched from transcript</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-stone-300" />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State for Upcoming */}
                {!isCompleted && (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <div className="max-w-xs">
                            <h3 className="text-lg font-bold text-stone-900">Session is upcoming</h3>
                            <p className="text-stone-500">AI insights and summary will appear here after the session is completed.</p>
                        </div>
                    </div>
                )}

                <div className="h-12" />
            </div>
        </div>
    );
}
