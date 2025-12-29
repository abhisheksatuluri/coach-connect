import React, { useState } from 'react';
import {
    Calendar, Clock, Video, FileText, User, MoreHorizontal, Edit, Play, Sparkles, CheckCircle, Download, ArrowRight, Link as LinkIcon
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={cn(
            "px-3 py-1.5 text-xs font-medium rounded transition-all",
            active ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
        )}
    >
        {children}
    </button>
);

export default function V2SessionDetail({ session }) {
    if (!session) return (
        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Select a session to view details
        </div>
    );

    const [activeTab, setActiveTab] = useState('Overview');

    return (
        <div className="h-full flex flex-col bg-slate-900 text-slate-200">

            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-800 bg-slate-900">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-white mb-2">{session.title}</h2>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <Badge variant="outline" className={cn("border-0 px-2 py-0.5",
                                session.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" :
                                    session.status === 'scheduled' || session.status === 'upcoming' ? "bg-blue-500/10 text-blue-400" : "bg-slate-700 text-slate-400"
                            )}>{session.status?.toUpperCase()}</Badge>
                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-500" /> {session.displayDate || session.date}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-500" /> {session.duration || '60m'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {session.status === 'scheduled' || session.status === 'upcoming' ? (
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white border-0">
                                <Video className="w-4 h-4 mr-2" /> Join
                            </Button>
                        ) : null}
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-slate-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 pb-2">
                    <TabButton active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')}>Overview</TabButton>
                    {session.transcript && <TabButton active={activeTab === 'Transcript'} onClick={() => setActiveTab('Transcript')}>Transcript</TabButton>}
                    <TabButton active={activeTab === 'Action Items'} onClick={() => setActiveTab('Action Items')}>Action Items</TabButton>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                    {activeTab === 'Overview' && (
                        <>
                            {/* Client Quick Link */}
                            <div className="flex items-center p-3 bg-slate-800/50 rounded border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 mr-3 border border-slate-600 group-hover:border-slate-500">
                                    {session.clientName?.charAt(0) || 'C'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white">{session.clientName}</p>
                                    <p className="text-xs text-slate-500">View Client Profile</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                            </div>

                            {/* Description/Agenda */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Agenda</h4>
                                <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/20 p-3 rounded border border-slate-800">
                                    {session.description || "No agenda set."}
                                </p>
                            </div>

                            {/* AI Summary */}
                            {session.summary && (
                                <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
                                            <Sparkles className="w-3 h-3" />
                                        </div>
                                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">AI Summary</h4>
                                    </div>
                                    <p className="text-sm text-indigo-100/80 mb-3 leading-relaxed">
                                        {session.summary}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {session.topics && session.topics.map(topic => (
                                            <span key={topic} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-300 border border-indigo-700/50">
                                                #{topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Insights */}
                            {session.insights && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Insights</h4>
                                    <div className="space-y-2">
                                        {session.insights.map((insight, i) => (
                                            <div key={i} className="flex items-start gap-3 p-2 rounded bg-slate-800/30 border border-slate-800">
                                                <div className="w-1 h-1 rounded-full bg-indigo-500 mt-2" />
                                                <p className="text-xs text-slate-300">{insight}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Related Journey */}
                            {session.journeyId && (
                                <div className="flex items-center justify-between p-3 bg-teal-950/10 rounded border border-teal-900/30">
                                    <div className="flex items-center gap-3">
                                        <LinkIcon className="w-4 h-4 text-teal-500" />
                                        <div>
                                            <p className="text-xs font-bold text-teal-500 uppercase">Linked Journey</p>
                                            <p className="text-sm text-teal-100">Anxiety Management</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-6 text-xs text-teal-400 hover:text-teal-300 hover:bg-teal-900/20">View</Button>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'Transcript' && (
                        <div className="space-y-4">
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs leading-relaxed text-slate-400 whitespace-pre-wrap">
                                {session.transcript || "Transcript processing..."}
                            </div>
                            <Button variant="outline" size="sm" className="w-full border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300">
                                <Download className="w-4 h-4 mr-2" /> Download TXT
                            </Button>
                        </div>
                    )}

                    {activeTab === 'Action Items' && (
                        <div className="space-y-2">
                            {session.actionItems && session.actionItems.length > 0 ? (
                                session.actionItems.map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/40 rounded border border-slate-800 hover:border-slate-700 group">
                                        <div className="mt-0.5">
                                            {item.completed ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded border border-slate-600 group-hover:border-slate-400" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-300 group-hover:text-white">{item.text}</p>
                                            <p className="text-xs text-slate-500 mt-1">Assigned to {item.assignedTo || 'Client'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-600 italic text-sm">No action items found</div>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
