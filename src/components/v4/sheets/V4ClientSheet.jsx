import React from 'react';
import V4BottomSheet from '@/components/v4/V4BottomSheet';
import { User, Video, Map, CheckSquare, Mail, Phone, ExternalLink, Plus, Clock, FileText, CreditCard, Send, MoreHorizontal, TrendingUp, Calendar, Target, X, Copy, UserPlus, Stethoscope } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Section = ({ title, icon: Icon, children, badge }) => (
    <div className="py-4 border-b border-stone-100 last:border-0">
        <div className="flex items-center gap-2 mb-3">
            <Icon className="w-4 h-4 text-stone-400" />
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">{title}</h4>
            {badge && <span className="bg-stone-100 text-stone-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
        </div>
        {children}
    </div>
);

export default function V4ClientSheet({ client, isOpen, onClose }) {
    if (!client) return null;

    return (
        <V4BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={client.name || 'Client Details'}
        >
            <div className="space-y-6 pb-24">
                {/* Header Profile */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-xl border-2 border-white shadow-sm ring-1 ring-stone-100">
                        {client.initials}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-stone-900">{client.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={cn("inline-block w-2 h-2 rounded-full", client.status === 'Active' ? "bg-emerald-500" : "bg-stone-400")} />
                            <span className="text-sm text-stone-500 font-medium">{client.status} Client</span>
                            <span className="text-stone-300">•</span>
                            <span className="text-xs text-stone-400">Joined {client.joinedDate}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-2">
                    <div className="p-3 bg-stone-50 rounded-xl text-center border border-stone-100">
                        <div className="text-lg font-bold text-violet-600">{client.stats?.totalSessions || 0}</div>
                        <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Sessions</div>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl text-center border border-stone-100">
                        <div className="text-lg font-bold text-emerald-600">{client.stats?.activeJourneys || 0}</div>
                        <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Journeys</div>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl text-center border border-stone-100">
                        <div className="text-lg font-bold text-amber-600">{client.stats?.openTasks || 0}</div>
                        <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Tasks</div>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl text-center border border-stone-100">
                        <div className={cn("text-lg font-bold", client.stats?.outstanding > 0 ? "text-rose-600" : "text-stone-600")}>
                            ${client.stats?.outstanding || 0}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Due</div>
                    </div>
                </div>

                {/* Contact Bar */}
                <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm font-medium transition-colors">
                        <Mail className="w-4 h-4" /> Email
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm font-medium transition-colors">
                        <Phone className="w-4 h-4" /> Call
                    </button>
                    <button className="w-10 flex items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors">
                        <Copy className="w-4 h-4" />
                    </button>
                </div>

                {/* Goals */}
                <div>
                    <div className="flex flex-wrap gap-2">
                        {client.goals && client.goals.map(goal => (
                            <span key={goal} className="px-2.5 py-1 bg-white border border-stone-200 text-stone-600 text-xs font-medium rounded-full shadow-sm flex items-center gap-1.5">
                                {goal}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Detailed Sections */}
                <div className="border rounded-xl border-stone-200 divide-y divide-stone-100 overflow-hidden">
                    {/* Sessions */}
                    <div className="bg-white p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Video className="w-4 h-4 text-stone-400" />
                            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Recent Sessions</h4>
                        </div>
                        <div className="space-y-3 pl-2 border-l-2 border-stone-100 ml-1">
                            {client.recentSessions && client.recentSessions.map((session, i) => (
                                <div key={i} className="pl-3 relative">
                                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-stone-300 ring-4 ring-white" />
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-medium text-stone-900 block">{session.title}</span>
                                        <span className="text-xs text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded">{session.date}</span>
                                    </div>
                                    <div className="text-xs text-stone-500 mt-0.5">{session.duration} • {session.status}</div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-3 text-xs text-center text-violet-600 font-medium hover:underline">View All Sessions</button>
                    </div>

                    {/* Active Journey */}
                    <div className="bg-stone-50/50 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Map className="w-4 h-4 text-stone-400" />
                            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Active Journey</h4>
                        </div>
                        {client.activeJourney ? (
                            <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-stone-900 text-sm">{client.activeJourney.title}</span>
                                    <span className="text-xs font-bold text-emerald-600">{client.activeJourney.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${client.activeJourney.progress}%` }} />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-2 text-stone-400 text-sm italic">No active journey</div>
                        )}
                    </div>

                    {/* Tasks */}
                    <div className="bg-white p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckSquare className="w-4 h-4 text-stone-400" />
                            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Open Tasks</h4>
                        </div>
                        <div className="space-y-2">
                            {client.tasks && client.tasks.map((task, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-4 h-4 mt-0.5 border border-stone-300 rounded flex items-center justify-center" />
                                    <div className="flex-1">
                                        <p className="text-sm text-stone-800 font-medium leading-none mb-1">{task.title}</p>
                                        <p className="text-[10px] text-stone-400 uppercase font-bold">Due {task.dueDate}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions Fixed Bottom */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-stone-200 flex gap-3 z-50">
                    <Button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-12 shadow-sm border-0 gap-2">
                        <Video className="w-4 h-4" /> Start Session
                    </Button>
                    <Button variant="outline" className="w-12 h-12 rounded-xl flex items-center justify-center p-0 border-stone-200">
                        <MoreHorizontal className="w-5 h-5 text-stone-600" />
                    </Button>
                </div>
            </div>
        </V4BottomSheet>
    );
}
