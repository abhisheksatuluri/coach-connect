import React from 'react';
import V4BottomSheet from '@/components/v4/V4BottomSheet';
import { Video, Calendar, Clock, CheckCircle, ArrowRight, FileText, User, Sparkles, Download, Play, Link as LinkIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function V4SessionSheet({ session, isOpen, onClose }) {
    if (!session) return null;

    const isUpcoming = session.status === 'scheduled' || session.status === 'upcoming';
    const isCompleted = session.status === 'completed';

    return (
        <V4BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={isUpcoming ? "Upcoming Session" : "Session Details"}
        >
            <div className="space-y-6 pb-20">
                {/* Header Summary */}
                <div className="bg-violet-50 rounded-2xl p-5 border border-violet-100">
                    <h2 className="text-xl font-bold text-stone-900 mb-2">{session.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-violet-500" />
                            <span>{session.displayDate || session.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-violet-500" />
                            <span>{session.duration || '60 min'}</span>
                        </div>
                    </div>
                </div>

                {/* Client Link */}
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {session.clientName?.charAt(0) || 'C'}
                        </div>
                        <div>
                            <div className="font-medium text-stone-900 group-hover:text-blue-600 transition-colors">{session.clientName || 'Client'}</div>
                            <div className="text-xs text-stone-500">View Profile</div>
                        </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-blue-400" />
                </div>

                {isUpcoming && (
                    <>
                        <div className="py-2">
                            <button className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-violet-200 transition-all transform active:scale-95 flex items-center justify-center gap-2">
                                <Video className="w-5 h-5" /> Join Meeting
                            </button>
                            <p className="text-center text-xs text-stone-400 mt-3">Starts {session.time}</p>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Agenda</h4>
                            <p className="text-stone-700 leading-relaxed text-sm bg-stone-50 p-4 rounded-xl border border-stone-100">
                                {session.description || "No specific agenda."}
                            </p>
                        </div>
                    </>
                )}

                {isCompleted && (
                    <>
                        {/* AI Summary */}
                        {session.summary && (
                            <div className="border border-violet-100 bg-white rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-violet-50/50 px-4 py-3 border-b border-violet-100 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-violet-600" />
                                    <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">AI Summary</span>
                                </div>
                                <div className="p-4 space-y-4">
                                    <p className="text-sm text-stone-700 leading-relaxed">
                                        {session.summary}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {session.topics && session.topics.map(topic => (
                                            <span key={topic} className="text-xs px-2 py-1 bg-violet-50 text-violet-600 rounded-md border border-violet-100 font-medium"># {topic}</span>
                                        ))}
                                    </div>

                                    {session.insights && (
                                        <div className="space-y-2 pt-2">
                                            {session.insights.map((insight, i) => (
                                                <div key={i} className="flex gap-2 text-sm text-stone-600">
                                                    <span className="text-violet-400 mt-1">•</span> {insight}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Transcript */}
                        {session.transcript && (
                            <div>
                                <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Transcript</h4>
                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 font-mono text-xs leading-relaxed text-stone-600 mb-2 max-h-40 overflow-hidden relative">
                                    {session.transcript}
                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-stone-50 to-transparent" />
                                </div>
                                <Button variant="outline" size="sm" className="w-full text-xs h-8 border-stone-200">
                                    <Download className="w-3 h-3 mr-2" /> Download Full Transcript
                                </Button>
                            </div>
                        )}

                        {/* Action Items */}
                        {session.actionItems && session.actionItems.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Action Items</h4>
                                <div className="space-y-2">
                                    {session.actionItems.map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-stone-200 shadow-sm">
                                            <div className="mt-0.5">
                                                {item.completed ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded border border-stone-300" />}
                                            </div>
                                            <p className="text-sm font-medium text-stone-800">{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Related Journey Link */}
                {session.journeyId && (
                    <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
                        <LinkIcon className="w-4 h-4 text-teal-600" />
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-teal-900">Linked Journey</h4>
                            <p className="text-xs text-teal-600">Anxiety Management Program</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-stone-100">
                    <button className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium text-sm transition-colors">
                        Add Notes
                    </button>
                    {!isCompleted && (
                        <button className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium text-sm transition-colors">
                            Reschedule
                        </button>
                    )}
                </div>
            </div>
        </V4BottomSheet>
    );
}
