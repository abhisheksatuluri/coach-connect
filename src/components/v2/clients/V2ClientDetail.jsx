import React from 'react';
import {
    MoreHorizontal, Edit, MessageSquare, Plus, Mail, Phone,
    Target, Calendar, Clock, FileText, CheckSquare, CreditCard, ChevronDown, Map, Video, TrendingUp, UserPlus, Link, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SectionHeader = ({ title, action, isCollapsed }) => (
    <div className="flex items-center justify-between py-3 px-1 mt-4 border-b border-slate-800/50 group cursor-pointer hover:bg-slate-800/30 rounded-t">
        <div className="flex items-center gap-2">
            <ChevronDown className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h4>
        </div>
        {action && (
            <button className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-white transition-colors">
                {action}
            </button>
        )}
    </div>
);

export default function V2ClientDetail({ client }) {
    if (!client) return (
        <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Select a client to view details
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-900 text-slate-200">

            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-800 bg-slate-900">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold text-slate-300 ring-4 ring-slate-800">
                            {client.initials}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {client.name}
                                <Badge className={cn("text-[10px] h-5 px-1.5 border-0", client.status === 'Active' ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400")}>
                                    {client.status}
                                </Badge>
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Joined {client.joinedDate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300">
                            <Edit className="w-3.5 h-3.5 mr-2" /> Edit
                        </Button>
                        <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white border-0">
                            <Plus className="w-3.5 h-3.5 mr-2" /> Session
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Quick Contacts */}
                <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2 hover:text-indigo-400 cursor-pointer transition-colors px-2 py-1 rounded hover:bg-slate-800">
                        <Mail className="w-3.5 h-3.5" /> {client.email}
                    </div>
                    <div className="flex items-center gap-2 hover:text-indigo-400 cursor-pointer transition-colors px-2 py-1 rounded hover:bg-slate-800">
                        <Phone className="w-3.5 h-3.5" /> {client.phone}
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-2">

                    {/* 1. Overview / Stats */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                        {[
                            { label: 'Sessions', value: client.stats?.totalSessions || 0, icon: Video, color: 'text-violet-400' },
                            { label: 'Journeys', value: client.stats?.activeJourneys || 0, icon: Map, color: 'text-emerald-400' },
                            { label: 'Tasks', value: client.stats?.openTasks || 0, icon: CheckSquare, color: 'text-amber-400' },
                            { label: 'Balance', value: `$${client.stats?.outstanding || 0}`, icon: CreditCard, color: client.stats?.outstanding > 0 ? 'text-rose-400' : 'text-slate-400' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-slate-800/50 p-3 rounded border border-slate-700/50 flex flex-col items-center justify-center text-center">
                                <stat.icon className={cn("w-4 h-4 mb-2 opacity-75", stat.color)} />
                                <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Health Goals Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {client.goals && client.goals.map(tag => (
                            <span key={tag} className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 group hover:border-slate-600 transition-colors">
                                <Target className="w-3 h-3 text-indigo-400" /> {tag}
                                <button className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity"><X className="w-3 h-3" /></button>
                            </span>
                        ))}
                        <button className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 px-2 py-1 rounded border border-dashed border-slate-700 hover:border-indigo-500/50 transition-colors">
                            <Plus className="w-3 h-3" /> Add Goal
                        </button>
                    </div>

                    {/* 2. Sessions Section */}
                    <div>
                        <SectionHeader title="Sessions" action={<Plus className="w-4 h-4" />} />
                        <div className="space-y-3 mt-2 pl-4 border-l border-slate-800 ml-2">
                            {client.recentSessions && client.recentSessions.map((session, i) => (
                                <div key={i} className="relative group">
                                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-700 border-2 border-slate-900 group-hover:bg-indigo-500 transition-colors" />
                                    <div className="bg-slate-800/30 p-3 rounded hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-sm text-slate-200">{session.title}</span>
                                            <span className="text-xs text-slate-500">{session.date}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.duration || '60m'}</span>
                                            {session.status === 'completed' && <span className="flex items-center gap-1 text-emerald-500/80"><CheckSquare className="w-3 h-3" /> Completed</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium ml-2">View all past sessions</button>
                        </div>
                    </div>

                    {/* 3. Journeys Section */}
                    <div>
                        <SectionHeader title="Journeys" action={<Plus className="w-4 h-4" />} />
                        <div className="mt-2 text-sm">
                            {client.activeJourney ? (
                                <div className="p-3 bg-slate-800/50 rounded border border-emerald-500/20">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-emerald-400 font-medium">{client.activeJourney.title}</span>
                                        <span className="text-xs text-slate-500">{client.activeJourney.progress}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${client.activeJourney.progress}%` }} />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-slate-500 italic px-2">No active journeys</div>
                            )}
                        </div>
                    </div>

                    {/* 4. Tasks Section */}
                    <div>
                        <SectionHeader title="Tasks" action={<Plus className="w-4 h-4" />} />
                        <div className="space-y-2 mt-2">
                            {client.tasks && client.tasks.map((task, i) => (
                                <div key={i} className="flex items-start gap-3 p-2 hover:bg-slate-800/50 rounded group">
                                    <div className="w-4 h-4 mt-0.5 border border-slate-600 rounded flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/10 transition-colors">
                                        {/* Checkbox Placeholder */}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-300 group-hover:text-white">{task.title}</p>
                                        <p className="text-xs text-slate-500">Due {task.dueDate || 'Soon'}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="flex items-center gap-2 p-2 text-slate-500 hover:text-slate-300 cursor-pointer">
                                <Plus className="w-4 h-4" /> <span className="text-sm">Add task...</span>
                            </div>
                        </div>
                    </div>

                    {/* 5. Notes Section */}
                    <div>
                        <SectionHeader title="Notes" action={<Plus className="w-4 h-4" />} />
                        <div className="space-y-2 mt-2">
                            {client.notes && client.notes.map(note => (
                                <div key={note.id} className="text-sm text-slate-400 bg-slate-800/30 p-3 rounded border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer">
                                    <p className="line-clamp-2 italic">"{note.content}"</p>
                                    <p className="text-[10px] text-slate-600 mt-1 text-right">{note.date}</p>
                                </div>
                            ))}
                            <div className="flex items-center gap-2 p-2 text-slate-500 hover:text-slate-300 cursor-pointer">
                                <Plus className="w-4 h-4" /> <span className="text-sm">Add note...</span>
                            </div>
                        </div>
                    </div>

                    {/* 6. Payments Section */}
                    <div>
                        <SectionHeader title="Payments" />
                        <div className="mt-2 flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-800">
                            <span className="text-slate-400 text-sm">Outstanding Balance</span>
                            <span className={cn("text-lg font-bold", client.stats?.outstanding > 0 ? "text-rose-400" : "text-emerald-400")}>
                                ${client.stats?.outstanding || 0}
                            </span>
                        </div>
                    </div>

                    {/* 7. Practitioners */}
                    <div>
                        <SectionHeader title="Care Team" action={<UserPlus className="w-4 h-4" />} />
                        <div className="mt-2">
                            {client.practitioner ? (
                                <div className="flex items-center gap-3 p-2 bg-slate-800/30 rounded border border-slate-800">
                                    <div className="w-8 h-8 rounded-full bg-cyan-900/30 text-cyan-400 flex items-center justify-center text-xs font-bold border border-cyan-800">DR</div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-slate-200">{client.practitioner}</div>
                                        <div className="text-xs text-slate-500">Nutritionist</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-slate-500 italic text-sm px-2">No assigned practitioner</div>
                            )}
                        </div>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
}
