
import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Target, Sparkles, ChevronRight, FileText } from 'lucide-react';
import { useStackNavigation } from '@/context/StackNavigationContext';
import { cn } from "@/lib/utils";
import { sessionsData, notesData } from '@/data/v3DummyData';

export default function V3ContactDetail({ contact }) {
    const { popScreen } = useStackNavigation();
    const [activeTab, setActiveTab] = useState('Overview');

    // Filter related data
    const contactSessions = sessionsData.filter(s => s.contactId === contact.id);
    const contactNotes = notesData.filter(n => n.contactId === contact.id);

    return (
        <div className="flex flex-col h-full bg-[#FAFAF9]">
            {/* Header */}
            <div className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 transition-all">
                <div className="flex items-center gap-3">
                    <button
                        onClick={popScreen}
                        className="p-2 -ml-2 text-stone-500 hover:text-stone-900 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-semibold text-stone-900 leading-tight">{contact.name}</h1>
                        <span className="text-xs text-stone-500 font-medium">{contact.type} • {contact.status}</span>
                    </div>
                </div>
                <button className="px-4 py-1.5 bg-stone-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-stone-700 transition-colors">
                    Edit
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                {/* Profile Card */}
                <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className={cn("w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner", contact.avatarColor)}>
                        {contact.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4 w-full">
                        <div className="grid grid-cols-2 gap-4">
                            <a href={`mailto:${contact.email}`} className="p-3 rounded-2xl bg-stone-50 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-3 group">
                                <div className="p-2 bg-white rounded-full shadow-sm text-stone-400 group-hover:text-teal-600"><Mail className="w-4 h-4" /></div>
                                <div className="text-sm font-medium truncate">{contact.email}</div>
                            </a>
                            {contact.phone && (
                                <a href={`tel:${contact.phone}`} className="p-3 rounded-2xl bg-stone-50 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-3 group">
                                    <div className="p-2 bg-white rounded-full shadow-sm text-stone-400 group-hover:text-teal-600"><Phone className="w-4 h-4" /></div>
                                    <div className="text-sm font-medium truncate">{contact.phone}</div>
                                </a>
                            )}
                        </div>

                        {contact.goals && (
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {contact.goals.map(g => (
                                    <span key={g} className="px-3 py-1 rounded-lg bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Target className="w-3 h-3" /> {g}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-stone-200 px-2 overflow-x-auto no-scrollbar">
                    {['Overview', 'Sessions', 'Notes', 'Journeys'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "pb-3 text-sm font-semibold transition-all relative whitespace-nowrap",
                                activeTab === tab ? "text-teal-600" : "text-stone-400 hover:text-stone-600"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'Overview' && (
                        <>
                            {/* Recent Activity / Next Up */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Next Session</h3>
                                {contactSessions.filter(s => s.status === 'Upcoming').slice(0, 1).map(s => (
                                    <div key={s.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
                                        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex flex-col items-center justify-center font-bold text-xs uppercase">
                                            <span>24</span>
                                            <span>Mar</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-stone-900">{s.title}</div>
                                            <div className="text-sm text-stone-500">{s.duration} min • Video Call</div>
                                        </div>
                                        <button className="px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold">Start</button>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Notes Preview */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Recent Notes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {contactNotes.slice(0, 2).map(n => (
                                        <div key={n.id} className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-2xl space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="font-bold text-stone-900">{n.title}</div>
                                                <FileText className="w-4 h-4 text-yellow-600/50" />
                                            </div>
                                            <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed">{n.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Add other tab placeholders as this is a demo structure */}
                </div>

                {/* Spacing for bottom nav */}
                <div className="h-20" />
            </div>
        </div>
    );
}
