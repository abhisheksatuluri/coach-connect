import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Video, Calendar, Clock, MapPin, FileText, CheckCircle2, AlertCircle, Sparkles, Download, CheckCircle, Plus } from 'lucide-react';

export default function V5SessionWindow({ session }) {
    if (!session) return (
        <div className="flex items-center justify-center h-full text-stone-400">
            Select a session to view details
        </div>
    );

    const [activeTab, setActiveTab] = useState('Overview');
    const isUpcoming = session.status === 'upcoming' || session.status === 'scheduled';
    const isCompleted = session.status === 'completed';

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header Content */}
            <div className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-2 mb-2">
                    <div className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold uppercase tracking-wide">
                        Video Call
                    </div>
                    {isUpcoming && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                            <Clock className="w-3 h-3" />
                            Starts {session.time}
                        </div>
                    )}
                </div>
                <h2 className="text-xl font-bold text-stone-900 leading-tight mb-4">{session.title}</h2>

                {/* Client Link */}
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 hover:bg-blue-50/50 hover:border-blue-100 cursor-pointer transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold border-2 border-white text-xs">
                        {session.clientName?.charAt(0) || 'C'}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-stone-900 group-hover:text-blue-700">{session.clientName}</div>
                        <div className="text-xs text-stone-500">View Client Profile</div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center px-6 mt-2 border-b border-stone-200">
                {['Overview', 'Transcript', 'Action Items'].map(tab => (
                    (!isCompleted && tab !== 'Overview') ? null : (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === tab
                                    ? "border-violet-500 text-violet-600"
                                    : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
                            )}
                        >
                            {tab}
                        </button>
                    )
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {activeTab === 'Overview' && (
                    <div className="space-y-6">
                        {/* Action Area */}
                        {isUpcoming ? (
                            <button className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform active:scale-[0.98]">
                                <Video className="w-4 h-4" />
                                Join Meeting
                            </button>
                        ) : (
                            <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                                <div className="flex items-center gap-2 text-green-800 font-semibold text-sm mb-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Session Completed
                                </div>
                                <div className="text-xs text-green-700/80">
                                    Summary generated. <span className="underline cursor-pointer font-medium hover:text-green-900" onClick={() => setActiveTab('Transcript')}>View Transcript</span>
                                </div>
                            </div>
                        )}

                        {/* Details */}
                        <div>
                            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Details</h4>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                                    <div className="text-stone-700 font-medium">{session.date}</div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <Clock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                                    <div className="text-stone-700">{session.time} • {session.duration}</div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                                    <a href="#" className="text-blue-600 hover:underline truncate">meet.google.com/abc-defg-hij</a>
                                </div>
                            </div>
                        </div>

                        {/* Agenda */}
                        <div>
                            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                Agenda / Notes
                                <button className="text-blue-600 hover:text-blue-700 text-[10px]">Edit</button>
                            </h4>
                            <div className="p-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-600 leading-relaxed">
                                {session.description || "No description provided."}
                            </div>
                        </div>

                        {/* AI Summary Preview */}
                        {session.summary && (
                            <div>
                                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-violet-500" /> AI Summary
                                </h4>
                                <div className="p-4 bg-violet-50/50 border border-violet-100 rounded-xl text-sm text-stone-700 leading-relaxed">
                                    {session.summary}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Transcript' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 font-mono text-xs leading-relaxed text-stone-600 whitespace-pre-wrap">
                            {session.transcript || "No transcript available."}
                        </div>
                        <button className="flex items-center justify-center gap-2 w-full py-2 border border-stone-200 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors">
                            <Download className="w-3 h-3" /> Download
                        </button>
                    </div>
                )}

                {activeTab === 'Action Items' && (
                    <div className="space-y-2">
                        {session.actionItems && session.actionItems.length > 0 ? (
                            session.actionItems.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-stone-200 hover:border-violet-300 transition-colors group cursor-pointer">
                                    <div className="mt-0.5">
                                        {item.completed ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded border border-stone-300 group-hover:border-violet-500" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-stone-800">{item.text}</p>
                                        <p className="text-xs text-stone-400 mt-0.5">Assigned to {item.assignedTo || 'Client'}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-stone-400 italic text-sm">No action items found</div>
                        )}
                        <button className="flex items-center gap-2 text-sm text-violet-600 font-medium px-2 py-1">
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100 flex justify-between items-center text-xs font-medium text-stone-500 shrink-0">
                <button className="hover:text-red-500 transition-colors">Cancel Session</button>
                <div className="flex gap-3">
                    <button className="hover:text-stone-900 transition-colors">Reschedule</button>
                </div>
            </div>
        </div>
    );
}
