import React, { useState } from 'react';
import { Mail, Phone, Clock, ChevronDown, ChevronRight, CheckSquare, Map, FileText, CreditCard, Send, MoreHorizontal, Video, TrendingUp, Calendar, AlertCircle, Copy, UserPlus, Stethoscope, Plus, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import V3Overlay from '@/components/v3/V3Overlay';

const StatCard = ({ label, value, subtext, icon: Icon, color }) => (
    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex flex-col items-center text-center">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mb-2", color.bg, color.text)}>
            <Icon className="w-4 h-4" />
        </div>
        <div className="text-xl font-semibold text-stone-900 leading-none mb-1">{value}</div>
        <div className="text-xs text-stone-500 font-medium">{label}</div>
        {subtext && <div className="text-[10px] text-stone-400 mt-1">{subtext}</div>}
    </div>
);

const Section = ({ title, icon: Icon, isOpen: defaultOpen = false, children, badge }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-stone-100 last:border-0 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-2 text-left group outline-none"
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-stone-400 group-hover:text-stone-600 transition-colors" />
                    <span className="font-medium text-stone-700 group-hover:text-stone-900 transition-colors">{title}</span>
                    {badge && <span className="bg-stone-100 text-stone-600 text-xs px-2 py-0.5 rounded-full">{badge}</span>}
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
            </button>
            {isOpen && (
                <div className="pt-4 pl-8 animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export default function V3ClientOverlay({ client, isOpen, onClose }) {
    if (!client) return null;

    return (
        <V3Overlay isOpen={isOpen} onClose={onClose} title="Client Profile">
            {/* Header Profile */}
            <div className="flex flex-col items-center mb-8 relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-3xl font-medium text-stone-500 mb-4 shadow-sm border border-stone-100 relative group cursor-pointer">
                    {client.initials}
                    <div className="absolute inset-0 bg-black/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs text-stone-600 font-medium bg-white/80 px-2 py-1 rounded-full backdrop-blur-sm">Edit</span>
                    </div>
                </div>
                <h2 className="text-2xl font-semibold text-stone-900 mb-1 tracking-tight">{client.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        client.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-stone-100 text-stone-600 border-stone-200"
                    )}>
                        {client.status}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-stone-500 text-xs">Joined {client.joinedDate || 'Recently'}</span>
                </div>

                {/* Quick Actions Bar */}
                <div className="flex gap-2 mb-6">
                    <button className="w-10 h-10 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-white hover:text-teal-600 hover:border-teal-200 transition-all" title="Email">
                        <Mail className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-white hover:text-teal-600 hover:border-teal-200 transition-all" title="Call">
                        <Phone className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-white hover:text-teal-600 hover:border-teal-200 transition-all" title="Copy Info">
                        <Copy className="w-4 h-4" />
                    </button>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-4 gap-3 w-full mb-6">
                    <StatCard
                        label="Sessions"
                        value={client.stats?.totalSessions || 0}
                        icon={Video}
                        color={{ bg: 'bg-violet-50', text: 'text-violet-600' }}
                    />
                    <StatCard
                        label="Journeys"
                        value={client.stats?.activeJourneys || 0}
                        subtext="1 Active"
                        icon={Map}
                        color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
                    />
                    <StatCard
                        label="Tasks"
                        value={client.stats?.openTasks || 0}
                        subtext="Open"
                        icon={CheckSquare}
                        color={{ bg: 'bg-amber-50', text: 'text-amber-600' }}
                    />
                    <StatCard
                        label="Balance"
                        value={`$${client.stats?.outstanding || 0}`}
                        subtext={client.stats?.outstanding > 0 ? "Overdue" : "Clear"}
                        icon={CreditCard}
                        color={{ bg: client.stats?.outstanding > 0 ? 'bg-rose-50' : 'bg-stone-50', text: client.stats?.outstanding > 0 ? 'text-rose-600' : 'text-stone-500' }}
                    />
                </div>
            </div>

            <div className="space-y-1 pb-24">

                {/* Health Goals */}
                <div className="px-1 mb-6">
                    <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Health Goals</h4>
                    <div className="flex flex-wrap gap-2">
                        {client.goals && client.goals.map(goal => (
                            <span key={goal} className="px-3 py-1.5 bg-white border border-stone-200 text-stone-600 text-xs font-medium rounded-full shadow-sm flex items-center gap-2 group hover:border-teal-200 transition-colors cursor-default">
                                {goal}
                                <button className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity"><X className="w-3 h-3" /></button>
                            </span>
                        ))}
                        <button className="px-3 py-1.5 bg-stone-50 border border-dashed border-stone-300 text-stone-400 text-xs font-medium rounded-full hover:bg-white hover:border-teal-300 hover:text-teal-600 transition-colors flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Add Goal
                        </button>
                    </div>
                </div>

                {/* Section 1: Sessions */}
                <Section title="Sessions" icon={Video} isOpen={true} badge={client.stats?.totalSessions}>
                    {client.nextSession && (
                        <div className="flex items-center gap-3 p-3 bg-violet-50/50 rounded-xl mb-3 border border-violet-100">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-violet-600 shadow-sm">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs text-violet-600 font-medium uppercase tracking-wide">Next Session</div>
                                <div className="text-sm font-semibold text-stone-900">{client.nextSession}</div>
                            </div>
                        </div>
                    )}
                    <div className="space-y-1">
                        {/* Placeholder for list until prop drilled or fetched */}
                        <div className="flex justify-between items-center p-2 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-stone-300 group-hover:bg-violet-500 transition-colors" />
                                <span className="text-stone-700 text-sm font-medium">Weekly Check-in</span>
                            </div>
                            <span className="text-xs text-stone-400">Mar 20</span>
                        </div>
                        <div className="flex justify-between items-center p-2 hover:bg-stone-50 rounded-lg transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="text-stone-700 text-sm font-medium">Goal Setting (Completed)</span>
                            </div>
                            <span className="text-xs text-stone-400">Mar 12</span>
                        </div>
                        <button className="w-full text-center text-xs text-stone-400 hover:text-teal-600 font-medium py-2 mt-2 transition-colors">
                            View All History
                        </button>
                    </div>
                </Section>

                {/* Section 2: Journeys */}
                <Section title="Journeys" icon={Map} badge={client.stats?.activeJourneys}>
                    {client.stats?.activeJourneys > 0 ? (
                        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm relative overflow-hidden group hover:border-teal-200 transition-colors cursor-pointer">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="text-xs text-emerald-600 font-medium mb-1">Active Journey</div>
                                    <h4 className="font-semibold text-stone-900 text-sm">12-Week Transformation</h4>
                                </div>
                                <span className="text-xs font-bold text-stone-400">Step 4/12</span>
                            </div>
                            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '33%' }} />
                            </div>
                            <div className="flex justify-between text-[11px] text-stone-500">
                                <span>Stress Management</span>
                                <span>33% Complete</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                            <Map className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                            <p className="text-sm text-stone-500 font-medium">No Active Journeys</p>
                            <button className="text-xs text-teal-600 font-medium mt-1 hover:underline">Enroll in Journey</button>
                        </div>
                    )}
                </Section>

                {/* Section 3: Tasks */}
                <Section title="Tasks" icon={CheckSquare} badge={client.stats?.openTasks}>
                    {/* Mock task list derived from new data layer or props */}
                    <div className="space-y-2">
                        <div className="flex items-start gap-3 p-2 hover:bg-stone-50 rounded-lg transition-colors group cursor-pointer">
                            <div className="mt-0.5 w-4 h-4 rounded border border-stone-300 group-hover:border-teal-500 transition-colors flex items-center justify-center">
                                {/* Check icon on hover or completed */}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-stone-800 font-medium leading-none mb-1">Review diet log</div>
                                <div className="text-xs text-rose-500 font-medium">Due Today</div>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="+ Add new task..."
                            className="w-full text-sm py-2 px-3 bg-transparent hover:bg-stone-50 focus:bg-white border border-transparent focus:border-stone-200 rounded-lg outline-none transition-all placeholder:text-stone-400"
                        />
                    </div>
                </Section>

                {/* Section 4: Notes */}
                <Section title="Notes" icon={FileText} badge={client.stats?.totalNotes}>
                    <div className="space-y-3">
                        {client.notes && client.notes.map(note => (
                            <div key={note.id} className="p-3 bg-amber-50/30 rounded-lg border border-amber-100/50 hover:bg-amber-50 transition-colors cursor-pointer group">
                                <p className="text-sm text-stone-700 line-clamp-2 mb-1.5 group-hover:text-stone-900">
                                    {note.content}
                                </p>
                                <div className="text-[10px] text-stone-400">{note.date}</div>
                            </div>
                        ))}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Write a note..."
                                className="w-full pl-3 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-teal-600 transition-colors">
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </Section>

                {/* Section 5: Payments */}
                <Section title="Payments" icon={CreditCard} badge={client.stats?.outstanding > 0 ? '!' : null}>
                    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-stone-100">
                                <TrendingUp className="w-4 h-4 text-stone-400" />
                            </div>
                            <div>
                                <div className="text-xs text-stone-500 uppercase font-medium">Revenue (YTD)</div>
                                <div className="text-sm font-bold text-stone-900">${client.stats?.totalPaid || 0}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-stone-500 uppercase font-medium">Outstanding</div>
                            <div className={cn("text-sm font-bold", client.stats?.outstanding > 0 ? "text-rose-600" : "text-emerald-600")}>
                                ${client.stats?.outstanding || 0}
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Section 6: Practitioners */}
                <Section title="Care Team" icon={Stethoscope}>
                    {client.practitioner ? (
                        <div className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg border border-stone-100">
                            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 text-xs font-bold font-mono">DR</div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-stone-900">{client.practitioner}</div>
                                <div className="text-xs text-stone-500">Nutritionist</div>
                            </div>
                        </div>
                    ) : (
                        <button className="w-full py-2 border border-dashed border-stone-300 rounded-lg text-xs font-medium text-stone-500 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50/10 transition-colors flex items-center justify-center gap-2">
                            <UserPlus className="w-3 h-3" /> Refer to Practitioner
                        </button>
                    )}
                </Section>

            </div>

            {/* Bottom Floating Action Bar */}
            <div className="absolute bottom-6 left-6 right-6">
                <div className="flex gap-2">
                    <Button className="flex-1 bg-stone-900 hover:bg-black text-white rounded-xl h-12 shadow-lg shadow-stone-900/20 border-0 font-medium tracking-wide">
                        <Video className="w-4 h-4 mr-2" /> Start Session
                    </Button>
                    <Button variant="outline" className="w-12 h-12 rounded-xl bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-teal-700 hover:border-teal-200 p-0 shadow-sm">
                        <MoreHorizontal className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </V3Overlay>
    );
}
