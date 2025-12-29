import React, { useState } from 'react';
import { Mail, Clock, Calendar, Video, FileText, CheckCircle, ArrowRight, Sparkles, X, ChevronRight, ChevronDown, User, MessageSquare, ListTodo, Link as LinkIcon, Download, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import V3Overlay from '@/components/v3/V3Overlay';

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            active ? "bg-stone-100 text-stone-900" : "text-stone-500 hover:text-stone-700 hover:bg-stone-50"
        )}
    >
        {children}
    </button>
);

export default function V3SessionOverlay({ session, isOpen, onClose }) {
    if (!session) return null;
    const [activeTab, setActiveTab] = useState('Overview');

    return (
        <V3Overlay isOpen={isOpen} onClose={onClose} title="Session Details">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-stone-900 mb-1">{session.title}</h2>
                        <div className="flex items-center gap-3 text-sm text-stone-500">
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium border",
                                session.status === 'completed' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                    session.status === 'scheduled' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-stone-100 text-stone-600 border-stone-200"
                            )}>
                                {session.status?.toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" /> {session.displayDate || session.date}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" /> {session.duration || '60m'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 border-b border-stone-100 pb-2 overflow-x-auto">
                    <TabButton active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')}>Overview</TabButton>
                    {session.transcript && <TabButton active={activeTab === 'Transcript'} onClick={() => setActiveTab('Transcript')}>Transcript</TabButton>}
                    <TabButton active={activeTab === 'Action Items'} onClick={() => setActiveTab('Action Items')}>Action Items</TabButton>
                </div>
            </div>

            <div className="pb-24">
                {activeTab === 'Overview' && (
                    <div className="space-y-6">
                        {/* Attendees */}
                        <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 cursor-pointer hover:bg-stone-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-stone-500 font-bold shadow-sm border border-stone-100">
                                    {session.clientName?.charAt(0) || 'C'}
                                </div>
                                <div>
                                    <div className="font-medium text-stone-900">{session.clientName || 'Client'}</div>
                                    <div className="text-xs text-stone-500">Participant</div>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-stone-400" />
                        </div>

                        {/* AI Summary */}
                        {session.summary && (
                            <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
                                <div className="flex items-center gap-2 mb-3 text-indigo-700 font-semibold text-sm uppercase tracking-wide">
                                    <Sparkles className="w-4 h-4" /> AI Summary
                                </div>
                                <p className="text-stone-700 text-sm leading-relaxed mb-4">
                                    {session.summary}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {session.topics && session.topics.map(topic => (
                                        <span key={topic} className="text-xs px-2 py-1 bg-white text-indigo-600 rounded-md border border-indigo-100 font-medium">
                                            #{topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description/Agenda */}
                        <div>
                            <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Agenda / Description</h4>
                            <p className="text-sm text-stone-600 leading-relaxed bg-white p-4 rounded-xl border border-stone-100">
                                {session.description || "No description provided."}
                            </p>
                        </div>

                        {/* AI Insights & Sentiment */}
                        {session.insights && (
                            <div>
                                <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Key Insights</h4>
                                <div className="space-y-2">
                                    {session.insights.map((insight, i) => (
                                        <div key={i} className="flex gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100">
                                            <div className="w-1 h-full min-h-[20px] bg-indigo-400 rounded-full" />
                                            <p className="text-sm text-stone-700">{insight}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Related Journey */}
                        {session.journeyId && (
                            <div className="flex items-center gap-3 p-4 bg-teal-50/50 rounded-xl border border-teal-100">
                                <LinkIcon className="w-4 h-4 text-teal-600" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-teal-900">Linked Journey</h4>
                                    <p className="text-xs text-teal-600">Part of "Anxiety Management" program</p>
                                </div>
                                <Button size="sm" variant="outline" className="h-8 border-teal-200 text-teal-700 hover:bg-teal-100">View</Button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Transcript' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 font-mono text-sm leading-relaxed text-stone-600 whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                            {session.transcript || "No transcript available."}
                        </div>
                        <Button variant="outline" className="w-full gap-2 border-stone-200">
                            <Download className="w-4 h-4" /> Download Transcript
                        </Button>
                    </div>
                )}

                {activeTab === 'Action Items' && (
                    <div className="space-y-3">
                        {session.actionItems && session.actionItems.length > 0 ? (
                            session.actionItems.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-stone-200 hover:border-teal-200 transition-colors group">
                                    <button className="mt-0.5 w-5 h-5 rounded border border-stone-300 group-hover:border-teal-500 hover:bg-teal-50 transition-colors flex items-center justify-center">
                                        {item.completed && <CheckCircle className="w-3.5 h-3.5 text-teal-600" />}
                                    </button>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-stone-800">{item.text}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] uppercase font-bold text-stone-400">Task</span>
                                            {item.assignedTo && <span className="text-[10px] text-stone-400">• Assigned to {item.assignedTo}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-stone-400 italic">No action items detected</div>
                        )}
                        <Button variant="outline" className="w-full border-dashed border-stone-300 text-stone-500 hover:text-stone-800 hover:bg-stone-50">
                            <Plus className="w-4 h-4 mr-2" /> Add Action Item
                        </Button>
                    </div>
                )}
            </div>

            {/* Floating Footer Actions */}
            <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                {session.status === 'scheduled' || session.status === 'Upcoming' ? (
                    <Button className="flex-1 bg-teal-700 hover:bg-teal-800 text-white h-12 rounded-xl shadow-lg border-0 gap-2 font-medium">
                        <Video className="w-4 h-4" /> Join Session
                    </Button>
                ) : (
                    <Button className="flex-1 bg-stone-900 hover:bg-black text-white h-12 rounded-xl shadow-lg border-0 gap-2 font-medium">
                        <Calendar className="w-4 h-4" /> Schedule Follow-up
                    </Button>
                )}
            </div>
        </V3Overlay>
    );
}
