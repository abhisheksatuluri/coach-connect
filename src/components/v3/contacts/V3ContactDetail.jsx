
import React, { useState } from 'react';
import {
    ArrowLeft, Mail, Phone, Calendar, MapPin, Target, Sparkles, ChevronRight,
    FileText, CheckSquare, Map, CreditCard, Clock, AlertCircle, Plus
} from 'lucide-react';
import { useStackNavigation } from '@/context/StackNavigationContext';
import { cn } from "@/lib/utils";
import { format, differenceInDays } from 'date-fns';
import { sessionsData, notesData, tasksData, journeysData, paymentsData } from '@/data/v3DummyData';

// Placeholder Detail Screens (in a real app these would be imported)
const PlaceholderDetail = ({ title }) => (
    <div className="flex flex-col h-full bg-[#FAFAF9] p-8">
        <h1 className="text-2xl font-bold">{title} Detail</h1>
        <p className="text-stone-500 mt-4">This screen is under construction.</p>
    </div>
);

export default function V3ContactDetail({ contact }) {
    const { popScreen, pushScreen } = useStackNavigation();

    // For practitioners, show "Referrals" instead of "Sessions" in tabs? 
    // Or just handle inside the Sessions tab logic.
    const isPractitioner = contact.type === 'Practitioner';
    const isLead = contact.type === 'Lead';

    const defaultTab = isPractitioner ? 'Overview' : 'Overview';
    const [activeTab, setActiveTab] = useState(defaultTab);

    // --- DATA FILTERING ---
    const contactSessions = sessionsData.filter(s => s.contactId === contact.id).sort((a, b) => b.date - a.date);
    const contactNotes = notesData.filter(n => n.contactId === contact.id);
    const contactTasks = tasksData.filter(t => t.contactId === contact.id).sort((a, b) => a.dueDate - b.dueDate);
    const contactPayments = paymentsData.filter(p => p.contactId === contact.id);

    // Journeys logic: find journeys where contact is a participant
    const contactJourneys = journeysData.filter(j =>
        j.participants.some(p => p.contactId === contact.id)
    ).map(j => {
        const participant = j.participants.find(p => p.contactId === contact.id);
        return { ...j, currentStep: participant.currentStep, progress: Math.round((participant.currentStep / j.totalSteps) * 100) };
    });

    // Helper to get referral data for Practitioners (Simulated)
    const practitionerReferrals = isPractitioner ? [
        { id: 'ref1', name: 'Sarah Mitchell', date: '2 months ago', status: 'Active' },
        { id: 'ref2', name: 'James Cooper', date: '1 month ago', status: 'Completed' }
    ] : [];


    // --- RENDERING HELPERS ---

    const renderEmptyState = (message, actionLabel, icon) => {
        const Icon = icon;
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50/50">
                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mb-4">
                    <Icon className="w-5 h-5" />
                </div>
                <p className="text-stone-500 font-medium mb-4">{message}</p>
                {actionLabel && (
                    <button className="px-4 py-2 bg-white text-stone-900 border border-stone-200 rounded-xl text-sm font-bold hover:bg-stone-50 transition-colors shadow-sm">
                        {actionLabel}
                    </button>
                )}
            </div>
        );
    };

    const renderSectionHeader = (title, count, onSeeAll) => (
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                {title}
                {count > 0 && <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-extrabold">{count}</span>}
            </h3>
            {count > 3 && (
                <button onClick={onSeeAll} className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                    See All <ChevronRight className="w-3 h-3" />
                </button>
            )}
        </div>
    );

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

            {/* Content SCROLLABLE */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                {/* Profile Card */}
                <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className={cn("w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold shadow-inner flex-shrink-0", contact.avatarColor)}>
                        {contact.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <a href={`mailto:${contact.email}`} className="p-3 rounded-2xl bg-stone-50 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-3 group w-full">
                                <div className="p-2 bg-white rounded-full shadow-sm text-stone-400 group-hover:text-teal-600"><Mail className="w-4 h-4" /></div>
                                <div className="text-sm font-medium truncate">{contact.email}</div>
                            </a>
                            {contact.phone && (
                                <a href={`tel:${contact.phone}`} className="p-3 rounded-2xl bg-stone-50 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center gap-3 group w-full">
                                    <div className="p-2 bg-white rounded-full shadow-sm text-stone-400 group-hover:text-teal-600"><Phone className="w-4 h-4" /></div>
                                    <div className="text-sm font-medium truncate">{contact.phone}</div>
                                </a>
                            )}
                        </div>

                        {contact.goals && contact.goals.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {contact.goals.map(g => (
                                    <span key={g} className="px-3 py-1 rounded-lg bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Target className="w-3 h-3" /> {g}
                                    </span>
                                ))}
                            </div>
                        )}

                        {isPractitioner && (
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <span className="px-3 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
                                    {contact.specialty}
                                </span>
                            </div>
                        )}

                        {isLead && (
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <span className="px-3 py-1 rounded-lg bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
                                    Pending Lead
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                {/* Dynamically available tabs based on type */}
                <div className="flex items-center gap-2 border-b border-stone-200 px-0 overflow-x-auto no-scrollbar mask-gradient-right">
                    {['Overview', 'Sessions', 'Journeys', 'Tasks', 'Notes', 'Payments'].map(tab => {
                        // Hide unrelated tabs for Practitioners
                        if (isPractitioner && ['Journeys', 'Tasks', 'Payments'].includes(tab)) return null;

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "pb-3 px-4 text-sm font-bold transition-all relative whitespace-nowrap",
                                    activeTab === tab ? "text-teal-600" : "text-stone-400 hover:text-stone-600"
                                )}
                            >
                                {tab === 'Sessions' && isPractitioner ? 'Referrals' : tab}
                                {activeTab === tab && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* TAB CONTENT */}
                <div className="min-h-[300px] animate-in slide-in-from-bottom-2 duration-300">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'Overview' && (
                        <div className="space-y-8">
                            {/* Stats Row */}
                            {!isPractitioner && !isLead && (
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-4 rounded-2xl bg-white border border-stone-100 shadow-sm text-center">
                                        <div className="text-2xl font-bold text-stone-900">{contactSessions.length}</div>
                                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Sessions</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white border border-stone-100 shadow-sm text-center">
                                        <div className="text-2xl font-bold text-stone-900">{contactJourneys.length}</div>
                                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Journeys</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white border border-stone-100 shadow-sm text-center">
                                        <div className="text-2xl font-bold text-stone-900">{contact.status === 'Active' ? '98%' : '-'}</div>
                                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Health Score</div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Sessions / Next Up */}
                            {!isPractitioner && (
                                <div className="space-y-4">
                                    {renderSectionHeader('Sessions', contactSessions.length, () => setActiveTab('Sessions'))}
                                    {contactSessions.length > 0 ? (
                                        contactSessions.slice(0, 3).map(s => (
                                            <button key={s.id} onClick={() => pushScreen(PlaceholderDetail, { title: s.title })} className="w-full bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4 hover:border-teal-200 transition-all text-left group">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs uppercase flex-shrink-0",
                                                    s.status === 'Upcoming' ? "bg-teal-50 text-teal-600" : "bg-stone-100 text-stone-500"
                                                )}>
                                                    <span>{format(s.date, 'd')}</span>
                                                    <span>{format(s.date, 'MMM')}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-stone-900 truncate group-hover:text-teal-700 transition-colors">{s.title}</div>
                                                    <div className="text-xs text-stone-500 flex items-center gap-2">
                                                        <span>{s.duration} min • {s.type}</span>
                                                        {s.status === 'Completed' && s.aiSummary && <Sparkles className="w-3 h-3 text-amber-500" />}
                                                    </div>
                                                </div>
                                                {s.status === 'Upcoming' && (
                                                    <div className="px-3 py-1 bg-teal-100 text-teal-700 text-[10px] font-bold uppercase rounded-full">Upcoming</div>
                                                )}
                                            </button>
                                        ))
                                    ) : renderEmptyState("No sessions yet", "Schedule Session", Calendar)}
                                </div>
                            )}

                            {/* Recent Notes */}
                            <div className="space-y-4">
                                {renderSectionHeader('Recent Notes', contactNotes.length, () => setActiveTab('Notes'))}
                                {contactNotes.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {contactNotes.slice(0, 2).map(n => (
                                            <button key={n.id} onClick={() => pushScreen(PlaceholderDetail, { title: n.title })} className="p-4 bg-yellow-50/50 hover:bg-yellow-50 border border-yellow-100 rounded-2xl space-y-2 text-left transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-bold text-stone-900">{n.title}</div>
                                                    <FileText className="w-4 h-4 text-yellow-600/50" />
                                                </div>
                                                <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">{n.content}</p>
                                                <div className="text-[10px] font-bold text-yellow-700/60 uppercase tracking-wider">{n.category}</div>
                                            </button>
                                        ))}
                                    </div>
                                ) : renderEmptyState("No notes added", "Add Note", FileText)}
                            </div>
                        </div>
                    )}


                    {/* SESSIONS TAB */}
                    {activeTab === 'Sessions' && (
                        <div className="space-y-4">
                            {isPractitioner ? (
                                // REFERRALS LIST FOR PRACTITIONER
                                practitionerReferrals.length > 0 ? (
                                    practitionerReferrals.map(ref => (
                                        <div key={ref.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-stone-900">{ref.name}</div>
                                                <div className="text-xs text-stone-500">Referred {ref.date}</div>
                                            </div>
                                            <span className={cn("px-3 py-1 rounded-full text-xs font-bold", ref.status === 'Active' ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-600")}>
                                                {ref.status}
                                            </span>
                                        </div>
                                    ))
                                ) : renderEmptyState("No referrals yet", null, Users)
                            ) : (
                                // STANDARD SESSIONS LIST
                                contactSessions.length > 0 ? (
                                    contactSessions.map(s => (
                                        <button key={s.id} onClick={() => pushScreen(PlaceholderDetail, { title: s.title })} className="w-full bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4 hover:border-teal-200 transition-all text-left">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs uppercase flex-shrink-0",
                                                s.status === 'Upcoming' ? "bg-teal-50 text-teal-600" : "bg-stone-100 text-stone-500"
                                            )}>
                                                <span>{format(s.date, 'd')}</span>
                                                <span>{format(s.date, 'MMM')}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-stone-900">{s.title}</div>
                                                <div className="text-xs text-stone-500">{s.duration} min • {s.type}</div>
                                            </div>
                                            {s.aiSummary && <Sparkles className="w-4 h-4 text-amber-500" />}
                                        </button>
                                    ))
                                ) : renderEmptyState("No sessions found", "Schedule Consultation", Calendar)
                            )}
                        </div>
                    )}


                    {/* JOURNEYS TAB */}
                    {activeTab === 'Journeys' && (
                        <div className="space-y-4">
                            {contactJourneys.length > 0 ? (
                                contactJourneys.map(j => (
                                    <button key={j.id} onClick={() => pushScreen(PlaceholderDetail, { title: j.title })} className="w-full bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all text-left space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-bold text-stone-900 text-lg">{j.title}</h4>
                                                <span className="text-xs font-medium text-stone-500">Step {j.currentStep} of {j.totalSteps}</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Map className="w-5 h-5" />
                                            </div>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                                style={{ width: `${j.progress}%` }}
                                            />
                                        </div>
                                    </button>
                                ))
                            ) : renderEmptyState("Not enrolled in any journeys", "Enroll in Journey", Map)}
                        </div>
                    )}


                    {/* TASKS TAB */}
                    {activeTab === 'Tasks' && (
                        <div className="space-y-3">
                            {contactTasks.length > 0 ? (
                                contactTasks.map(t => (
                                    <div key={t.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex items-start gap-4 hover:border-teal-200 transition-colors">
                                        <button className={cn(
                                            "w-6 h-6 rounded-lg border-2 mt-0.5 flex items-center justify-center transition-colors",
                                            t.completed ? "bg-teal-500 border-teal-500 text-white" : "border-stone-300 hover:border-teal-500"
                                        )}>
                                            {t.completed && <CheckSquare className="w-4 h-4" />}
                                        </button>
                                        <div className="flex-1">
                                            <div className={cn("font-medium text-stone-900", t.completed && "line-through text-stone-400")}>{t.title}</div>
                                            <div className="flex items-center gap-3 mt-1 text-xs">
                                                <span className={cn(
                                                    "font-bold",
                                                    t.overdue && !t.completed ? "text-red-600" : "text-stone-500"
                                                )}>
                                                    Due {format(t.dueDate, 'MMM d')}
                                                </span>
                                                <span className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    t.priority === 'High' ? "bg-red-500" : t.priority === 'Medium' ? "bg-amber-500" : "bg-green-500"
                                                )} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : renderEmptyState("No tasks pending", "Create Task", CheckSquare)}
                        </div>
                    )}


                    {/* NOTES TAB */}
                    {activeTab === 'Notes' && (
                        <div className="space-y-4">
                            {contactNotes.length > 0 ? (
                                contactNotes.map(n => (
                                    <button key={n.id} onClick={() => pushScreen(PlaceholderDetail, { title: n.title })} className="w-full text-left bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-stone-900">{n.title}</h4>
                                            <span className="text-xs text-stone-400">{n.category}</span>
                                        </div>
                                        <p className="text-sm text-stone-600 line-clamp-3">{n.content}</p>
                                    </button>
                                ))
                            ) : renderEmptyState("No notes yet", "Create Note", FileText)}
                        </div>
                    )}


                    {/* PAYMENTS TAB */}
                    {activeTab === 'Payments' && (
                        <div className="space-y-3">
                            {contactPayments.length > 0 ? (
                                contactPayments.map(p => (
                                    <div key={p.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400">
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-stone-900">£{p.amount}</div>
                                                <div className="text-xs text-stone-500">
                                                    {p.status === 'Paid' ? `Paid in ${p.date}` : `Due in ${differenceInDays(p.dueDate, new Date())} days`}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-bold",
                                            p.status === 'Paid' ? "bg-green-100 text-green-700" :
                                                p.status === 'Overdue' ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                                        )}>
                                            {p.status}
                                        </span>
                                    </div>
                                ))
                            ) : renderEmptyState("No recent payments", null, CreditCard)}
                        </div>
                    )}

                    {/* End Space for Scrolling Area */}
                    <div className="h-24"></div>
                </div>
            </div>
        </div>
    );
}
