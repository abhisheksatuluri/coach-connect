import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { User, Copy, Plus, Activity, Calendar, Map, CheckSquare, Clock, FileText, CreditCard, UserPlus, TrendingUp, X } from 'lucide-react';

export default function V5ClientWindow({ client }) { // Now accepts client prop
    const [activeTab, setActiveTab] = useState('Overview');

    if (!client) return (
        <div className="flex items-center justify-center h-full text-stone-400">
            Select a client to view details
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-stone-50/30">
            {/* Header / Top Section */}
            <div className="p-6 bg-white border-b border-stone-100">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl border-4 border-white shadow-sm ring-1 ring-stone-100">
                        {client.initials}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-bold text-stone-900">{client.name}</h2>
                            <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-bold border",
                                client.status === 'Active' ? "bg-green-100 text-green-700 border-green-200" : "bg-stone-100 text-stone-600 border-stone-200"
                            )}>{client.status?.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-stone-500">
                            <button className="hover:text-stone-800 flex items-center gap-1 transition-colors">
                                {client.email} <Copy className="w-3 h-3" />
                            </button>
                            <span className="text-stone-300">|</span>
                            <button className="hover:text-stone-800 flex items-center gap-1 transition-colors">
                                {client.phone} <Copy className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-4 gap-2 mt-6">
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-100 text-center">
                        <div className="text-lg font-bold text-violet-600">{client.stats?.totalSessions || 0}</div>
                        <div className="text-[10px] text-stone-500 font-medium uppercase">Sessions</div>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-100 text-center">
                        <div className="text-lg font-bold text-emerald-600">{client.stats?.activeJourneys || 0}</div>
                        <div className="text-[10px] text-stone-500 font-medium uppercase">Journeys</div>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-100 text-center">
                        <div className="text-lg font-bold text-amber-600">{client.stats?.openTasks || 0}</div>
                        <div className="text-[10px] text-stone-500 font-medium uppercase">Tasks</div>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-100 text-center">
                        <div className={cn("text-lg font-bold", client.stats?.outstanding > 0 ? "text-rose-600" : "text-stone-600")}>
                            ${client.stats?.outstanding || 0}
                        </div>
                        <div className="text-[10px] text-stone-500 font-medium uppercase">Due</div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center px-4 border-b border-stone-200 bg-white overflow-x-auto no-scrollbar">
                {['Overview', 'Sessions', 'Journeys', 'Tasks', 'Notes', 'Payments'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                            activeTab === tab
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5">
                {activeTab === 'Overview' && (
                    <div className="space-y-6">
                        <section>
                            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Health Goals</h4>
                            <div className="flex flex-wrap gap-2">
                                {client.goals && client.goals.map(goal => (
                                    <span key={goal} className="px-2.5 py-1.5 bg-white border border-stone-200 text-stone-600 text-sm rounded-lg shadow-sm">
                                        {goal}
                                    </span>
                                ))}
                                <button className="px-2.5 py-1.5 bg-stone-100 border border-stone-200 border-dashed text-stone-400 hover:text-blue-600 hover:border-blue-300 text-sm rounded-lg transition-colors flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Add
                                </button>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Recent Notes</h4>
                            {client.notes && client.notes.length > 0 ? (
                                <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 text-sm text-stone-700 italic relative">
                                    "{client.notes[0].content}"
                                    <div className="mt-2 text-xs text-stone-400 not-italic font-medium">{client.notes[0].date}</div>
                                </div>
                            ) : (
                                <div className="text-stone-400 text-sm italic">No notes yet</div>
                            )}
                        </section>

                        <section>
                            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Care Team</h4>
                            {client.practitioner ? (
                                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-200">
                                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold border border-cyan-200 text-xs">DR</div>
                                    <div>
                                        <div className="font-semibold text-stone-900 text-sm">{client.practitioner}</div>
                                        <div className="text-xs text-stone-500">Nutritionist</div>
                                    </div>
                                </div>
                            ) : (
                                <button className="w-full py-3 border border-dashed border-stone-300 rounded-xl text-stone-400 text-sm hover:border-blue-400 hover:text-blue-600 transition-colors">
                                    Refer to Practitioner
                                </button>
                            )}
                        </section>
                    </div>
                )}

                {activeTab === 'Sessions' && (
                    <div className="space-y-2">
                        {client.recentSessions && client.recentSessions.map((session, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-stone-200 hover:border-blue-300 cursor-pointer transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-stone-900 group-hover:text-blue-600">{session.title}</div>
                                        <div className="text-xs text-stone-500">{session.date} • {session.duration}</div>
                                    </div>
                                </div>
                                <span className={cn("text-xs font-medium px-2 py-1 rounded-md", session.status === 'completed' ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-600")}>
                                    {session.status}
                                </span>
                            </div>
                        ))}
                        <button className="w-full py-2 text-xs text-stone-500 hover:text-blue-600 font-medium">View All History</button>
                    </div>
                )}

                {activeTab === 'Journeys' && (
                    <div className="space-y-4">
                        {client.activeJourney ? (
                            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-stone-900">{client.activeJourney.title}</h4>
                                        <p className="text-xs text-stone-500 mt-0.5">Active Journey</p>
                                    </div>
                                    <span className="text-lg font-bold text-emerald-600">{client.activeJourney.progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${client.activeJourney.progress}%` }} />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-stone-400 text-sm">No active journeys</div>
                        )}
                    </div>
                )}

                {activeTab === 'Tasks' && (
                    <div className="space-y-2">
                        {client.tasks && client.tasks.map((task, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-stone-200 hover:border-amber-300 transition-colors cursor-pointer group">
                                <div className="w-5 h-5 mt-0.5 rounded border border-stone-300 group-hover:border-amber-500 transition-colors flex items-center justify-center">
                                    {/* Checkbox */}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-stone-800 font-medium leading-tight mb-1 group-hover:text-amber-900">{task.title}</p>
                                    <p className="text-xs text-amber-600 font-medium">Due {task.dueDate}</p>
                                </div>
                            </div>
                        ))}
                        <button className="flex items-center gap-2 text-sm text-stone-500 hover:text-blue-600 px-2 py-1">
                            <Plus className="w-4 h-4" /> Add Task
                        </button>
                    </div>
                )}

                {activeTab === 'Notes' && (
                    <div className="space-y-3">
                        {client.notes && client.notes.map(note => (
                            <div key={note.id} className="p-3 bg-white rounded-lg border border-stone-200 shadow-sm">
                                <p className="text-sm text-stone-700 mb-2">{note.content}</p>
                                <p className="text-xs text-stone-400 text-right">{note.date}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'Payments' && (
                    <div className="p-4 bg-white rounded-xl border border-stone-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-stone-500 text-sm">Outstanding Balance</span>
                            <span className={cn("text-xl font-bold", client.stats?.outstanding > 0 ? "text-rose-600" : "text-emerald-600")}>
                                ${client.stats?.outstanding || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                            <span className="text-stone-500 text-sm">Total Paid (YTD)</span>
                            <span className="text-stone-900 font-bold">${client.stats?.totalPaid || 0}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-stone-200 bg-white flex justify-between items-center shrink-0">
                <button className="text-xs font-medium text-stone-500 hover:text-stone-900">
                    Edit Details
                </button>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
                        <CheckSquare className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        New Session
                    </button>
                </div>
            </div>
        </div>
    );
}
